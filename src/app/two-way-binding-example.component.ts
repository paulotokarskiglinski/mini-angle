import { Component, NgModelDirective } from "mini-angle";

@Component({
  selector: 'two-way-binding-example',
  imports: [NgModelDirective],
  styles: `
    :host {
      display: block;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .section h3 {
      margin-top: 0;
      color: #fff;
      border-bottom: 2px solid rgba(255, 255, 255, 0.3);
      padding-bottom: 10px;
      font-size: 18px;
    }

    .form-group {
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    label {
      font-weight: 500;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="password"],
    textarea,
    select {
      padding: 10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      transition: all 0.3s ease;
    }

    input[type="text"]:focus,
    input[type="email"]:focus,
    input[type="number"]:focus,
    input[type="password"]:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
      background: white;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
      font-family: inherit;
    }

    input[type="checkbox"],
    input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin-right: 8px;
    }

    .checkbox-group,
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-item,
    .radio-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .checkbox-item:hover,
    .radio-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .output {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #4CAF50;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      margin-top: 15px;
    }

    .output-label {
      color: #4CAF50;
      font-weight: bold;
      margin-bottom: 8px;
    }

    button {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-right: 10px;
      margin-top: 10px;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    button:active {
      transform: translateY(0);
    }

    button:disabled {
      background: rgba(150, 150, 150, 0.5);
      cursor: not-allowed;
      transform: none;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }

    .warning {
      background: rgba(255, 152, 0, 0.2);
      border-left-color: #FF9800;
      color: #fff;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .success {
      background: rgba(76, 175, 80, 0.2);
      border-left-color: #4CAF50;
      color: #fff;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .inline-inputs {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .inline-inputs input {
      flex: 1;
      min-width: 150px;
    }

    .sync-indicator {
      color: #4CAF50;
      font-size: 12px;
      font-weight: bold;
      margin-top: 5px;
    }
  `,
  template: `
    <h2 style="margin-top: 0; text-align: center; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
      🔄 Two-Way Binding Comprehensive Examples
    </h2>

    <!-- Section 1: Basic Text Input -->
    <div class="section">
      <h3>📝 1. Basic Text Input</h3>
      <div class="form-group">
        <label>Enter your name:</label>
        <input type="text" [(ngModel)]="name" placeholder="Type your name...">
        <div class="output">
          <div class="output-label">Live Output:</div>
          <div>Hello, <strong>{{ name }}</strong>!</div>
          <div class="sync-indicator">✓ Synced in real-time</div>
        </div>
      </div>
    </div>

    <!-- Section 2: Multiple Inputs Bound to Same Property -->
    <div class="section">
      <h3>🔗 2. Multiple Inputs - Same Property</h3>
      <div class="form-group">
        <label>Username (edit from any input):</label>
        <div class="inline-inputs">
          <input type="text" [(ngModel)]="username" placeholder="Input 1">
          <input type="text" [(ngModel)]="username" placeholder="Input 2">
          <input type="text" [(ngModel)]="username" placeholder="Input 3">
        </div>
        <div class="output">
          <div class="output-label">Shared Value:</div>
          <div>Username: <strong>{{ username }}</strong></div>
          <div>Length: <strong>{{ username.length }}</strong> characters</div>
        </div>
      </div>
    </div>

    <!-- Section 3: Email and Custom Handler -->
    <div class="section">
      <h3>📧 3. Email with Custom Event Handler</h3>
      <div class="form-group">
        <label>Email Address:</label>
        <input type="email" [(ngModel)]="email" (ngModelChange)="onEmailChange($event)" placeholder="your@email.com">
        <div class="output">
          <div class="output-label">Email Data:</div>
          <div>Current: <strong>{{ email }}</strong></div>
          <div>Valid format: <strong angle-if="isEmailValid">✓ Yes</strong><strong angle-if="!isEmailValid">✗ No</strong></div>
          <div>Change count: <strong>{{ emailChangeCount }}</strong></div>
        </div>
        <div class="success" angle-if="isEmailValid">
          ✓ Email format looks good!
        </div>
        <div class="warning" angle-if="!isEmailValid && email.length > 0">
          ⚠ Please enter a valid email format
        </div>
      </div>
    </div>

    <!-- Section 4: Number Input -->
    <div class="section">
      <h3>🔢 4. Number Input with Calculations</h3>
      <div class="grid-2">
        <div class="form-group">
          <label>Price ($):</label>
          <input type="number" [(ngModel)]="price" placeholder="0">
        </div>
        <div class="form-group">
          <label>Quantity:</label>
          <input type="number" [(ngModel)]="quantity" placeholder="0">
        </div>
      </div>
      <div class="output">
        <div class="output-label">Calculations:</div>
        <div>Price: $<strong>{{ price }}</strong></div>
        <div>Quantity: <strong>{{ quantity }}</strong> items</div>
        <div style="font-size: 16px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">
          Total: <strong style="color: #4CAF50;">\${{ price * quantity }}</strong>
        </div>
      </div>
    </div>

    <!-- Section 5: Textarea -->
    <div class="section">
      <h3>📄 5. Textarea - Multi-line Text</h3>
      <div class="form-group">
        <label>Your Message:</label>
        <textarea [(ngModel)]="message" placeholder="Write your message here..."></textarea>
        <div class="output">
          <div class="output-label">Message Analysis:</div>
          <div>Characters: <strong>{{ message.length }}</strong></div>
          <div>Words: <strong>{{ countWords(message) }}</strong></div>
          <div>Lines: <strong>{{ countLines(message) }}</strong></div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
            Preview: {{ message.substring(0, 50) }}<span angle-if="message.length > 50">...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 6: Checkbox -->
    <div class="section">
      <h3>☑️ 6. Checkbox - Boolean Values</h3>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" [(ngModel)]="agreeTerms" id="terms">
          <label for="terms">I agree to the terms and conditions</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" [(ngModel)]="subscribeNewsletter" id="newsletter">
          <label for="newsletter">Subscribe to newsletter</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" [(ngModel)]="enableNotifications" id="notifications">
          <label for="notifications">Enable notifications</label>
        </div>
      </div>
      <div class="output">
        <div class="output-label">Checkbox States:</div>
        <div>Terms Agreed: <strong>{{ agreeTerms ? 'Yes ✓' : 'No ✗' }}</strong></div>
        <div>Newsletter: <strong>{{ subscribeNewsletter ? 'Yes ✓' : 'No ✗' }}</strong></div>
        <div>Notifications: <strong>{{ enableNotifications ? 'Yes ✓' : 'No ✗' }}</strong></div>
      </div>
      <button type="button" (click)="submitForm()" angle-if="agreeTerms">Submit Form</button>
      <div class="warning" angle-if="!agreeTerms">
        ⚠ You must agree to terms before submitting
      </div>
    </div>

    <!-- Section 7: Select Dropdown -->
    <div class="section">
      <h3>🎯 7. Select Dropdown</h3>
      <div class="form-group">
        <label>Choose your country:</label>
        <select [(ngModel)]="selectedCountry">
          <option value="">-- Select Country --</option>
          <option value="USA">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Brazil">Brazil</option>
          <option value="Germany">Germany</option>
          <option value="Japan">Japan</option>
        </select>
        <div class="output">
          <div class="output-label">Selected Country:</div>
          <div angle-if="selectedCountry">
            You selected: <strong>{{ selectedCountry }}</strong> 🌍
          </div>
          <div angle-if="!selectedCountry" class="warning">
            No country selected yet
          </div>
        </div>
      </div>
    </div>

    <!-- Section 8: Password with Toggle -->
    <div class="section">
      <h3>🔒 8. Password Input</h3>
      <div class="form-group">
        <label>Create Password:</label>
        <input type="password" [(ngModel)]="password" placeholder="Enter password">
        <div class="output">
          <div class="output-label">Password Strength:</div>
          <div>Length: <strong>{{ password.length }}</strong>/8 minimum</div>
          <div>Has uppercase: <strong>{{ hasUppercase(password) ? '✓' : '✗' }}</strong></div>
          <div>Has number: <strong>{{ hasNumber(password) ? '✓' : '✗' }}</strong></div>
          <div>Strength: <strong>{{ getPasswordStrength() }}</strong><span class="badge">{{ getPasswordStrengthLabel() }}</span></div>
        </div>
      </div>
    </div>

    <!-- Section 9: Disabled Inputs -->
    <div class="section">
      <h3>🚫 9. Disabled State Control</h3>
      <div class="form-group">
        <div class="checkbox-item">
          <input type="checkbox" [(ngModel)]="enableEditing" id="enableEdit">
          <label for="enableEdit">Enable editing</label>
        </div>
        <label>Controlled Input:</label>
        <input type="text" [(ngModel)]="controlledValue" [disabled]="!enableEditing" placeholder="Enable checkbox to edit">
        <div class="output">
          <div class="output-label">Status:</div>
          <div>Editing: <strong>{{ enableEditing ? 'Enabled ✓' : 'Disabled ✗' }}</strong></div>
          <div>Value: <strong>{{ controlledValue }}</strong></div>
        </div>
      </div>
    </div>

    <!-- Section 10: Two-Way Binding in Loops -->
    <div class="section">
      <h3>🔁 10. Two-Way Binding in Loops</h3>
      <div class="form-group">
        <label>Edit list items:</label>
        <div angle-for="let item of items; index as i" style="margin-bottom: 10px;">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="min-width: 60px;">Item {{ i + 1 }}:</span>
            <input type="text" [(ngModel)]="items[i]" style="flex: 1;">
            <button type="button" (click)="removeItem(i)" style="background: #f44336; margin: 0;">Remove</button>
          </div>
        </div>
        <button type="button" (click)="addItem()">+ Add Item</button>
        <div class="output">
          <div class="output-label">Items Array:</div>
          <div angle-for="let item of items; index as i">
            [{{ i }}]: <strong>{{ item }}</strong>
          </div>
          <div style="margin-top: 10px;">Total Items: <strong>{{ items.length }}</strong></div>
        </div>
      </div>
    </div>

    <!-- Section 11: Object Property Binding -->
    <div class="section">
      <h3>🎯 11. Object Property Binding</h3>
      <div class="grid-2">
        <div class="form-group">
          <label>First Name:</label>
          <input type="text" [(ngModel)]="user.firstName" placeholder="John">
        </div>
        <div class="form-group">
          <label>Last Name:</label>
          <input type="text" [(ngModel)]="user.lastName" placeholder="Doe">
        </div>
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" [(ngModel)]="user.email" placeholder="john@example.com">
      </div>
      <div class="form-group">
        <label>Age:</label>
        <input type="number" [(ngModel)]="user.age" placeholder="25">
      </div>
      <div class="output">
        <div class="output-label">User Object:</div>
        <div>Full Name: <strong>{{ user.firstName }} {{ user.lastName }}</strong></div>
        <div>Email: <strong>{{ user.email }}</strong></div>
        <div>Age: <strong>{{ user.age }}</strong></div>
        <div angle-if="user.age >= 18" class="success" style="margin-top: 10px;">
          ✓ User is an adult
        </div>
        <div angle-if="user.age < 18 && user.age > 0" class="warning" style="margin-top: 10px;">
          ⚠ User is a minor
        </div>
      </div>
    </div>

    <!-- Section 12: Action Buttons -->
    <div class="section">
      <h3>⚡ 12. Actions & Reset</h3>
      <button type="button" (click)="fillSampleData()">Fill Sample Data</button>
      <button type="button" (click)="clearAllData()">Clear All Data</button>
      <button type="button" (click)="logAllData()">Log Data to Console</button>
      <div class="output">
        <div class="output-label">Summary:</div>
        <div>Total fields with data: <strong>{{ countFilledFields() }}</strong></div>
        <div>Form completeness: <strong>{{ getCompleteness() }}%</strong></div>
      </div>
    </div>
  `
})
export class TwoWayBindingExampleComponent {
  // Section 1: Basic text
  name: string = '';

