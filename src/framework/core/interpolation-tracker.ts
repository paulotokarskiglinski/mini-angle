// Track interpolation bindings for efficient updates
interface InterpolationBinding {
  textNode: Text;
  templatePattern: string; // Original pattern like "Hello, {{ name }}!"
}

const interpolationBindings = new Map<string, InterpolationBinding[]>();

function getNodePath(node: Node, root: Node): number[] {
  const path: number[] = [];
  let current: Node | null = node;
  
  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) break;
    
    const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
    path.unshift(index);
    current = parent;
  }
  
  return path;
}

export function trackInterpolations(selector: string, template: string, root: HTMLElement, context: any) {
  const bindings: InterpolationBinding[] = [];
  
  // Parse template DOM to find interpolation patterns with their paths
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;
  
  const patternInfo: Array<{pattern: string; path: number[]}> = [];
  
  // Walk through text nodes in the template
  const templateWalker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
  let templateTextNode: Node | null;
  
  while ((templateTextNode = templateWalker.nextNode())) {
    const text = (templateTextNode as Text).textContent || '';
    if (text.includes('{{') && text.includes('}}')) {
      const path = getNodePath(templateTextNode, tempDiv);
      patternInfo.push({
        pattern: text,
        path: path
      });
    }
  }
  
  // Now walk through the actual rendered DOM using the same paths
  for (const info of patternInfo) {
    // Navigate to the same position in the actual DOM
    let currentNode: Node = root;
    let found = true;
    let lastElement: Element | null = null;
    
    for (const index of info.path) {
      // Track the last element we visited
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        lastElement = currentNode as Element;
      }
      
      if (currentNode.childNodes[index]) {
        currentNode = currentNode.childNodes[index];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && currentNode.nodeType === Node.TEXT_NODE) {
      const textNode = currentNode as Text;
      const parent = textNode.parentElement;
      
      // Skip if parent is an input/textarea/select
      if (parent && !parent.tagName.match(/^(SCRIPT|STYLE|INPUT|TEXTAREA|SELECT)$/)) {
        bindings.push({
          textNode: textNode,
          templatePattern: info.pattern
        });
      }
    } else if (found && currentNode.nodeType === Node.ELEMENT_NODE) {
      // The path led to an element, not a text node
      // This might happen if the browser didn't create a text node for empty content
      const element = currentNode as Element;
      
      // Check if this element should have a text node
      if (element.childNodes.length === 0 && !element.tagName.match(/^(SCRIPT|STYLE|INPUT|TEXTAREA|SELECT)$/)) {
        // Create a text node for this interpolation
        const newTextNode = document.createTextNode('');
        element.appendChild(newTextNode);
        bindings.push({
          textNode: newTextNode,
          templatePattern: info.pattern
        });
      }
    } else if (!found && lastElement) {
      // Path didn't fully resolve - likely because the text node doesn't exist due to empty initial value
      // Create a text node in the last element we reached
      if (lastElement.childNodes.length === 0 && !lastElement.tagName.match(/^(SCRIPT|STYLE|INPUT|TEXTAREA|SELECT)$/)) {
        const newTextNode = document.createTextNode('');
        lastElement.appendChild(newTextNode);
        bindings.push({
          textNode: newTextNode,
          templatePattern: info.pattern
        });
      }
    }
  }
  
  interpolationBindings.set(selector, bindings);
}

export function updateInterpolations(selector: string, context: any) {
  const bindings = interpolationBindings.get(selector);
  if (!bindings) return;
  
  bindings.forEach(binding => {
    try {
      // Re-interpolate the template pattern with current context
      const newText = binding.templatePattern.replace(/{{(.*?)}}/g, (_, expr) => {
        try {
          return String(new Function('with(this) { return ' + expr.trim() + ' }').call(context));
        } catch (e) {
          return '';
        }
      });
      
      binding.textNode.textContent = newText;
    } catch (e) {
      console.error('Failed to update interpolation:', e);
    }
  });
}
