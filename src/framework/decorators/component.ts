interface ComponentOptions {
  selector: string;
  template: string;
}

export function Component(options: ComponentOptions) {
  return function(target: any) {
    target.selector = options.selector;
    target.template = options.template;
  }
}

