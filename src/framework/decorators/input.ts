export function Input(target: any, propertyKey: string) {
  if (!target.constructor.__inputs__) {
    target.constructor.__inputs__ = [];
  }
  target.constructor.__inputs__.push(propertyKey);
}
