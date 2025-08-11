import { interpolateTemplate } from './renderer';
import { processIfDirectives, processForDirectives } from './directives';
import { bindEvents } from './events';

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

  const template = document.createElement('template');
  template.innerHTML = templateHTML.trim();
  const fragment = template.content;

  processForDirectives(fragment, instance);
  processIfDirectives(fragment, instance);

  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment.cloneNode(true));
  wrapper.innerHTML = interpolateTemplate(wrapper.innerHTML, instance);

  const host = document.querySelector(componentClass.selector);
  
  if (host) {
    host.innerHTML = wrapper.innerHTML;
    bindEvents(host, instance, componentClass.selector);
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
