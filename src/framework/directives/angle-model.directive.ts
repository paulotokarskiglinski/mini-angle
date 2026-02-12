import { Directive, ElementRef, inject, Output, EventEmitter } from '../index';

@Directive({
  selector: '[angleModel]'
})
export class AngleModelDirective {
  private el = inject(ElementRef);
  private _angleModel: any;
  private initialized = false;

  // Make angleModel accessible for direct assignment
  set angleModel(value: any) {
    this._angleModel = value;
    if (!this.initialized) {
      this.initialize();
    } else {
      this.updateElementValue(value);
    }
  }

  get angleModel(): any {
    return this._angleModel;
  }

  @Output
  angleModelChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    // Manually register angleModel as an input since we can't use @Input on a setter
    if (!this.constructor.__inputs__) {
      (this.constructor as any).__inputs__ = [];
    }
    if (!(this.constructor as any).__inputs__.includes('angleModel')) {
      (this.constructor as any).__inputs__.push('angleModel');
    }
  }

  private initialize() {
    this.initialized = true;
    const element = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // Set initial value
    this.updateElementValue(this._angleModel);

    // Listen for changes
    const updateValue = () => {
      let newValue: any;

      if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        newValue = element.checked;
      } else if (element instanceof HTMLInputElement && element.type === 'radio') {
        newValue = element.checked ? element.value : this._angleModel;
      } else if (element instanceof HTMLInputElement && element.type === 'number') {
        newValue = element.value === '' ? null : parseFloat(element.value);
      } else {
        newValue = element.value;
      }

      this._angleModel = newValue;
      this.angleModelChange.emit(newValue);
    };

    // Bind appropriate events based on element type
    if (element instanceof HTMLSelectElement) {
      element.addEventListener('change', updateValue);
    } else if (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio')) {
      element.addEventListener('change', updateValue);
    } else {
      element.addEventListener('input', updateValue);
    }
  }

  private updateElementValue(value: any) {
    console.log(value)
    const element = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      element.checked = !!value;
    } else if (element instanceof HTMLInputElement && element.type === 'radio') {
      element.checked = element.value === value;
    } else {
      element.value = value !== null && value !== undefined ? String(value) : '';
    }
  }
}
