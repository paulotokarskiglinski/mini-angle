export function processTwoWayBinding(template: string): string {
  // Match [(propertyName)]="expression"
  let result = template.replace(/\[\((\w+)\)\]="([^"]*)"/g, (_match, propertyName, expression) => {
    // Convert to property binding + event binding
    const propertyBinding = `[${propertyName}]="${expression}"`;
    const eventBinding = `(${propertyName}Change)="${expression}=$event"`;
    return `${propertyBinding} ${eventBinding}`;
  });
  
  // Merge ALL duplicate event handlers on the same element
  // Keep merging until no more duplicates are found
  let previousResult = '';
  let iterations = 0;
  while (previousResult !== result && iterations < 10) {
    previousResult = result;
    iterations++;
    
    // Match: <element ... (eventName)="handler1" ... (eventName)="handler2" ...>
    result = result.replace(/(<[^>]*)\((\w+)\)="([^"]*)"\s+([^>]*)\(\2\)="([^"]*)"/g, 
      (_match, before, eventName, handler1, middle, handler2) => {
        // Merge the handlers
        return `${before}(${eventName})="${handler1}; ${handler2}" ${middle}`;
      }
    );
  }
  
  return result;
}

export function interpolateTemplate(template: string, context: any): string {
  return template.replace(/{{(.*?)}}/g, (_, expression) => {
    try {
      return new Function('with(this) { return ' + expression.trim() + ' }').call(context);
    } catch (e) {
      return '';
    }
  });
}
