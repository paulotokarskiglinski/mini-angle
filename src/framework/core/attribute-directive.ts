import { setCurrentElement } from './injection';

export function processAttributeDirectives(root: ParentNode, componentClass?: any) {
  if (!componentClass || !componentClass.imports) {
    return;
  }

  componentClass.imports.forEach((ImportedClass: any) => {
    if (ImportedClass.selector && ImportedClass.selector.startsWith('[')) {
      processDirective(root, ImportedClass);
    }

    else if (ImportedClass.selector && ImportedClass.template) {
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
    new ComponentClass();
    
    const childTemplate = ComponentClass.template;

    if (childTemplate) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = childTemplate;
      
      processAttributeDirectives(tempDiv, ComponentClass);
      
      element.innerHTML = tempDiv.innerHTML;
    }
  });
}
