const componentStyleRegistry = new Map<string, HTMLStyleElement>();

export function processComponentStyles(componentClass: any) {
  if (!componentClass.styles) {
    return;
  }

  const selector = componentClass.selector;
  const styles = componentClass.styles;
  
  if (componentStyleRegistry.has(selector)) {
    return;
  }

  const scopedStyles = scopeComponentStyles(styles, selector);
  
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-component', selector);
  styleElement.textContent = scopedStyles;
  
  document.head.appendChild(styleElement);
  
  componentStyleRegistry.set(selector, styleElement);
}

function scopeComponentStyles(styles: string, componentSelector: string): string {
  const rules = styles.split('}').filter(rule => rule.trim());
  
  const scopedRules = rules.map(rule => {
    if (!rule.trim()) {
      return rule;
    }
    
    const parts = rule.split('{');
    if (parts.length !== 2) {
      return rule + '}';
    }
    
    const [selectorPart, declarationPart] = parts;
    const selectors = selectorPart.split(',').map(s => s.trim());
    
    const scopedSelectors = selectors.map(selector => {
      selector = selector.trim();
      
      if (selector === ':host') {
        return componentSelector;
      } else if (selector.startsWith(':host(')) {
        const hostCondition = selector.match(/^:host\((.+)\)(.*)$/);
        if (hostCondition) {
          return `${componentSelector}${hostCondition[1]}${hostCondition[2] || ''}`;
        }
      } else if (selector.startsWith(':host ')) {
        return selector.replace(':host', componentSelector);
      } else {
        return `${componentSelector} ${selector}`;
      }
      
      return selector;
    });
    
    return `${scopedSelectors.join(', ')} {${declarationPart}}`;
  });
  
  return scopedRules.join('\n');
}

export function removeComponentStyles(selector: string) {
  const styleElement = componentStyleRegistry.get(selector);

  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    componentStyleRegistry.delete(selector);
  }
}
