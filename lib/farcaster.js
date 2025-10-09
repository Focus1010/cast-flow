let sdk = null;
let isInitialized = false;

export const initializeFarcasterSDK = async () => {
  if (isInitialized) return true;
  
  try {
    console.log('Initializing Farcaster SDK...');
    
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      isInitialized = true;
      return false;
    }
    
    // Dynamic import to avoid SSR issues
    const farcasterModule = await import('@farcaster/miniapp-sdk');
    sdk = farcasterModule.sdk || farcasterModule.default || farcasterModule;
    
    // Check if we have a valid SDK
    if (!sdk) {
      console.warn('Farcaster SDK not found in module');
      isInitialized = true;
      return false;
    }
    
    // Initialize the SDK if we're in an iframe (Farcaster environment)
    const isInFarcaster = window.parent !== window || 
                         window.location !== window.parent.location ||
                         document.referrer.includes('farcaster') ||
                         window.navigator.userAgent.includes('Farcaster');
    
    if (isInFarcaster && sdk.init && typeof sdk.init === 'function') {
      try {
        await sdk.init();
        console.log('Farcaster SDK initialized successfully');
        
        // Call ready to hide splash screen
        if (sdk.actions && typeof sdk.actions.ready === 'function') {
          sdk.actions.ready();
          console.log('Farcaster SDK ready() called');
        }
      } catch (initError) {
        console.error('SDK init failed:', initError);
      }
    } else {
      console.log('Not in Farcaster environment or SDK init not available');
    }
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
    // Don't fail the app if SDK fails
    isInitialized = true;
    return false;
  }
};

export const getFarcasterUser = () => {
  try {
    if (!sdk || !sdk.context) {
      return null;
    }
    
    const user = sdk.context.user;
    
    // If user is a Proxy or function, try to extract actual data
    if (typeof user === 'function' || (user && user.constructor && user.constructor.name === 'Proxy')) {
      console.warn('Farcaster user is a Proxy/Function, cannot extract data safely');
      return null;
    }
    
    // Return the user if it's a proper object
    if (user && typeof user === 'object' && user.fid) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Farcaster user:', error);
    return null;
  }
};

export const getFarcasterContext = () => {
  try {
    if (!sdk || !sdk.context) {
      return null;
    }
    
    const context = sdk.context;
    
    // If context is a Proxy or function, try to extract actual data
    if (typeof context === 'function' || (context && context.constructor && context.constructor.name === 'Proxy')) {
      console.warn('Farcaster context is a Proxy/Function, cannot extract data safely');
      return null;
    }
    
    return context;
  } catch (error) {
    console.error('Error getting Farcaster context:', error);
    return null;
  }
};

export const getSDK = () => sdk;
