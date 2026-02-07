import { setCurrentElement } from './injection';
import { setComponentInstance } from './injection';
import { interpolateTemplate, processTwoWayBinding } from './renderer';
import { processForDirectives, processIfDirectives } from './directives';
import { processComponentStyles } from './styles';
import { processPropertyBindings } from './properties';
import { EventEmitter } from '../decorators/output';
import { updateInterpolations, trackInterpolations } from './interpolation-tracker';

export function processImports(root: ParentNode, componentClass?: any, parentContext?: any) {
  if (!componentClass || !componentClass.imports) {
    return;
  }

  componentClass.imports.forEach((ImportedClass: any) => {
    if (ImportedClass.selector && ImportedClass.selector.startsWith('[')) {
      processDirective(root, ImportedClass);
    } else if (ImportedClass.selector && ImportedClass.template) {
      processChildComponent(root, ImportedClass, parentContext);
    }
  });
}

function processDirective(root: ParentNode, DirectiveClass: any) {
  const attributeName = DirectiveClass.selector.replace(/[\[\]]/g, '');
  
  // Look for both plain attribute and binding syntax [attribute]
  const plainElements = root.querySelectorAll(`[${attributeName}]`);
  const bindingElements = root.querySelectorAll(`[\\[${attributeName}\\]]`);
  
  const allElements = [...Array.from(plainElements), ...Array.from(bindingElements)];
  
  allElements.forEach(element => {
    setCurrentElement(element as HTMLElement);
    
    new DirectiveClass();
    
    setCurrentElement(null as any);
  });
}

function processChildComponent(root: ParentNode, ComponentClass: any, parentContext?: any) {
  const elements = root.querySelectorAll(ComponentClass.selector);
  
  elements.forEach(element => {
    const existingId = (element as HTMLElement).getAttribute('angle-component-id');
    
    if (existingId) {
      return;
    }
    
    const instance = new ComponentClass();
    
    let evaluationContext = parentContext;
    let currentEl: HTMLElement | null = element as HTMLElement;
    while (currentEl) {
      const contextData = currentEl.getAttribute('angle-data-local-context');
      if (contextData) {
        try {
          evaluationContext = JSON.parse(contextData);
          if (parentContext) {
            evaluationContext = Object.create(parentContext);
            Object.assign(evaluationContext, JSON.parse(contextData));
          }
          break;
        } catch (e) {
          console.error('Failed to parse context data:', e);
        }
      }
      currentEl = currentEl.parentElement;
    }
    
    if (ComponentClass.__inputs__) {
      ComponentClass.__inputs__.forEach((inputKey: string) => {
        const bindingAttr = `[${inputKey}]`;
        let inputValue = (element as HTMLElement).getAttribute(bindingAttr);
        
        if (inputValue === null) {
          inputValue = (element as HTMLElement).getAttribute(inputKey);
        }
        
        if (inputValue !== null) {
          try {
            instance[inputKey] = new Function('with(this) { return ' + inputValue + ' }').call(evaluationContext);
          } catch {
            instance[inputKey] = inputValue;
          }
        }
      });
    }
    
    if (ComponentClass.__outputs__) {
      ComponentClass.__outputs__.forEach((outputKey: string) => {
        if (!(instance[outputKey] instanceof EventEmitter)) {
          instance[outputKey] = new EventEmitter();
        }
      });
    }
    
    let childTemplate = ComponentClass.template;

    if (childTemplate) {
      processComponentStyles(ComponentClass);
      
      // Process two-way binding syntax
      childTemplate = processTwoWayBinding(childTemplate);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = childTemplate;
      
      processForDirectives(tempDiv, instance);

      processIfDirectives(tempDiv, instance);
      
      tempDiv.innerHTML = interpolateTemplate(tempDiv.innerHTML, instance);
      
      processImports(tempDiv, ComponentClass, instance);
      
      element.innerHTML = tempDiv.innerHTML;
      
      // Apply property bindings AFTER innerHTML is set to ensure input values are set correctly
      const componentSelectors = ComponentClass.imports?.map((imp: any) => imp.selector).filter((sel: any) => sel && !sel.startsWith('[')) || [];
      processPropertyBindings(element, instance, componentSelectors);
      
      setComponentInstance(element as HTMLElement, instance);
      
      // Generate unique ID for this component instance to track its interpolations
      const componentId = `${ComponentClass.selector}-${Date.now()}-${Math.random()}`;
      (element as HTMLElement).setAttribute('angle-interpolation-id', componentId);
      
      // Track interpolations for this child component
      trackInterpolations(componentId, ComponentClass.template, element as HTMLElement, instance);

      bindEventsForComponent(element as HTMLElement, instance, componentId);
      
      // Clean up binding attributes
      Array.from((element as HTMLElement).querySelectorAll('*')).forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('[') || attr.name.startsWith('(')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      
      bindOutputs(element as HTMLElement, ComponentClass, instance, parentContext);
    }
  });
}

