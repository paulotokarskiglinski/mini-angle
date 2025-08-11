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
    const match = expr.match(/let\s+(\w+)\s+of\s+(.+)/);
    if (!match) {
      return;
    }

    const [, itemName, listExpr] = match;
    const list = new Function('with(this) { return ' + listExpr + ' }').call(context);
    if (!Array.isArray(list)) {
      return;
    }

    const parent = el.parentElement!;
    for (const item of list) {
      const localContext = Object.create(context);
      localContext[itemName] = item;
      const clone = el.cloneNode(true) as HTMLElement;
      context.__context = localContext;
      clone.removeAttribute('angle-for');

      processForDirectives(clone, localContext);
      processIfDirectives(clone, localContext);

      clone.innerHTML = interpolateTemplate(clone.innerHTML, localContext);

      if (clone.innerHTML.trim() !== '') {
        parent.insertBefore(clone, el);
      }
    }

    el.remove();
  });
}
