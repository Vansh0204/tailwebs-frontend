import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center pr-4 border-r border-gray-100 mr-4">
              <span className="text-2xl font-bold text-primary">tailwebs.</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <a href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-primary text-sm font-bold text-gray-900 uppercase tracking-wider">
                <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                Dashboard
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="h-6 w-6" />
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                title="Sign Out"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
