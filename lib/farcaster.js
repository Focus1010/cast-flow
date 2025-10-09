import { sdk } from '@farcaster/miniapp-sdk';

let isInitialized = false;

export const initializeFarcasterSDK = async () => {
  if (isInitialized) return;
  
  try {
    console.log('Initializing Farcaster SDK...');
    
    // Initialize the SDK
    await sdk.init();
    
    // Call ready to hide splash screen
    sdk.actions.ready();
    
    isInitialized = true;
    console.log('Farcaster SDK initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
    return false;
  }
};

export const getFarcasterUser = () => {
  try {
    return sdk.context.user;
  } catch (error) {
    console.error('Error getting Farcaster user:', error);
    return null;
  }
};

export const getFarcasterContext = () => {
  try {
    return sdk.context;
  } catch (error) {
    console.error('Error getting Farcaster context:', error);
    return null;
  }
};

export { sdk };
