// Temporary auth client placeholder - will be replaced with Supabase auth later

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'contributor' | 'viewer';
  avatar?: string;
  bio?: string;
}

export interface Session {
  user: User;
  token?: string;
}

// Mock user for development
const mockUser: User = {
  id: 'mock_user_1',
  name: 'Dev User',
  email: 'dev@example.com',
  role: 'admin',
  avatar: undefined
};

// Auth client placeholder functions
export const authClient = {
  signIn: async (email: string, password: string): Promise<{ data: Session | null; error: string | null }> => {
    // Mock sign in - always succeeds for now
    return {
      data: { user: mockUser },
      error: null
    };
  },

  signUp: async (email: string, password: string, name: string): Promise<{ data: Session | null; error: string | null }> => {
    // Mock sign up - always succeeds for now
    return {
      data: { user: { ...mockUser, email, name } },
      error: null
    };
  },

  signOut: async (): Promise<{ error: string | null }> => {
    // Mock sign out
    return { error: null };
  },

  getSession: async (): Promise<Session | null> => {
    // Always return mock session for now
    return { user: mockUser };
  },

  useSession: () => {
    // Mock hook - always returns logged in user
    return {
      data: { user: mockUser },
      loading: false,
      error: null,
      isPending: false
    };
  }
};

// Export individual functions for convenience
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const getSession = authClient.getSession;
export const useSession = authClient.useSession;

export default authClient;