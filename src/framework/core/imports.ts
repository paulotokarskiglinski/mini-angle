import { setCurrentElement } from './injection';
import { setComponentInstance } from './injection';
import { interpolateTemplate } from './renderer';
import { processForDirectives, processIfDirectives } from './directives';
import { processComponentStyles } from './styles';
import { EventEmitter } from '../decorators/output';
import { reRenderComponent } from './bootstrap';

interface InterpolationBinding {
  node: Text;
  expression: string;
}

const componentBindings = new WeakMap<any, InterpolationBinding[]>();

export function processImports(root: ParentNode, componentClass?: any, parentContext?: any) {
  if (!componentClass || !componentClass.imports) {
    return;
  }

  componentClass.imports.forEach((ImportedClass: any) => {
    if (ImportedClass.selector && ImportedClass.selector.startsWith('[')) {
      processDirective(root, ImportedClass, parentContext);
    } else if (ImportedClass.selector && ImportedClass.template) {
      processChildComponent(root, ImportedClass, parentContext);
    }
  });
}

export function processImportsForReRender(root: ParentNode, componentClass?: any, parentContext?: any) {
  if (!componentClass || !componentClass.imports) {
    return;
  }

  componentClass.imports.forEach((ImportedClass: any) => {
    // Only process child components on re-render, skip directives
    if (ImportedClass.selector && ImportedClass.template) {
      processChildComponent(root, ImportedClass, parentContext);
    }
  });
}

export function setupRootBindings(element: HTMLElement, instance: any, template: string, interpolations?: Array<{ marker: string; expression: string }>) {
  console.log('[setupRootBindings] Called for:', instance.constructor.name);
  
  // If interpolations were passed in (from bootstrap.ts), use them
  if (interpolations) {
    console.log('[setupRootBindings] Using provided interpolations:', interpolations.length);
    setupTextBindings(element, instance, interpolations);
    return;
  }
  
  // Otherwise extract them from the template (for child components)
  const textInterpolations: Array<{ marker: string; expression: string }> = [];
  let markerIndex = 0;
  
  // Extract interpolations from original template
  let markedTemplate = template;
  markedTemplate = markedTemplate.replace(/>(.*?)</g, (match: string, content: string) => {
    if (content.includes('{{')) {
      return '>' + content.replace(/\{\{(.+?)\}\}/g, (_: string, expr: string) => {
        const marker = `__INTERPOLATION_${markerIndex}__`;
        textInterpolations.push({ marker, expression: expr.trim() });
        markerIndex++;
        return marker;
      }) + '<';
    }
    return match;
  });
  
  console.log('[setupRootBindings] Found interpolations:', textInterpolations.length);
  
  // Now find and bind text nodes in the rendered element
  setupTextBindings(element, instance, textInterpolations);
}

export function updateRootBindings(instance: any) {
  const bindings = componentBindings.get(instance);
  
  console.log('[updateRootBindings] Called with instance:', instance.constructor.name);
  console.log('[updateRootBindings] Found bindings:', bindings?.length || 0);
  
  if (bindings && bindings.length > 0) {
    bindings.forEach((binding, index) => {
      if (binding.node && binding.node.parentNode) {
        try {
          const value = new Function('with(this) { return ' + binding.expression + ' }').call(instance);
          console.log(`[updateRootBindings] Binding ${index}: ${binding.expression} → ${value}`);
          binding.node.textContent = value !== null && value !== undefined ? String(value) : '';
        } catch (err) {
          console.error('Error updating binding:', err);
          binding.node.textContent = '';
        }
      } else {
        console.log(`[updateRootBindings] Binding ${index}: node detached`);
      }
    });
  }
}

