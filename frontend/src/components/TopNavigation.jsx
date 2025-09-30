import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ComputerDesktopIcon, 
  UserGroupIcon, 
  TicketIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const TopNavigation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Assets', icon: ComputerDesktopIcon, path: '/assets' },
    { name: 'Users', icon: UserGroupIcon, path: '/users' },
    { name: 'Tickets', icon: TicketIcon, path: '/tickets' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="ITAM System Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                      className={`group flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-gold to-gold-dark text-brown-dark shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-brown hover:shadow-md hover:scale-105'
                      }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive(item.path) ? 'text-brown-dark' : 'text-gray-500 group-hover:text-brown'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center">
              <div className="px-4 py-2 bg-white border-2 border-amber-600 rounded-full shadow-lg">
                <span className="text-sm font-bold text-amber-700">
                  {user?.username || 'User'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="group flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-600 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`group flex items-center justify-center w-14 h-14 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-gold to-gold-dark text-brown-dark shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brown hover:shadow-md hover:scale-105'
                    }`}
                    title={item.name}
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                );
              })}
            </div>
            
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center shadow-md border-2 border-amber-600">
                <span className="text-sm font-bold text-brown-dark">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
                  <button
                    onClick={onLogout}
                    className="group p-3 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer"
                  >
                <ArrowRightOnRectangleIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;