import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
    import { assetService, userService, ticketService } from '../services/api';
import TopNavigation from './TopNavigation';
import { 
  ComputerDesktopIcon, 
  UserGroupIcon, 
  TicketIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    assets: 0,
    users: 0,
    tickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

      const fetchStats = async () => {
    try {
          const [assets, users, tickets] = await Promise.all([
            assetService.getAssets(),
            userService.getUsers(),
            ticketService.getTickets()
          ]);
      
      setStats({
        assets: assets.length,
        users: users.length,
            tickets: Array.isArray(tickets) ? tickets.filter(t => (t.status || '').toLowerCase() === 'open').length : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-light/20">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-light/20">
      <TopNavigation user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-brown/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brown-dark to-brown bg-clip-text text-transparent">
                Welcome back, {user?.full_name || user?.username || 'User'}!
              </h1>
              <p className="text-base text-gray-600 mt-1">
                Here's what's happening with your IT assets today
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Assets Card */}
          <div className="group relative bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <ComputerDesktopIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpIcon className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">+12%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.assets}</p>
                <p className="text-sm font-medium text-gray-700">Total Assets</p>
                <p className="text-xs text-gray-500">Active IT equipment</p>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="group relative bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <UserGroupIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpIcon className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">+8%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.users}</p>
                <p className="text-sm font-medium text-gray-700">Active Users</p>
                <p className="text-xs text-gray-500">System users</p>
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <div className="group relative bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <TicketIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDownIcon className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-semibold text-red-600">-3%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.tickets}</p>
                <p className="text-sm font-medium text-gray-700">Open Tickets</p>
                <p className="text-xs text-gray-500">Pending requests</p>
              </div>
            </div>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest system events and updates</p>
            </div>
            <ClockIcon className="h-6 w-6 text-gold" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <ChartBarIcon className="h-5 w-5 text-brown-dark" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">System initialized successfully</p>
                <p className="text-sm text-gray-600">All services are running normally</p>
                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString('en-US')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <UserGroupIcon className="h-5 w-5 text-brown-dark" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">User {user?.username} connected</p>
                <p className="text-sm text-gray-600">Successful login to ITAM system</p>
                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString('en-US')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gold/10 to-gold-light/20 rounded-lg border border-gold/20">
              <div className="h-10 w-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center shadow-md">
                <ComputerDesktopIcon className="h-5 w-5 text-brown-dark" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Asset management ready</p>
                <p className="text-sm text-gray-600">All asset tracking systems operational</p>
                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString('en-US')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;