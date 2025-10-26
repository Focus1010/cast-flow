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
    // First check if ethereum exists
    if (!window.ethereum) {
      console.log('No ethereum provider found, nothing to shield');
      return;
    }
    
    // Store original ethereum provider
    const originalProvider = window.ethereum;
    
    // Check if property is already non-configurable
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    } catch (e) {
      console.warn('Failed to get ethereum descriptor:', e);
      return; // Exit if we can't even get the descriptor
    }
    
    // If already non-configurable, we can't modify it further
    if (descriptor && descriptor.configurable === false) {
      console.log('Ethereum property already protected (non-configurable)');
      return;
    }
    
    try {
      // Monitor attempts to access/modify provider
      const monitoredProvider = new Proxy(originalProvider, {
        // Allow reading properties
        get: function(target, prop) {
          return target[prop];
        },
        // Allow setting properties but not replacing the object
        set: function(target, prop, value) {
          // Only set if the property doesn't exist or is writable
          let propDesc;
          try {
            propDesc = Object.getOwnPropertyDescriptor(target, prop);
          } catch (e) {
            // If we can't check, just try to set it
            target[prop] = value;
            return true;
          }
          
          // If property exists and is not writable, don't change it
          if (propDesc && propDesc.writable === false) {
            console.warn(`Blocked attempt to override read-only ethereum.${prop}`);
            return true; // Pretend it worked to avoid errors
          }
          
          // Otherwise set the property
          target[prop] = value;
          return true;
        }
      });
      
      // Try to make the property non-enumerable to hide it from extensions
      try {
        // First delete the property if possible
        if (descriptor && descriptor.configurable !== false) {
          delete window.ethereum;
        }
        
        // Then redefine it with our protected version
        Object.defineProperty(window, 'ethereum', {
          // Allow future configuration in case we need to update
          configurable: true,
          enumerable: true,
          get: function() {
            return monitoredProvider;
          },
          set: function(newValue) {
            console.warn('Attempt to override window.ethereum was intercepted');
            // Merge any new provider properties
            if (newValue && typeof newValue === 'object') {
              // Copy new properties to original provider
              for (const key in newValue) {
                try {
                  if (!(key in monitoredProvider)) {
                    originalProvider[key] = newValue[key];
                  }
                } catch (e) {
                  console.warn(`Failed to copy property ${key}:`, e);
                }
              }
            }
            return monitoredProvider; // Pretend the assignment worked
          }
        });
        console.log('Ethereum provider successfully protected');
      } catch (e) {
        console.warn('Could not redefine ethereum property, using fallback:', e);
      }
    } catch (e) {
      console.error('Failed to set up ethereum protection:', e);
    }
  } catch (error) {
    console.error('Error in ethereum shield setup:', error);
  }
}
