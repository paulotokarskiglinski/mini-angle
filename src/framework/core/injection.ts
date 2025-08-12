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

export function inject(token: any): any {
  if (token === ElementRef && currentElement) {
    return new ElementRef(currentElement);
  }
  throw new Error(`No provider for ${token.name}`);
}
