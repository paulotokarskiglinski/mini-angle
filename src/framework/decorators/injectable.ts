import { register } from 'framework/core/injection';

export interface InjectableOptions {
  providedIn?: 'root' | null;
}

export function Injectable(options: InjectableOptions) {
  return function (target: any) {
    target.isInjectable = true;
    target.injectableOptions = options;

    if (target.injectableOptions.providedIn === 'root') {
      register(target, new target());
    }
  }
}
