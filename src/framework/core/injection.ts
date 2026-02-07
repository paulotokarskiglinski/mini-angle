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
const componentInstances = new Map<string, any>();
let componentIdCounter = 0;

export function register(token: any, instance: any) {
  providers.set(token, instance);
}

export function setComponentInstance(element: HTMLElement, instance: any) {
  const id = `component-${componentIdCounter++}`;
  element.setAttribute('angle-component-id', id);
  componentInstances.set(id, instance);
  return id;
}

export function getComponentInstance(element: HTMLElement): any {
  const id = element.getAttribute('angle-component-id');
  if (id) {
    return componentInstances.get(id);
  }
  
  let current = element.parentElement;
  while (current) {
    const parentId = current.getAttribute('angle-component-id');
    if (parentId) {
      return componentInstances.get(parentId);
    }
    current = current.parentElement;
  }
  
  return null;
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
