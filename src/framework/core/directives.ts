import { interpolateTemplate } from './renderer';

export function processIfDirectives(root: ParentNode, context: any) {  
  root.querySelectorAll('[angle-if]').forEach(el => {
    const expr = el.getAttribute('angle-if')!;
    const condition = new Function('with(this) { return ' + expr + ' }').call(context);
    
    if (!condition) {
      el.remove();
    } else {
      el.removeAttribute('angle-if');

      processForDirectives(el, context);
      processIfDirectives(el, context);
    }
  });
}

export function processForDirectives(root: ParentNode, context: any) {
  root.querySelectorAll('[angle-for]').forEach(el => {
    const expr = el.getAttribute('angle-for')!;
    const { itemName, iterable, aliases } = parseForExpression(expr);

    const list = new Function('with(this) { return ' + iterable + ' }').call(context);
    if (!Array.isArray(list)) {
      return;
    }

    let index: number = 0;
    const parent = el.parentElement!;

    for (const item of list) {
      const localContext = Object.create(context);
      localContext[itemName] = item;

      for (const [alias, name] of Object.entries(aliases)) {
        switch (alias) {
          case 'index': {
            localContext[name] = index;
            break;
          }
          case 'count': {
            localContext[name] = list.length;
            break;
          }
          case 'first': {
            localContext[name] = index === 0;
            break;
          }
          case 'last': {
            localContext[name] = index === list.length - 1;
            break;
          }
          default: {
            localContext[name] = undefined;    
          }
        }
      }

      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute('angle-for');

      processForDirectives(clone, localContext);
      processIfDirectives(clone, localContext);

      clone.innerHTML = interpolateTemplate(clone.innerHTML, localContext);

      const allElements = clone.querySelectorAll('*');

      allElements.forEach((eventEl: Element) => {
        const hasEventHandler = Array.from(eventEl.attributes).some(attr => attr.name.startsWith('('));
        if (hasEventHandler) {
          eventEl.setAttribute('angle-data-local-context', JSON.stringify(localContext));
        }
      });
      
      const hasEventHandler = Array.from(clone.attributes).some(attr => attr.name.startsWith('('));

      if (hasEventHandler) {
        clone.setAttribute('angle-data-local-context', JSON.stringify(localContext));
      }

      if (clone.innerHTML.trim() !== '') {
        parent.insertBefore(clone, el);
      }

      index++;
    }

    el.remove();
  });

  function parseForExpression(expr: string) {
    const forRegex = /let\s+(\w+)\s+of\s+(.+?)(?:;\s*(.*))?$/;
    const match = expr.match(forRegex);
    if (!match) { throw new Error(`Invalid angle‑for expression: ${expr}`); }

    const [, itemName, iterable, tail] = match;
    const aliases: Record<string, string> = {};

    if (tail) {
      tail.split(';').forEach(part => {
        const m = part.trim().match(/^(\w+)\s+as\s+(\w+)$/);
        if (m) { const [, alias, name] = m; aliases[alias] = name; }
      });
    }

    return { itemName, iterable, aliases };
  }
}
