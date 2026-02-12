import { Component, inject, AngleModelDirective } from 'mini-angle';
import { AboutComponent } from './about.component';
import { HighlightDirective } from './highlight.directive';
import { CountService } from './count.service';
import { RepeatComplexComponent } from './repeat-complex.component';

@Component({
  selector: 'app',
  imports: [AboutComponent, HighlightDirective, RepeatComplexComponent, AngleModelDirective],
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

    .two-way-section {
      background-color: #fff;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .two-way-section h3 {
      margin-top: 0;
      color: #007bff;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #007bff;
    }

    .demo-output {
      background-color: #f0f8ff;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
      border-left: 4px solid #007bff;
    }

    .demo-output p {
      margin: 4px 0;
      font-size: 14px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }
  `,
  template: `
    <h1>{{ title }}</h1>
    <p appHighlight>{{ description }}</p>

    <br>

    <about></about>

    <br>

    <h2>Two-Way Binding Demo</h2>

    <div class="two-way-section">
      <h3>Input Fields with [(angleModel)]</h3>
      
      <div class="form-group">
        <label>Username:</label>
        <input type="text" [(angleModel)]="userName" placeholder="Enter your name" />
      </div>
      
      <div class="form-group">
        <label>Email:</label>
        <input type="email" [(angleModel)]="userEmail" placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label>Bio:</label>
        <textarea [(angleModel)]="userBio" placeholder="Tell us about yourself" rows="3"></textarea>
      </div>

      <div class="demo-output">
        <p><strong>Live Output:</strong></p>
        <p>Username: {{ userName }}</p>
        <p>Email: {{ userEmail }}</p>
        <p>Bio: {{ userBio }}</p>
      </div>
    </div>

    <div class="two-way-section">
      <h3>Number Inputs and Checkboxes</h3>
      
      <div class="form-group">
        <label>Quantity:</label>
        <input type="number" [(angleModel)]="quantity" min="0" max="100" />
      </div>
      
      <div class="form-group">
        <label>Price:</label>
        <input type="number" [(angleModel)]="price" min="0" step="0.01" />
      </div>

      <div class="checkbox-group">
        <input type="checkbox" [(angleModel)]="agreedToTerms" id="terms" />
        <label for="terms">I agree to the terms and conditions</label>
      </div>

      <div class="demo-output">
        <p><strong>Live Calculation:</strong></p>
        <p>Quantity: {{ quantity }}</p>
        <p>Price: \${{ price }}</p>
        <p>Total: \${{ quantity * price }}</p>
        <p>Agreed to terms: {{ agreedToTerms ? 'Yes' : 'No' }}</p>
      </div>
    </div>

    <br>

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

  // Two-way binding properties
  userName: string = '';
  userEmail: string = '';
  userBio: string = '';
  quantity: number = 5;
  price: number = 10.99;
  agreedToTerms: boolean = false;

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
}
