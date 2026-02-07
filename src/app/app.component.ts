import { Component, inject } from 'mini-angle';
import { AboutComponent } from './about.component';
import { HighlightDirective } from './highlight.directive';
import { CountService } from './count.service';
import { RepeatComplexComponent } from './repeat-complex.component';
import { TwoWayBindingExampleComponent } from './two-way-binding-example.component';

@Component({
  selector: 'app',
  imports: [AboutComponent, HighlightDirective, RepeatComplexComponent, TwoWayBindingExampleComponent],
  styles: `
    :host {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #fafafa;
      border-radius: 8px;
    }
    
    h1, h2, h3 {
      color: #333;
      text-align: center;
    }
    
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background-color: #0056b3;
    }
    
    .counter-section {
      gap: 0.5rem;
      display: flex;
      align-items: center;
    }

    ul.list {
      padding-left: 1rem;
      list-style-type: none;

      li {
        padding-bottom: 0.5rem;
      }
    }
  `,
  template: `
    <h1>{{ title }}</h1>
    <p appHighlight>{{ description }}</p>

    <br>

    <about></about>

    <br>

    <h2>Examples</h2>

    <br>
    
    <div class="counter-section">
      <span>Count: {{ count }}</span>
      <button type="button" (click)="onAdd()">+</button>
      <button type="button" (click)="onSubtract()">-</button>
      <span angle-if="count === 0">Visible if count is equals to 0.</span>
    </div>

    <br>

    <p>List:</p>
    <ul class="list">
      <li angle-for="let item of list; index as i; count as c; first as f; last as l">
        <div angle-if="item !== 'Banana'">
          <span>#{{ i + 1 }}</span>
          <span angle-if="f">(first)</span>
          <span angle-if="l">(last)</span>
          <button type="button" (click)="onClick(item)">{{ item }}</button>  
        </div>
      </li>
      <small>List length: {{ list.length }}</small>
    </ul>

    <br>

    <h2>Two-Way Binding Examples</h2>
    <two-way-binding-example></two-way-binding-example>

    <br>

    <h2>Repeat Complex Components</h2>

    <ul>
      <li angle-for="let item of repeat; index as i">
        <repeat-complex [id]="i" (clickedEvent)="onClickedEvent($event)"></repeat-complex>
      </li>
    </ul>
  `
})
export class AppComponent {
  private readonly countService = inject(CountService);
  
  title = 'Welcome to  Mini-Angle!';

  description = 'Interpolation is working!';

  list: string[] = ['Apple', 'Banana', 'Grape'];

  repeat: number[] = Array.from({ length: 5 });

  user = {
    name: 'Paulo',
    github: 'paulotokarskiglinski'
  }

  get count() {
    return this.countService.get();
  }

  onAdd() {
    this.countService.increment();
  }

  onSubtract() {
    this.countService.decrement();
  }

  onClick(item: string) {
    console.log(item);
  }

  onClickedEvent(event: number) {
    console.log(`Interacted with Component #${event}!`);
  }

  test(event: string) {
    console.log(event)
  }
}
