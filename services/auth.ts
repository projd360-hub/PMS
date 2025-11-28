
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  User
} from "firebase/auth";
import { auth } from "../firebase";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'ADMIN' | 'STAFF' | 'MANAGER';
}

export const authService = {
  // Check if user is currently logged in (Synchronous check not possible with Firebase SDK directly, handled via callback)
  // This helper is for the initial load state in App.tsx mainly
  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || undefined,
          role: 'ADMIN' // Default role for now
        };
        callback(userProfile);
      } else {
        callback(null);
      }
    });
  },

  // Login
  login: async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  // Google Login
  loginWithGoogle: async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  // Sign Up
  signup: async (name: string, email: string, password: string): Promise<void> => {
     // Create user
     await createUserWithEmailAndPassword(auth, email, password);
     // Note: In a real app, you would updateProfile here to set the displayName
  },

  // Logout
  logout: async () => {
    await signOut(auth);
  }
};
