import { setCurrentElement } from './injection';
import { setComponentInstance } from './injection';
import { interpolateTemplate } from './renderer';
import { processForDirectives, processIfDirectives } from './directives';
import { processComponentStyles } from './styles';

export function processImports(root: ParentNode, componentClass?: any) {
  if (!componentClass || !componentClass.imports) {
    return;
  }

  componentClass.imports.forEach((ImportedClass: any) => {
    if (ImportedClass.selector && ImportedClass.selector.startsWith('[')) {
      processDirective(root, ImportedClass);
    } else if (ImportedClass.selector && ImportedClass.template) {
      processChildComponent(root, ImportedClass);
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

function processChildComponent(root: ParentNode, ComponentClass: any) {
  const elements = root.querySelectorAll(ComponentClass.selector);
  
  elements.forEach(element => {
    const existingId = (element as HTMLElement).getAttribute('angle-component-id');
    
    if (existingId) {
      return;
    }
    
    const instance = new ComponentClass();
    
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
      
      setComponentInstance(element as HTMLElement, instance);

      bindEventsForComponent(element as HTMLElement, instance);
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
