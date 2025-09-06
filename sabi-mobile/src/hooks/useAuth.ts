import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple simulation - accept any email/password combo for now
    if (email && password) {
      const user: User = {
        id: '1',
        email: email,
        name: email.split('@')[0], // Use part before @ as name
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } else {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  },
}));

export default useAuth;