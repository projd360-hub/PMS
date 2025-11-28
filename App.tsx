
import React, { useState, useEffect } from 'react';
import { HotelProvider } from './context/HotelContext';
import Sidebar from './components/Sidebar';
import TapeChart from './components/TapeChart';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import BookingList from './components/BookingList';
import Login from './components/Login';
import { authService, UserProfile } from './services/auth';

const AppContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tape-chart':
        return <TapeChart />;
      case 'bookings':
        return <BookingList />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} onLogout={onLogout} />
      <main className="flex-1 h-full p-0 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Auth State
    const unsubscribe = authService.onAuthStateChange((userProfile) => {
      setUser(userProfile);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    // Auth state listener handles the user update
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (authLoading) {
     return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 animate-pulse text-slate-400 font-bold">Initializing NovaStay...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HotelProvider>
      <AppContent onLogout={handleLogout} />
    </HotelProvider>
  );
};

export default App;
