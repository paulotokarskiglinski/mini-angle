import { interpolateTemplate, processTwoWayBinding } from './renderer';
import { processIfDirectives, processForDirectives } from './directives';
import { bindEvents } from './events';
import { processImports } from './imports';
import { processComponentStyles } from './styles';
import { processPropertyBindings } from './properties';
import { trackInterpolations } from './interpolation-tracker';

const componentInstances = new Map<string, any>();

export function renderComponent(componentClass: any) {
  const instance = new componentClass();
  const selector = componentClass.selector;
  
  componentInstances.set(selector, instance);

  renderComponentInstance(componentClass, instance);
}

function renderComponentInstance(componentClass: any, instance: any) {
  let templateHTML = componentClass.template;

  if (!templateHTML) {
    throw new Error('The Component is missing the template.');
  }

  // Process two-way binding syntax first
  templateHTML = processTwoWayBinding(templateHTML);

  const template = document.createElement('template');
  template.innerHTML = templateHTML.trim();
  const fragment = template.content;

  processForDirectives(fragment, instance);
  processIfDirectives(fragment, instance);

  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment.cloneNode(true));
  wrapper.innerHTML = interpolateTemplate(wrapper.innerHTML, instance);

  let host: Element | null = null;
  
  host = document.querySelector(componentClass.selector);

  if (!host) {
    host = document.createElement(componentClass.selector);
    if (host) {
      document.body.appendChild(host);
    }
  }
  
  if (host) {
    // Preserve child components
    const childComponentMap = new Map<string, HTMLElement[]>();
    Array.from((host as HTMLElement).querySelectorAll('[angle-component-id]')).forEach(el => {
      const selector = el.tagName.toLowerCase();
      if (!childComponentMap.has(selector)) {
        childComponentMap.set(selector, []);
      }
      childComponentMap.get(selector)!.push(el as HTMLElement);
    });
    
    host.innerHTML = wrapper.innerHTML;

    // Restore child components
    childComponentMap.forEach((elements, selector) => {
      const newElements = Array.from((host as HTMLElement).querySelectorAll(selector)) as HTMLElement[];
      elements.forEach((savedEl, index) => {
        if (newElements[index]) {
          newElements[index].replaceWith(savedEl);
        }
      });
    });

    processComponentStyles(componentClass);

    processImports(host, componentClass, instance);
    
    // Track interpolations for efficient updates
    trackInterpolations(componentClass.selector, componentClass.template, host as HTMLElement, instance);
    
    // Get list of imported component selectors to skip in property bindings
    const componentSelectors = componentClass.imports?.map((imp: any) => imp.selector).filter((sel: any) => sel && !sel.startsWith('[')) || [];
    processPropertyBindings(host, instance, componentSelectors);
    
    bindEvents(host, instance, componentClass.selector);
    
    // Clean up binding attributes after all processing
    Array.from((host as HTMLElement).querySelectorAll('*')).forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('[') || attr.name.startsWith('(')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}

export function reRenderComponent(selector: string) {
  const instance = componentInstances.get(selector);

  if (instance) {
    const componentClass = instance.constructor;
    componentClass.selector = selector;
    renderComponentInstance(componentClass, instance);
  }
}

export function bootstrap(componentClass: any) {
  renderComponent(componentClass);
}
