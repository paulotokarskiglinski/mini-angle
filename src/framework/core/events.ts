import { reRenderComponent } from './bootstrap';
import { getComponentInstance } from './injection';

export function bindEvents(root: ParentNode, context: any, componentSelector?: string) {
  const elements = root.querySelectorAll('*');

  elements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const match = attr.name.match(/^\((.+)\)$/);

      if (match) {
        const eventName = match[1];
        const handler = attr.value;

        let localCtx = {};
        let currentElement = el as any;
        
        while (currentElement) {
          const contextData = currentElement.getAttribute('angle-data-local-context');
          if (contextData) {
            try {
              localCtx = JSON.parse(contextData);
              currentElement.removeAttribute('angle-data-local-context');
              break;
            } catch (e) {
              console.error('Failed to parse context data:', e);
            }
          }
          currentElement = currentElement.parentElement;
        }

        el.addEventListener(eventName, (e) => {
          let executionContext = context;
          
          const componentInstance = getComponentInstance(el as HTMLElement);
          if (componentInstance) {
            executionContext = componentInstance;
          }
          
          if (localCtx && Object.keys(localCtx).length > 0) {
            executionContext = Object.create(executionContext);
            Object.assign(executionContext, localCtx);
          }
          
          try {
            new Function('event', 'with(this) { ' + handler + ' }').call(executionContext, e);
            
            if (componentSelector) {
              setTimeout(() => reRenderComponent(componentSelector), 0);
            }
          } catch (err) {
            console.error(`Event Handler Error ${eventName}:`, err, localCtx, currentElement);
          }
        });
        
        el.removeAttribute(attr.name);
      }
    });
  });
}
