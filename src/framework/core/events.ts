export function bindEvents(root: ParentNode, context: any) {
  const elements = root.querySelectorAll('*');

  elements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const match = attr.name.match(/^\((.+)\)$/);
      if (match) {
        const eventName = match[1];
        const handler = attr.value;

        el.addEventListener(eventName, (e) => {
          const ctx = context.__context;

          try {
            new Function('event', 'with(this) { ' + handler + ' }').call(ctx, e);
          } catch (err) {
            console.error(`Event Handler Error ${eventName}:`, err);
          }
        });
        
        el.removeAttribute(attr.name);
      }
    });
  });
}
