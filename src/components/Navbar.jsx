import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, LayoutDashboard, Mail, Shield, BookOpen, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showAccountCard, setShowAccountCard] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center pr-4 border-r border-gray-100 mr-4">
              <span className="text-2xl font-bold tracking-tighter text-gray-900">tailwebs<span className="text-primary">.</span></span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <a href="/" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-gray-900 uppercase tracking-widest hover:text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                DASHBOARD
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-6 relative">
            <button className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
              <Bell className="w-5 h-5" />
            </button>

            {/* Account Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowAccountCard(!showAccountCard)}
                className={`flex items-center space-x-3 pl-4 border-l border-gray-100 group transition-all duration-300 ${showAccountCard ? 'scale-105' : ''}`}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-gray-900 leading-none mb-1 group-hover:text-primary transition-colors">{user?.name}</p>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full ring-1 ring-primary/10">{user?.role}</p>
                </div>
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all border shadow-sm ${showAccountCard ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-primary border-gray-100 group-hover:border-primary/30 group-hover:bg-primary/5'}`}>
                  <User className="h-6 w-6" />
                </div>
              </button>

              {/* Account Popover Card */}
              {showAccountCard && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowAccountCard(false)}
                  />
                  <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="h-8 w-8" />
                      </div>
                      <button 
                        onClick={() => setShowAccountCard(false)}
                        className="p-1.5 rounded-xl text-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-tight">{user?.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">{user?.role} ACCOUNT</span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-50">
                        <div className="flex items-center space-x-3 text-gray-500">
                          <div className="p-2 rounded-xl bg-gray-50"><Mail className="w-4 h-4" /></div>
                          <span className="text-xs font-medium truncate">{user?.email}</span>
                        </div>
                        {user?.subject && (
                          <div className="flex items-center space-x-3 text-gray-500">
                            <div className="p-2 rounded-xl bg-gray-50"><BookOpen className="w-4 h-4" /></div>
                            <span className="text-xs font-black uppercase tracking-wider">{user?.subject}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 text-gray-500">
                          <div className="p-2 rounded-xl bg-gray-50"><Shield className="w-4 h-4" /></div>
                          <span className="text-xs font-medium">Verified Account</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setShowAccountCard(false);
                          logout();
                        }}
                        className="w-full mt-6 flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all group"
                      >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
