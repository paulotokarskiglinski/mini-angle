export class ElementRef {
  nativeElement: HTMLElement;
  
  constructor(nativeElement: HTMLElement) {
    this.nativeElement = nativeElement;
  }
}

let currentElement: HTMLElement | null = null;

export function setCurrentElement(element: HTMLElement) {
  currentElement = element;
}

const providers = new Map<any, any>();

export function register(token: any, instance: any) {
  providers.set(token, instance);
}

export function inject(token: any): any {
  if (token === ElementRef && currentElement) {
    return new ElementRef(currentElement);
  }

  if (token.isInjectable) {
    if (providers.has(token)) {
      return providers.get(token);
    }

    const instace = new token();
    providers.set(token, instace);
    return instace;
  }

  throw new Error(`No provider for ${token.name}`);
}
