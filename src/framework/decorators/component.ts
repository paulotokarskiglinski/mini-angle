interface ComponentOptions {
  selector: string;
  template: string;
  styles?: string;
  imports?: any[];
}

export function Component(options: ComponentOptions) {
  return function(target: any) {
    target.selector = options.selector;
    target.template = options.template;
    target.styles = options.styles || '';
    target.imports = options.imports || [];
  }
}
