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
    
    <p>Count: {{ count + 1 }}</p>

    <div angle-if="count >= 30">Visible if count is equals to 0.</div>

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

  onClick(item: string) {
    console.log(item)
  }
}
