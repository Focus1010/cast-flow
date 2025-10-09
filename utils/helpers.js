// Helper function to safely get user initials
export const getUserInitials = (user, fallback = 'U') => {
  try {
    if (!user) return fallback;
    
    // Try username first
    if (user.username && typeof user.username === 'string' && user.username.length > 0) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    // Try display_name
    if (user.display_name && typeof user.display_name === 'string' && user.display_name.length > 0) {
      return user.display_name.substring(0, 2).toUpperCase();
    }
    
    // Try fid
    if (user.fid) {
      return `U${user.fid.toString().slice(-1)}`;
    }
    
    return fallback;
  } catch (error) {
    console.error('Error getting user initials:', error);
    return fallback;
  }
};

// Helper function to safely format user display name
export const getUserDisplayName = (user, fallback = 'User') => {
  try {
    if (!user) return fallback;
    
    if (user.display_name && typeof user.display_name === 'string') {
      return user.display_name;
    }
    
    if (user.username && typeof user.username === 'string') {
      return user.username;
    }
    
    if (user.fid) {
      return `User ${user.fid}`;
    }
    
    return fallback;
  } catch (error) {
    console.error('Error getting user display name:', error);
    return fallback;
  }
};
