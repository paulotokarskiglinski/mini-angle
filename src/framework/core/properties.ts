export function processPropertyBindings(root: ParentNode, context: any, componentSelectors?: string[]): void {
  const elements = root.querySelectorAll('*');

  elements.forEach(el => {
    // Skip child components - they'll handle their own property bindings
    if ((el as HTMLElement).getAttribute('angle-component-id')) {
      return;
    }

    // Skip component selector elements (they have @Input bindings handled by imports.ts)
    const tagName = el.tagName.toLowerCase();
    if (componentSelectors && componentSelectors.includes(tagName)) {
      return;
    }

    Array.from(el.attributes).forEach(attr => {
      const match = attr.name.match(/^\[(.+)\]$/);

      if (match) {
        const propertyName = match[1];
        const expression = attr.value;

        // Check for local context (loop variables)
        let localCtx = {};
        let currentElement = el as any;
        
        while (currentElement) {
          const contextData = currentElement.getAttribute('angle-data-local-context');
          if (contextData) {
            try {
              localCtx = JSON.parse(contextData);
              break;
            } catch (e) {
              console.error('Failed to parse context data:', e);
            }
          }
          currentElement = currentElement.parentElement;
        }

        // Merge local context with parent context
        let evaluationContext = context;
        if (localCtx && Object.keys(localCtx).length > 0) {
          evaluationContext = Object.create(context);
          Object.assign(evaluationContext, localCtx);
        }

        try {
          const value = new Function('with(this) { return ' + expression + ' }').call(evaluationContext);
          
          // Set the property on the element (case-insensitive to handle HTML attribute lowercasing)
          const propertyNameLower = propertyName.toLowerCase();
          if (propertyNameLower === 'ngmodel') {
            // Handle different input types for ngModel
            const inputEl = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (inputEl instanceof HTMLInputElement) {
              if (inputEl.type === 'checkbox') {
                // For checkboxes, bind to the checked property
                inputEl.checked = !!value;
              } else if (inputEl.type === 'radio') {
                // For radio buttons, check if the value matches
                inputEl.checked = inputEl.value === String(value);
              } else {
                // For text, number, email, etc., bind to value
                inputEl.value = value ?? '';
              }
            } else if (inputEl instanceof HTMLSelectElement || inputEl instanceof HTMLTextAreaElement) {
              // For select and textarea, bind to value
              inputEl.value = value ?? '';
            }
          } else if (propertyNameLower === 'disabled') {
            (el as HTMLInputElement).disabled = !!value;
          } else if (propertyNameLower === 'checked') {
            (el as HTMLInputElement).checked = !!value;
          } else if (propertyNameLower === 'textcontent') {
            el.textContent = value;
          } else if (propertyNameLower === 'innerhtml') {
            el.innerHTML = value;
          } else {
            // Generic property/attribute setting
            try {
              (el as any)[propertyName] = value;
            } catch {
              el.setAttribute(propertyName, value);
            }
          }
        } catch (err) {
          console.error(`Property Binding Error [${propertyName}]:`, err);
        }
      }
    });
  });
}
