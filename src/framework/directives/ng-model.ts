import { Directive } from '../decorators/directive';
import { ElementRef, inject } from '../core/injection';

@Directive({
  selector: '[ngModel]'
})
export class NgModelDirective {
  private elementRef = inject(ElementRef);
  
  constructor() {
    const element = this.elementRef.nativeElement;
    
    if (element instanceof HTMLInputElement || 
        element instanceof HTMLTextAreaElement || 
        element instanceof HTMLSelectElement) {
      
      // The directive is registered and element is tracked
      // Value sync is handled by the property binding and event binding system
    }
  }
}
