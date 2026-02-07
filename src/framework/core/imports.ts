import { setCurrentElement } from './injection';
import { setComponentInstance } from './injection';
import { interpolateTemplate } from './renderer';
import { processForDirectives, processIfDirectives } from './directives';
import { processComponentStyles } from './styles';
import { EventEmitter } from '../decorators/output';

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
  
  const elements = root.querySelectorAll(`[${attributeName}]`);
  
  elements.forEach(element => {
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
    
    const childTemplate = ComponentClass.template;

    if (childTemplate) {
      processComponentStyles(ComponentClass);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = childTemplate;
      
      processForDirectives(tempDiv, instance);

      processIfDirectives(tempDiv, instance);
      
      tempDiv.innerHTML = interpolateTemplate(tempDiv.innerHTML, instance);
      
      processImports(tempDiv, ComponentClass, instance);

      element.innerHTML = tempDiv.innerHTML;
      
      setComponentInstance(element as HTMLElement, instance);

      bindEventsForComponent(element as HTMLElement, instance);
      
      bindOutputs(element as HTMLElement, ComponentClass, instance, parentContext);
    }
  });
}

function bindEventsForComponent(element: HTMLElement, instance: any) {
  const eventElements = element.querySelectorAll('*');
  
  eventElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const match = attr.name.match(/^\((.+)\)$/);
      if (match) {
        const eventName = match[1];
        const handler = attr.value;
        
        el.addEventListener(eventName, (e) => {
          try {
            new Function('event', 'with(this) { ' + handler + ' }').call(instance, e);
            
            reRenderChildComponent(element, instance);
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
  const childTemplate = ComponentClass.template;
  
  if (childTemplate) {
    processComponentStyles(ComponentClass);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = childTemplate;
    
    processForDirectives(tempDiv, instance);

    processIfDirectives(tempDiv, instance);
    
    tempDiv.innerHTML = interpolateTemplate(tempDiv.innerHTML, instance);
    
    processImports(tempDiv, ComponentClass);
    
    element.innerHTML = tempDiv.innerHTML;
    
    bindEventsForComponent(element, instance);
  }
}
