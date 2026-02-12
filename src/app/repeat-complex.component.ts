import { Component, EventEmitter, Input, Output, AngleModelDirective } from "mini-angle";

@Component({
  selector: 'repeat-complex',
  imports: [AngleModelDirective],
  styles: `
    :host {
      display: block;
      border: 1px solid #ddd;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    p.title {
      margin-top: 0;
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }

    .content {
      margin: 8px 0;
    }

    .stats {
      display: flex;
      gap: 16px;
      margin: 8px 0;
      font-size: 14px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      color: #666;
      font-size: 12px;
    }

    .stat-value {
      font-weight: bold;
      color: #007bff;
    }

    button {
      color: white;
      border: none;
      padding: 6px 12px;
      margin-right: 6px;
      margin-bottom: 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .items-list {
      margin: 8px 0;
      padding-left: 16px;
    }

    .item {
      padding: 4px 0;
      font-size: 13px;
    }

    .message {
      padding: 8px;
      margin: 8px 0;
      border-radius: 3px;
      font-size: 13px;
    }

    .message.info {
      background-color: #e7f3ff;
      color: #0066cc;
      border: 1px solid #b3d9ff;
    }

    .message.success {
      background-color: #e6ffed;
      color: #269926;
      border: 1px solid #b3e6b3;
    }

    .message.warning {
      background-color: #fff4e6;
      color: #cc8800;
      border: 1px solid #ffcc99;
    }
  `,
  template: `
    <p class="title">Component #{{ id }}</p>

    <div class="message info">
      <strong>Testing all framework features:</strong> interpolation, events, conditionals, loops, and service injection
    </div>

    <div class="form-group">
      <label>Username:</label>
      <input type="text" [(angleModel)]="tester" placeholder="Enter your name" />
    </div>

    <p><b>Username: </b>{{ tester }}</p>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Click Count</span>
        <span class="stat-value">{{ count }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Total Clicks</span>
        <span class="stat-value">{{ totalClicks }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Items Created</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Status</span>
        <span class="stat-value">{{ isActive ? 'Active' : 'Inactive' }}</span>
      </div>
    </div>

    <div class="content">
      <button type="button" (click)="incrementCount()">+ Counter</button>
      <button type="button" (click)="decrementCount()" angle-if="count > 0">- Counter</button>
      <button type="button" (click)="toggleActive()">Toggle Active</button>
      <button type="button" (click)="addItem()">Add Item</button>
      <button type="button" (click)="clearItems()" angle-if="items.length > 0">Clear Items</button>
      <button type="button" (click)="reset()">Reset All</button>
    </div>

    <div angle-if="isActive" class="message success">
      ✓ Component is currently active
    </div>

    <div angle-if="!isActive" class="message warning">
      ⚠ Component is currently inactive
    </div>

    <div angle-if="count > 5" class="message info">
      ℹ You have clicked more than 5 times! Current count: {{ count }}
    </div>

    <div angle-if="items.length > 0">
      <strong>Items List:</strong>
      <ul class="items-list">
        <li angle-for="let item of items; index as i; first as f; last as l" class="item">
          <span angle-if="f" style="color: green;">★ </span>
          [{{ i + 1 }}] {{ item.name }} - Created at: {{ item.time }}
          <span angle-if="l" style="color: blue;"> ★</span>
        </li>
      </ul>
    </div>

    <div angle-if="items.length === 0" class="message info">
      No items yet. Click "Add Item" to create one.
    </div>
  `
})
export class RepeatComplexComponent {
  @Input id: number = 0;
  @Output clickedEvent = new EventEmitter<number>();

  tester: string = 'Test';

  count: number = 0;
  totalClicks: number = 0;
  isActive: boolean = true;
  items: Array<{ name: string; time: string }> = [];

  incrementCount() {
    this.count++;
    this.totalClicks++;
    this.clickedEvent.emit(this.id);
    console.log(`[Component #${this.id}] Counter incremented to ${this.count}`);
  }

  decrementCount() {
    if (this.count > 0) {
      this.count--;
      this.totalClicks++;
      this.clickedEvent.emit(this.id);
      console.log(`[Component #${this.id}] Counter decremented to ${this.count}`);
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
    this.clickedEvent.emit(this.id);
    console.log(`[Component #${this.id}] Active state: ${this.isActive}`);
  }

  addItem() {
    const timestamp = new Date().toLocaleTimeString();
    this.items.push({
      name: `Item ${this.items.length + 1}`,
      time: timestamp
    });
    this.clickedEvent.emit(this.id);
    console.log(`[Component #${this.id}] Item added. Total items: ${this.items.length}`);
  }

  clearItems() {
    const count = this.items.length;
    this.items = [];
    this.clickedEvent.emit(this.id);
    console.log(`[Component #${this.id}] Cleared ${count} items`);
  }

  reset() {
    this.count = 0;
    this.totalClicks = 0;
    this.isActive = true;
    this.items = [];
    this.clickedEvent.emit(this.id);
    console.log(`[Component #${this.id}] All state reset`);
  }
}

