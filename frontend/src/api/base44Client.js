import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68fbc4e71d72895df15f4ee7", 
  requiresAuth: true // Ensure authentication is required for all operations
});
