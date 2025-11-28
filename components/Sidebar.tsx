import React from 'react';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Hotel } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tape-chart', icon: Calendar, label: 'Tape Chart' },
    { id: 'bookings', icon: Users, label: 'Bookings' },
    { id: 'admin', icon: Settings, label: 'Admin Panel' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-brand-500 p-2 rounded-lg shadow-lg shadow-brand-500/30">
           <Hotel size={24} />
        </div>
        <div>
           <h1 className="text-lg font-bold leading-none tracking-tight">NovaStay</h1>
           <span className="text-xs text-slate-400 font-medium">PMS System v1.0</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentTab === item.id 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-2 hover:bg-slate-800 rounded-lg"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;