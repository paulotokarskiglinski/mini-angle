import { Directive, ElementRef, inject } from 'mini-angle';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  private el = inject(ElementRef);
  
  constructor() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
