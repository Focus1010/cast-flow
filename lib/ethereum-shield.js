/**
 * This module protects against wallet extension conflicts by:
 * 1. Detecting attempts to redefine window.ethereum
 * 2. Preventing double injections
 * 3. Harmonizing wallet behaviors
 */

export function setupEthereumShield() {
  if (typeof window === 'undefined') return; // Skip on server-side

  console.log('Setting up ethereum provider conflict shield');
  
  try {
    // Store original descriptor if it exists
    let originalEthereumDescriptor = null;
    
    if (window.ethereum) {
      try {
        originalEthereumDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
      } catch (e) {
        console.warn('Failed to get ethereum descriptor:', e);
      }
    }
    
    // Create a defensive wrapper that prevents conflicts
    if (originalEthereumDescriptor) {
      try {
        // Create a proxy to the ethereum object that prevents extensions from breaking it
        const ethereumProxy = new Proxy(window.ethereum, {
          set: function(target, prop, value) {
            // Allow setting properties on the object but not replacing the object
            target[prop] = value;
            return true;
          },
          get: function(target, prop) {
            return target[prop];
          }
        });
        
        // Override the property descriptor to prevent full replacement
        Object.defineProperty(window, 'ethereum', {
          configurable: false, // Prevent reconfiguring this property
          enumerable: true,
          get: function() {
            return ethereumProxy;
          },
          set: function(newValue) {
            console.warn('Attempt to override window.ethereum was blocked');
            // Merge any new provider properties but don't replace the object
            if (newValue && typeof newValue === 'object') {
              for (const key in newValue) {
                if (!ethereumProxy[key]) {
                  ethereumProxy[key] = newValue[key];
                }
              }
            }
            return ethereumProxy;
          }
        });
      } catch (e) {
        console.error('Failed to protect ethereum provider:', e);
      }
    }
    
  } catch (error) {
    console.error('Error in ethereum shield setup:', error);
  }
}
