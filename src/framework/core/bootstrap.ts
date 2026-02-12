import { processIfDirectives, processForDirectives } from './directives';
import { bindEvents } from './events';
import { processImports, processImportsForReRender, setupRootBindings, updateRootBindings } from './imports';
import { processComponentStyles } from './styles';
import { getComponentInstance } from './injection';

const componentInstances = new Map<string, any>();

export function renderComponent(componentClass: any) {
  const instance = new componentClass();
  const selector = componentClass.selector;
  
  componentInstances.set(selector, instance);

  renderComponentInstance(componentClass, instance);
}

function renderComponentInstance(componentClass: any, instance: any) {
  const templateHTML = componentClass.template;

  if (!templateHTML) {
    throw new Error('The Component is missing the template.');
  }

  let host: Element | null = null;
  host = document.querySelector(componentClass.selector);

  if (!host) {
    host = document.createElement(componentClass.selector);
    if (host) {
      document.body.appendChild(host);
    }
  }
  
  if (host) {
    // Check if this is the first render or a re-render
    const isFirstRender = !host.hasAttribute('data-rendered');
    
    if (isFirstRender) {
      // First render: full processing
      const template = document.createElement('template');
      template.innerHTML = templateHTML.trim();
      const fragment = template.content;

      processForDirectives(fragment, instance);
      processIfDirectives(fragment, instance);

      // NOW extract interpolations and insert markers (after directives are processed)
      const textInterpolations: Array<{ marker: string; expression: string }> = [];
      let markerIndex = 0;
      
      // Use a wrapper div to get the HTML
      const tempWrapper = document.createElement('div');
      tempWrapper.appendChild(fragment.cloneNode(true));
      let fragmentHTML = tempWrapper.innerHTML;
      
      const markedHTML = fragmentHTML.replace(/>(.*?)</g, (match: string, content: string) => {
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

      host.innerHTML = markedHTML;

      processComponentStyles(componentClass);
      processImports(host, componentClass, instance);
      bindEvents(host, instance, componentClass.selector);
      
      // Setup reactive bindings for text interpolations
      setupRootBindings(host as HTMLElement, instance, templateHTML, textInterpolations);
      
      host.setAttribute('data-rendered', 'true');
    } else {
      // Re-render: only update text bindings, preserve everything else
      const childComponentMap = new Map<string, HTMLElement[]>();
      Array.from((host as HTMLElement).querySelectorAll('[angle-component-id]')).forEach(el => {
        const selector = el.tagName.toLowerCase();
        if (!childComponentMap.has(selector)) {
          childComponentMap.set(selector, []);
        }
        childComponentMap.get(selector)!.push(el as HTMLElement);
      });
      
      // Update only the text bindings
      updateRootBindings(instance);
      
      // Re-process child components
      processImportsForReRender(host, componentClass, instance);
      
      // Restore child components
      childComponentMap.forEach((elements, selector) => {
        const newElements = Array.from((host as HTMLElement).querySelectorAll(selector)) as HTMLElement[];
        elements.forEach((savedEl, index) => {
          if (newElements[index]) {
            newElements[index].replaceWith(savedEl);
          }
        });
      });
    }
  }
}

export function reRenderComponent(selector: string) {
  const instance = componentInstances.get(selector);

  if (instance) {
    // Root component - use the full re-render process
    const componentClass = instance.constructor;
    componentClass.selector = selector;
    renderComponentInstance(componentClass, instance);
  } else {
    // Child component - find all instances by selector and update their bindings
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const childInstance = getComponentInstance(htmlElement);
      if (childInstance) {
        updateRootBindings(childInstance);
      }
    });
  }
}

export function bootstrap(componentClass: any) {
  renderComponent(componentClass);
}
