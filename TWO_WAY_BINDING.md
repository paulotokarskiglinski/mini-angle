# Two-Way Binding in Mini-Angle

## Overview

Two-way binding allows automatic synchronization of data between the component and form elements. Mini-Angle implements this using the `[(angleModel)]` directive, following Angular's `[(ngModel)]` pattern.

## Syntax

The two-way binding syntax uses the "banana-in-a-box" notation:

```html
<input [(angleModel)]="propertyName">
```

This is syntactic sugar that expands to:
- `[angleModel]="propertyName"` (input binding - component to view)
- `(angleModelChange)="propertyName=$event"` (output binding - view to component)

## How It Works

1. **Initial Value**: The directive reads the component property and sets it on the form element
2. **User Input**: When the user types/changes the value, the directive captures the event
3. **Emit Change**: The directive emits the new value through `angleModelChange`
4. **Update Component**: The framework updates the component property
5. **Re-render**: The component re-renders, updating any interpolations that use the property

## Using angleModel

### Text Inputs

```typescript
import { Component, AngleModelDirective } from 'mini-angle';

@Component({
  selector: 'my-form',
  imports: [AngleModelDirective],
  template: `
    <input type="text" [(angleModel)]="username" placeholder="Enter username">
    <p>Hello, {{ username }}!</p>
  `
})
export class MyFormComponent {
  username: string = '';
}
```

### Email Inputs

```html
<input type="email" [(angleModel)]="email" placeholder="your@email.com">
<p>Email: {{ email }}</p>
```

### Textarea

```html
<textarea [(angleModel)]="bio" rows="4" placeholder="Tell us about yourself"></textarea>
<p>Character count: {{ bio.length }}</p>
```

### Number Inputs

```html
<input type="number" [(angleModel)]="age" min="0" max="120">
<p>You are {{ age }} years old</p>
```

The directive automatically converts the value to a number for `type="number"` inputs.

### Checkboxes

```html
<input type="checkbox" [(angleModel)]="agreed" id="agree">
<label for="agree">I agree to the terms</label>
<p>Status: {{ agreed ? 'Agreed' : 'Not agreed' }}</p>
```

For checkboxes, the directive binds to the `checked` property (boolean).

### Select Dropdowns

```html
<select [(angleModel)]="selectedColor">
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>
<p>Selected: {{ selectedColor }}</p>
```

## Complete Example

```typescript
import { Component, AngleModelDirective } from 'mini-angle';

@Component({
  selector: 'user-form',
  imports: [AngleModelDirective],
  template: `
    <h2>User Registration</h2>
    
    <div class="form-group">
      <label>Name:</label>
      <input type="text" [(angleModel)]="name" placeholder="Your name">
    </div>
    
    <div class="form-group">
      <label>Email:</label>
      <input type="email" [(angleModel)]="email" placeholder="your@email.com">
    </div>
    
    <div class="form-group">
      <label>Age:</label>
      <input type="number" [(angleModel)]="age" min="0" max="120">
    </div>
    
    <div class="form-group">
      <label>Bio:</label>
      <textarea [(angleModel)]="bio" rows="4"></textarea>
    </div>
    
    <div class="form-group">
      <input type="checkbox" [(angleModel)]="subscribeNewsletter" id="newsletter">
      <label for="newsletter">Subscribe to newsletter</label>
    </div>
    
    <div class="output">
      <h3>Preview:</h3>
      <p>Name: {{ name }}</p>
      <p>Email: {{ email }}</p>
      <p>Age: {{ age }}</p>
      <p>Bio: {{ bio }}</p>
      <p>Newsletter: {{ subscribeNewsletter ? 'Yes' : 'No' }}</p>
    </div>
  `
})
export class UserFormComponent {
  name: string = '';
  email: string = '';
  age: number = 18;
  bio: string = '';
  subscribeNewsletter: boolean = false;
}
```

## Supported Input Types

The `angleModel` directive supports all standard HTML form elements:

- `<input type="text">` - String values
- `<input type="email">` - String values
- `<input type="password">` - String values
- `<input type="number">` - Number values (auto-converted)
- `<input type="checkbox">` - Boolean values
- `<input type="radio">` - String values
- `<textarea>` - String values
- `<select>` - String values

## Key Features

✅ **Angular-compatible syntax**: Uses familiar `[(angleModel)]` notation  
✅ **Automatic type conversion**: Numbers for `type="number"`, booleans for checkboxes  
✅ **No focus loss**: Updates are reactive and don't recreate DOM elements  
✅ **Cursor preservation**: Typing experience is smooth and natural  
✅ **Multiple form elements**: Works with all standard HTML form controls  
✅ **Clean and simple**: Just add the directive to your imports and use it

## Implementation Details

The `AngleModelDirective`:
1. Uses `@Input` to receive the initial value
2. Uses `@Output` to emit changes via `angleModelChange`
3. Injects `ElementRef` to access the native DOM element
4. Sets up appropriate event listeners based on element type
5. Converts values to appropriate types (string, number, boolean)

The framework's two-way binding processor:
1. Detects `[(property)]` syntax in templates
2. Expands it to `[property]` and `(propertyChange)` bindings
3. Handles the data flow in both directions
4. Triggers re-renders only for text interpolations (no DOM recreation)

## Best Practices

1. **Import the directive**: Always include `AngleModelDirective` in your component's imports
2. **Initialize properties**: Give default values to properties used with `[(angleModel)]`
3. **Use appropriate types**: Match TypeScript types to input types (string, number, boolean)
4. **Add validation**: Use HTML5 validation attributes (`min`, `max`, `required`, etc.)
5. **Provide labels**: Use proper `<label>` elements for accessibility

## Differences from Angular

This implementation follows Angular's conventions but is simplified:

- No template-driven forms module required (directive is standalone)
- No ngModel validators (use HTML5 validation)
- No ngModelOptions for debouncing (updates happen immediately)
- Simpler implementation (no zones, observables, or complex change detection)
- Automatic parent re-rendering (no manual change detection needed)
