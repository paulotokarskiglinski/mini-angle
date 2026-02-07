import { reRenderComponent } from './bootstrap';
import { getComponentInstance } from './injection';
import { updateInterpolations } from './interpolation-tracker';

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

        // For ngModelChange, listen to 'input' event instead (case-insensitive)
        const actualEventName = eventName.toLowerCase() === 'ngmodelchange' ? 'input' : eventName;
        
        el.addEventListener(actualEventName, (e) => {
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
            // For ngModelChange, pass the input value as $event instead of the DOM event
            const eventParam = eventName.toLowerCase() === 'ngmodelchange' ? (el as HTMLInputElement).value : e;
            new Function('$event', 'with(this) { ' + handler + ' }').call(executionContext, eventParam);
            
            // For ngModelChange, update interpolations without full re-render to avoid losing focus
            if (componentSelector && eventName.toLowerCase() === 'ngmodelchange') {
              updateInterpolations(componentSelector, executionContext);
            } else if (componentSelector) {
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
