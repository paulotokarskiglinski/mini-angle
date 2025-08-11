import { interpolateTemplate } from './renderer';
import { processIfDirectives, processForDirectives } from './directives';
import { bindEvents } from './events';

export function renderComponent(componentClass: any) {
  const instance = new componentClass();

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
    bindEvents(host, instance);
  }
}

export function bootstrap(componentClass: any) {
  renderComponent(componentClass);
}
