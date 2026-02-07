export class EventEmitter<T = any> {
  private listeners: Array<(value: T) => void> = [];

  emit(value: T) {
    this.listeners.forEach(listener => listener(value));
  }

  subscribe(listener: (value: T) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export function Output(target: any, propertyKey: string) {
  if (!target.constructor.__outputs__) {
    target.constructor.__outputs__ = [];
  }
  target.constructor.__outputs__.push(propertyKey);
}