function bindEventsForComponent(element: HTMLElement, instance: any, interpolationId?: string) {
  const eventElements = element.querySelectorAll('*');
  
  eventElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const match = attr.name.match(/^\((.+)\)$/);
      if (match) {
        const eventName = match[1];
        const handler = attr.value;
        
        // For ngModelChange, listen to 'input' event (case-insensitive)
        const actualEventName = eventName.toLowerCase() === 'ngmodelchange' ? 'input' : eventName;
        
        el.addEventListener(actualEventName, (e) => {
          try {
            // For ngModelChange, pass the input value as $event
            const eventParam = eventName.toLowerCase() === 'ngmodelchange' ? (el as HTMLInputElement).value : e;
            new Function('$event', 'with(this) { ' + handler + ' }').call(instance, eventParam);
            
            // For ngModelChange, update interpolations without full re-render
            if (eventName.toLowerCase() === 'ngmodelchange' && interpolationId) {
              updateInterpolations(interpolationId, instance);
            } else {
              reRenderChildComponent(element, instance);
            }
          } catch (err) {
            console.error(`Event Handler Error ${eventName}:`, err);
          }
        });
        
        el.removeAttribute(attr.name);
      }
    });
  });
}

function bindOutputs(element: HTMLElement, ComponentClass: any, instance: any, parentContext?: any) {
  if (!ComponentClass.__outputs__) {
    return;
  }
  
  ComponentClass.__outputs__.forEach((outputKey: string) => {
    const eventAttr = `(${outputKey})`;
    const handler = (element as HTMLElement).getAttribute(eventAttr);
    
    if (handler && instance[outputKey] instanceof EventEmitter) {
      instance[outputKey].subscribe((value: any) => {
        try {
          const context = parentContext || element;
          new Function('$event', 'with(this) { ' + handler + ' }').call(context, value);
        } catch (err) {
          console.error(`Output Handler Error ${outputKey}:`, err);
        }
      });
      
      (element as HTMLElement).removeAttribute(eventAttr);
    }
  });
}

function reRenderChildComponent(element: HTMLElement, instance: any) {
  const ComponentClass = instance.constructor;
  let childTemplate = ComponentClass.template;
  
  if (childTemplate) {
    processComponentStyles(ComponentClass);
    
    // Process two-way binding syntax
    childTemplate = processTwoWayBinding(childTemplate);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = childTemplate;
    
    processForDirectives(tempDiv, instance);

    processIfDirectives(tempDiv, instance);
    
    tempDiv.innerHTML = interpolateTemplate(tempDiv.innerHTML, instance);
    
    processImports(tempDiv, ComponentClass, instance);
    
    element.innerHTML = tempDiv.innerHTML;
    
    // Apply property bindings AFTER innerHTML is set to ensure input values are restored
    const componentSelectors = ComponentClass.imports?.map((imp: any) => imp.selector).filter((sel: any) => sel && !sel.startsWith('[')) || [];
    processPropertyBindings(element, instance, componentSelectors);
    
    // Get the interpolation ID and re-track interpolations after re-render
    const interpolationId = element.getAttribute('angle-interpolation-id');
    if (interpolationId) {
      trackInterpolations(interpolationId, ComponentClass.template, element, instance);
    }
    
    bindEventsForComponent(element, instance, interpolationId || undefined);
  }
}