function processDirective(root: ParentNode, DirectiveClass: any, parentContext?: any) {
  const attributeName = DirectiveClass.selector.replace(/[\[\]]/g, '');
  const attrLower = attributeName.toLowerCase();
  
  // Search for elements with either [attribute] or [(attribute)] syntax
  // Note: CSS selector for [(attr)] needs to match the literal attribute name
  let elements: NodeListOf<Element>;
  
  // First try to find two-way binding syntax [(attribute)]
  const twoWayAttr = `[(${attrLower})]`;
  elements = root.querySelectorAll(`[${CSS.escape(twoWayAttr)}]`);
  
  // If not found, try one-way binding [attribute]
  if (elements.length === 0) {
    elements = root.querySelectorAll(`[${attrLower}]`);
  }
  
  console.log('[processDirective] Looking for directive:', attributeName, 'Found elements:', elements.length);
  
  elements.forEach(element => {
    const htmlElement = element as HTMLElement;
    
    console.log('[processDirective] Processing element:', htmlElement.outerHTML.substring(0, 100));
    
    // Check for two-way binding syntax [(property)]
    const allAttributes = Array.from(htmlElement.attributes);
    console.log('[processDirective] All attributes:', allAttributes.map(a => `${a.name}="${a.value}"`).join(', '));
    
    const twoWayBinding = allAttributes.find(attr => attr.name.match(/^\[\((.+)\)\]$/));
    
    if (twoWayBinding) {
      const match = twoWayBinding.name.match(/^\[\((.+)\)\]$/);
      if (match) {
        const propertyName = match[1];
        const expression = twoWayBinding.value;
        
        console.log('[processDirective] Found two-way binding:', propertyName, '=', expression);
        
        // Set the input binding
        htmlElement.setAttribute(`[${propertyName}]`, expression);
        
        // Set the output binding
        htmlElement.setAttribute(`(${propertyName}Change)`, `${expression} = $event`);
        
        console.log('[processDirective] After expansion:', htmlElement.outerHTML.substring(0, 150));
        
        // Remove the two-way binding attribute
        htmlElement.removeAttribute(twoWayBinding.name);
      }
    }
    
    setCurrentElement(htmlElement);
    
    const instance = new DirectiveClass();
    
    console.log('[processDirective] Created instance, __inputs__:', DirectiveClass.__inputs__);
    
    // Handle @Input properties
    if (DirectiveClass.__inputs__) {
      DirectiveClass.__inputs__.forEach((inputKey: string) => {
        const bindingAttr = `[${inputKey}]`;
        const inputValue = htmlElement.getAttribute(bindingAttr);
        
        console.log('[processDirective] Looking for input', bindingAttr, 'value:', inputValue);
        
        if (inputValue !== null) {
          try {
            const evaluatedValue = new Function('with(this) { return ' + inputValue + ' }').call(parentContext);
            console.log('[processDirective] Evaluated:', inputValue, '→', evaluatedValue);
            instance[inputKey] = evaluatedValue;
            console.log('[processDirective] Set instance[' + inputKey + '] =', evaluatedValue);
          } catch (err) {
            console.error(`Error binding input ${inputKey}:`, err);
            instance[inputKey] = inputValue;
          }
          htmlElement.removeAttribute(bindingAttr);
        }
      });
    }
    
    // Handle @Output properties
    if (DirectiveClass.__outputs__) {
      DirectiveClass.__outputs__.forEach((outputKey: string) => {
        // DOM attributes are lowercase, so we need to search for the lowercase version
        const eventAttr = `(${outputKey.toLowerCase()})`;
        const handler = htmlElement.getAttribute(eventAttr);
        
        console.log('[processDirective] Looking for output', eventAttr, 'handler:', handler);
        
        if (handler && instance[outputKey] instanceof EventEmitter) {
          console.log('[processDirective] Subscribing to', outputKey);
          instance[outputKey].subscribe((value: any) => {
            console.log('[processDirective] Event fired:', outputKey, '→', value);
            try {
              new Function('$event', 'with(this) { ' + handler + ' }').call(parentContext, value);
              
              // Trigger parent re-render
              const parentSelector = findParentComponentSelector(htmlElement);
              console.log('[processDirective] Parent selector:', parentSelector);
              if (parentSelector) {
                console.log('[processDirective] Triggering re-render for:', parentSelector);
                setTimeout(() => reRenderComponent(parentSelector), 0);
              }
            } catch (err) {
              console.error(`Error in output handler ${outputKey}:`, err);
            }
          });
          htmlElement.removeAttribute(eventAttr);
        }
      });
    }
    
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
    
    // Process two-way binding [(property)]="expression"
    const allAttributes = Array.from((element as HTMLElement).attributes);
    allAttributes.forEach(attr => {
      const twoWayMatch = attr.name.match(/^\[\((.+)\)\]$/);
      if (twoWayMatch) {
        const propertyName = twoWayMatch[1];
        const expression = attr.value;
        
        // Set input value
        try {
          instance[propertyName] = new Function('with(this) { return ' + expression + ' }').call(evaluationContext);
        } catch (err) {
          console.error(`Two-way binding input error for ${propertyName}:`, err);
        }
        
        // Set up output listener for propertyChange
        const changeEventName = `${propertyName}Change`;
        if (instance[changeEventName] && instance[changeEventName] instanceof EventEmitter) {
          instance[changeEventName].subscribe((value: any) => {
            try {
              // Update parent context
              new Function('$event', 'with(this) { ' + expression + ' = $event }').call(evaluationContext, value);
              
              // Trigger parent component re-render
              const parentSelector = findParentComponentSelector(element as HTMLElement);
              if (parentSelector) {
                setTimeout(() => reRenderComponent(parentSelector), 0);
              }
            } catch (err) {
              console.error(`Two-way binding output error for ${propertyName}:`, err);
            }
          });
        }
        
        // Remove the attribute
        (element as HTMLElement).removeAttribute(attr.name);
      }
    });
    
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
      
      // Extract and mark text interpolations before processing
      const textInterpolations: Array<{ marker: string; expression: string }> = [];
      let markedTemplate = childTemplate;
      let markerIndex = 0;
      
      // Find text interpolations (not in attributes)
      markedTemplate = markedTemplate.replace(/>(.*?)</g, (match: string, content: string) => {
        if (content.includes('{{')) {
          return '>' + content.replace(/\{\{(.+?)\}\}/g, (_: string, expr: string) => {
            const marker = `__INTERPOLATION_${markerIndex}__`;
            textInterpolations.push({ marker, expression: expr.trim() });
            markerIndex++;
            return marker;
          }) + '<';
        }
        return match;
      });
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = markedTemplate;
      
      processForDirectives(tempDiv, instance);
      processIfDirectives(tempDiv, instance);
      
      // Process attribute interpolations
      tempDiv.innerHTML = interpolateTemplate(tempDiv.innerHTML, instance);
      
      processImports(tempDiv, ComponentClass, instance);

      element.innerHTML = tempDiv.innerHTML;
      
      setComponentInstance(element as HTMLElement, instance);
      bindEventsForComponent(element as HTMLElement, instance);
      bindOutputs(element as HTMLElement, ComponentClass, instance, parentContext);
      
      // Replace markers with bound text nodes
      setupTextBindings(element as HTMLElement, instance, textInterpolations);
      
      // Mark component as rendered so re-renders use the optimized path
      (element as HTMLElement).setAttribute('data-rendered', 'true');
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
            new Function('$event', 'with(this) { ' + handler + ' }').call(instance, e);
            
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
    // DOM attributes are lowercase, so we need to search for the lowercase version
    const eventAttr = `(${outputKey.toLowerCase()})`;
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
  const bindings = componentBindings.get(instance);
  
  if (bindings && bindings.length > 0) {
    // Update only the text nodes with interpolations
    bindings.forEach(binding => {
      if (binding.node && binding.node.parentNode) {
        try {
          const value = new Function('with(this) { return ' + binding.expression + ' }').call(instance);
          binding.node.textContent = value !== null && value !== undefined ? String(value) : '';
        } catch (err) {
          console.error('Error updating binding:', err);
          binding.node.textContent = '';
        }
      }
    });
  } else {
    // Fallback to full re-render if no bindings stored
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
}

function setupTextBindings(element: HTMLElement, instance: any, interpolations: Array<{ marker: string; expression: string }>) {
  const bindings: InterpolationBinding[] = [];
  
  console.log('[setupTextBindings] Looking for', interpolations.length, 'interpolations');
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const nodesToReplace: Array<{ node: Text; marker: string; expression: string }> = [];
  let node: Node | null;
  
  while (node = walker.nextNode()) {
    const textNode = node as Text;
    const content = textNode.textContent || '';
    
    // Check if this text node contains any markers
    interpolations.forEach(({ marker, expression }) => {
      if (content.includes(marker)) {
        console.log('[setupTextBindings] Found marker in text node:', marker, '→', expression);
        nodesToReplace.push({ node: textNode, marker, expression });
      }
    });
  }
  
  console.log('[setupTextBindings] Nodes to replace:', nodesToReplace.length);
  
  // Replace markers with evaluated values and set up bindings
  nodesToReplace.forEach(({ node, marker, expression }) => {
    const content = node.textContent || '';
    
    if (content === marker) {
      // The entire text node is just the marker - bind it directly
      try {
        const value = new Function('with(this) { return ' + expression + ' }').call(instance);
        node.textContent = value !== null && value !== undefined ? String(value) : '';
        bindings.push({ node, expression });
      } catch (err) {
        // Skip bindings that fail (likely loop variables like i, item, etc.)
        // These are handled by their respective directives
        console.log('[setupTextBindings] Skipping binding for expression:', expression, '(likely a loop variable)');
      }
    } else {
      // The marker is part of a larger text node - split it
      const parts = content.split(marker);
      const parent = node.parentNode!;
      const nextSibling = node.nextSibling;
      
      // Create text node for before
      if (parts[0]) {
        parent.insertBefore(document.createTextNode(parts[0]), nextSibling);
      }
      
      // Create bound text node for the interpolation
      try {
        const value = new Function('with(this) { return ' + expression + ' }').call(instance);
        const boundNode = document.createTextNode(value !== null && value !== undefined ? String(value) : '');
        parent.insertBefore(boundNode, nextSibling);
        bindings.push({ node: boundNode, expression });
      } catch (err) {
        // Skip bindings that fail (likely loop variables)
        console.log('[setupTextBindings] Skipping binding for expression:', expression, '(likely a loop variable)');
        parent.insertBefore(document.createTextNode(marker), nextSibling);
      }
      
      // Create text node for after
      if (parts[1]) {
        parent.insertBefore(document.createTextNode(parts[1]), nextSibling);
      }
      
      // Remove original node
      parent.removeChild(node);
    }
  });
  
  console.log('[setupTextBindings] Set', bindings.length, 'bindings for', instance.constructor.name);
  componentBindings.set(instance, bindings);
}

function findParentComponentSelector(element: HTMLElement): string | null {
  let current = element.parentElement;
  
  while (current) {
    // Check if this element is a registered component
    // Components typically have custom tag names or are root elements
    const tagName = current.tagName.toLowerCase();
    
    // Check for common component patterns (custom elements with hyphens)
    if (tagName.includes('-') || tagName === 'app') {
      return tagName;
    }
    
    current = current.parentElement;
  }
  
  return null;
}
