interface DirectiveOptions {
  selector: string;
}

export function Directive(options: DirectiveOptions) {
  return function(target: any) {
    target.selector = options.selector;
  }
}
