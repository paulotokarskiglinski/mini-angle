import { Component } from 'mini-angle';

@Component({
  selector: '#app',
  template: `
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <br>

    <p>User: {{ user.name }}</p>
    <p>GitHub: {{ user.github }}</p>
    
    <br>
    
    <div style="display: flex; gap: 1rem">
      <span>Count: {{ count }}</span>
      <button type="button" (click)="onAdd()">+</button>
      <button type="button" (click)="onSubtract()">-</button>
      <span angle-if="count === 0">Visible if count is equals to 0.</span>
    </div>

    <ul>
      <li angle-for="let item of list">
        <div angle-if="item !== 'Banana'">
          <button type="button" (click)="onClick(item)">{{ item }}</button>  
        </div>
      </li>
    </ul>
  `
})
export class AppComponent {
  title = 'Welcome to  Mini-Angle!';

  description = 'Interpolation is working!';

  count: number = 0;

  list: string[] = ['Apple', 'Banana', 'Grape'];

  user = {
    name: 'Paulo',
    github: 'paulotokarskiglinski'
  }

  onAdd() {
    this.count = this.count + 1;
  }

  onSubtract() {
    this.count = this.count - 1;
  }

  onClick(item: string) {
    console.log(item)
  }
}
