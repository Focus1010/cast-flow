let sdk = null;
let isInitialized = false;

export const initializeFarcasterSDK = async () => {
  if (isInitialized) return true;
  
  try {
    console.log('Initializing Farcaster SDK...');
    
    // Dynamic import to avoid SSR issues
    const { sdk: farcasterSDK } = await import('@farcaster/miniapp-sdk');
    sdk = farcasterSDK;
    
    // Check if we're in Farcaster environment
    if (typeof window !== 'undefined' && window.parent !== window) {
      // Initialize the SDK
      if (sdk && typeof sdk.init === 'function') {
        await sdk.init();
        
        // Call ready to hide splash screen
        if (sdk.actions && typeof sdk.actions.ready === 'function') {
          sdk.actions.ready();
        }
      }
    }
    
    isInitialized = true;
    console.log('Farcaster SDK initialized successfully');
    
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
    return sdk?.context?.user || null;
  } catch (error) {
    console.error('Error getting Farcaster user:', error);
    return null;
  }
};

export const getFarcasterContext = () => {
  try {
    return sdk?.context || null;
  } catch (error) {
    console.error('Error getting Farcaster context:', error);
    return null;
  }
};

export const getSDK = () => sdk;
