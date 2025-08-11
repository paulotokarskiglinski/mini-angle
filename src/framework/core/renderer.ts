export function interpolateTemplate(template: string, context: any): string {
  return template.replace(/{{(.*?)}}/g, (_, expression) => {
    try {
      return new Function('with(this) { return ' + expression.trim() + ' }').call(context);
    } catch (e) {
      return '';
    }
  });
}
