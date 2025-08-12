import { Component, inject } from 'mini-angle';
import { AboutComponent } from './about.component';
import { HighlightDirective } from './highlight.directive';
import { CountService } from './count.service';

@Component({
  selector: 'app',
  imports: [AboutComponent, HighlightDirective],
  styles: `
    :host {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #fafafa;
      border-radius: 8px;
    }
    
    h1 {
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

    <p>User: {{ user.name }}</p>
    <p>GitHub: {{ user.github }}</p>
    
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
      <li angle-for="let item of list">
        <div angle-if="item !== 'Banana'">
          <button type="button" (click)="onClick(item)">{{ item }}</button>  
        </div>
      </li>
    </ul>

  <br>

  <about></about>
  `
})
export class AppComponent {
  private readonly countService = inject(CountService);

  title = 'Welcome to  Mini-Angle!';

  description = 'Interpolation is working!';

  list: string[] = ['Apple', 'Banana', 'Grape'];

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
    console.log(item)
  }
}