  // Section 2: Multiple inputs
  username: string = 'user123';

  // Section 3: Email with validation
  email: string = '';
  emailChangeCount: number = 0;
  
  get isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  // Section 4: Numbers
  price: number = 10;
  quantity: number = 1;

  // Section 5: Textarea
  message: string = 'This is a sample message.\nYou can edit it!';

  // Section 6: Checkboxes
  agreeTerms: boolean = false;
  subscribeNewsletter: boolean = true;
  enableNotifications: boolean = false;

  // Section 7: Select
  selectedCountry: string = '';

  // Section 8: Password
  password: string = '';

  // Section 9: Disabled control
  enableEditing: boolean = true;
  controlledValue: string = 'Edit me!';

  // Section 10: Arrays
  items: string[] = ['Apple', 'Banana', 'Cherry'];

  // Section 11: Object
  user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 25
  };

  // Methods
  onEmailChange(value: string): void {
    this.emailChangeCount++;
    console.log('Email changed to:', value);
  }

  countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  countLines(text: string): number {
    return text.split('\n').length;
  }

  hasUppercase(text: string): boolean {
    return /[A-Z]/.test(text);
  }

  hasNumber(text: string): boolean {
    return /\d/.test(text);
  }

  getPasswordStrength(): number {
    let strength = 0;
    if (this.password.length >= 8) strength += 25;
    if (this.password.length >= 12) strength += 25;
    if (this.hasUppercase(this.password)) strength += 25;
    if (this.hasNumber(this.password)) strength += 25;
    return strength;
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return 'None';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  }

  submitForm(): void {
    console.log('Form submitted!', {
      agreeTerms: this.agreeTerms,
      newsletter: this.subscribeNewsletter,
      notifications: this.enableNotifications
    });
    alert('Form submitted successfully! Check console for data.');
  }

  addItem(): void {
    this.items.push(`New Item ${this.items.length + 1}`);
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  fillSampleData(): void {
    this.name = 'Alice';
    this.username = 'alice2024';
    this.email = 'alice@example.com';
    this.price = 29.99;
    this.quantity = 3;
    this.message = 'This is sample data that was automatically filled!\nYou can still edit everything.';
    this.agreeTerms = true;
    this.subscribeNewsletter = true;
    this.enableNotifications = true;
    this.selectedCountry = 'USA';
    this.password = 'SecurePass123';
    this.controlledValue = 'Sample controlled value';
    this.user.firstName = 'Alice';
    this.user.lastName = 'Johnson';
    this.user.email = 'alice.j@example.com';
    this.user.age = 28;
  }

  clearAllData(): void {
    this.name = '';
    this.username = '';
    this.email = '';
    this.emailChangeCount = 0;
    this.price = 0;
    this.quantity = 0;
    this.message = '';
    this.agreeTerms = false;
    this.subscribeNewsletter = false;
    this.enableNotifications = false;
    this.selectedCountry = '';
    this.password = '';
    this.controlledValue = '';
    this.items = [];
    this.user = {
      firstName: '',
      lastName: '',
      email: '',
      age: 0
    };
  }

  logAllData(): void {
    console.log('=== ALL FORM DATA ===');
    console.log('Name:', this.name);
    console.log('Username:', this.username);
    console.log('Email:', this.email, '| Valid:', this.isEmailValid);
    console.log('Price:', this.price, '| Quantity:', this.quantity, '| Total:', this.price * this.quantity);
    console.log('Message:', this.message);
    console.log('Checkboxes:', {
      terms: this.agreeTerms,
      newsletter: this.subscribeNewsletter,
      notifications: this.enableNotifications
    });
    console.log('Country:', this.selectedCountry);
    console.log('Password:', '***' + this.password.substring(3), '| Strength:', this.getPasswordStrengthLabel());
    console.log('Controlled Value:', this.controlledValue, '| Editing Enabled:', this.enableEditing);
    console.log('Items:', this.items);
    console.log('User:', this.user);
    console.log('====================');
  }

  countFilledFields(): number {
    let count = 0;
    if (this.name.length > 0) count++;
    if (this.username.length > 0) count++;
    if (this.email.length > 0) count++;
    if (this.price > 0) count++;
    if (this.quantity > 0) count++;
    if (this.message.length > 0) count++;
    if (this.selectedCountry.length > 0) count++;
    if (this.password.length > 0) count++;
    if (this.controlledValue.length > 0) count++;
    if (this.items.length > 0) count++;
    if (this.user.firstName.length > 0) count++;
    if (this.user.lastName.length > 0) count++;
    if (this.user.email.length > 0) count++;
    if (this.user.age > 0) count++;
    return count;
  }

  getCompleteness(): number {
    return Math.round((this.countFilledFields() / 14) * 100);
  }
}
