import { Injectable } from 'mini-angle';

@Injectable({
  providedIn: 'root'
})
export class CountService {
  private count: number = 0;

  get(): number {
    return this.count;
  }

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  reset(): void {
    this.count = 0;
  }
}
