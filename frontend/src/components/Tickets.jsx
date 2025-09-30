import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/api';
import TopNavigation from './TopNavigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
  UserIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Tickets = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    user_id: null,
    asset_id: null
  });

  // Mock data pour commencer
  const mockTickets = [
    {
      id: 1,
      title: "Problème d'impression",
      description: "L'imprimante du bureau 205 ne fonctionne plus",
      status: "open",
      priority: "high",
      created_at: "2024-01-15",
      user_id: 1,
      asset_id: 1,
      user: { username: "john.doe", fullname: "John Doe" },
      asset: { hostname: "PRINTER-205", model: "HP LaserJet Pro" }
    },
    {
      id: 2,
      title: "Installation logiciel",
      description: "Demande d'installation d'Adobe Creative Suite",
      status: "in_progress",
      priority: "medium",
      created_at: "2024-01-14",
      user_id: 2,
      asset_id: 2,
      user: { username: "jane.smith", fullname: "Jane Smith" },
      asset: { hostname: "PC-102", model: "Dell OptiPlex" }
    },
    {
      id: 3,
      title: "Problème réseau",
      description: "Connexion internet lente dans le département IT",
      status: "closed",
      priority: "low",
      created_at: "2024-01-13",
      user_id: 3,
      asset_id: null,
      user: { username: "mike.wilson", fullname: "Mike Wilson" },
      asset: null
    }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTickets();
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      // En cas d'erreur, utiliser les données mock pour la démo
      setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and Description are required.');
      return;
    }

    try {
      const ticketData = {
        ...formData,
        user_id: user?.id || 1, // Utiliser l'ID de l'utilisateur connecté
        created_at: new Date().toISOString().split('T')[0]
      };
      
      const newTicket = await ticketService.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      setSuccess('Ticket created successfully!');
      setShowModal(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setError('Failed to create ticket. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await ticketService.deleteTicket(id);
        setTickets(prev => prev.filter(ticket => ticket.id !== id));
        setSuccess('Ticket deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Failed to delete ticket:', error);
        setError('Failed to delete ticket. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      user_id: ticket.user_id,
      asset_id: ticket.asset_id
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and Description are required.');
      return;
    }

    try {
      const updatedTicket = await ticketService.updateTicket(editingTicket.id, formData);
      setTickets(prev => prev.map(ticket => 
        ticket.id === editingTicket.id ? updatedTicket : ticket
      ));
      setSuccess('Ticket updated successfully!');
      setShowEditModal(false);
      setEditingTicket(null);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      setError('Failed to update ticket. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      user_id: null,
      asset_id: null
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' };
      case 'medium': return { backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fde68a' };
      case 'low': return { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' };
      default: return { backgroundColor: '#f9fafb', color: '#374151', borderColor: '#d1d5db' };
    }
  };

  // Row design remains neutral; only badges reflect priority colors

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium': return <ClockIcon className="h-4 w-4" />;
      case 'low': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getAuthorName = (ticket) => {
    return (
      ticket?.user?.fullname ||
      ticket?.user?.username ||
      ticket?.username ||
      ticket?.author ||
      (ticket?.user_id ? `User #${ticket.user_id}` : 'Unknown')
    );
  };

  const formatCreatedAt = (dateValue) => {
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm ||
                          ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-light/20">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-light/20">
      <TopNavigation user={user} onLogout={logout} />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                <TicketIcon className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-800">
                  Ticket Management
                </h1>
                <p className="text-sm text-amber-600">
                  {user?.role === 'admin' 
                    ? 'Manage all IT support requests and incidents' 
                    : 'View and manage your support requests'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium shadow-md"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                  <MagnifyingGlassIcon className="h-5 w-5 text-amber-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search tickets by title, description, or user..."
                  className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <TicketIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'No tickets found' : 'No tickets yet'}
              </h3>
              <p className="text-amber-600 text-sm">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by creating your first support ticket'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Your First Ticket</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="group p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-amber-800 truncate">
                          {ticket.title}
                        </h3>
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                          style={getPriorityStyle((ticket.priority || '').toLowerCase())}
                        >
                          {getPriorityIcon((ticket.priority || '').toLowerCase())}
                          <span className="ml-1 capitalize">{(ticket.priority || '').toLowerCase()}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-amber-700 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-amber-600">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-3 w-3 text-amber-600" />
                          <span>{getAuthorName(ticket)}</span>
                        </div>
                        {ticket.asset && (
                          <div className="flex items-center space-x-1">
                            <ComputerDesktopIcon className="h-3 w-3 text-amber-600" />
                            <span>{ticket.asset.hostname}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3 text-amber-600" />
                          <span>{formatCreatedAt(ticket.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleView(ticket)}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                        title="View Ticket"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                        title="Edit Ticket"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="p-2 text-amber-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Ticket"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 mx-auto p-5 w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Create New Ticket
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors duration-200"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                    placeholder="Detailed description of the problem or request"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 mx-auto p-5 w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Ticket Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors duration-200"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">
                    {selectedTicket.title}
                  </h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                      style={getPriorityStyle((selectedTicket.priority || '').toLowerCase())}
                    >
                      {getPriorityIcon((selectedTicket.priority || '').toLowerCase())}
                      <span className="ml-1 capitalize">{(selectedTicket.priority || '').toLowerCase()}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTicket.status)}`}>
                      <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-amber-700 mb-1">Description</h5>
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-amber-700 mb-1">Requested by</h5>
                    <div className="flex items-center space-x-1 text-sm text-amber-600">
                      <UserIcon className="h-4 w-4 text-amber-600" />
                      <span>{getAuthorName(selectedTicket)}</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-amber-700 mb-1">Created</h5>
                    <p className="text-sm text-amber-600">{formatCreatedAt(selectedTicket.created_at)}</p>
                  </div>
                  {selectedTicket.asset && (
                    <div>
                      <h5 className="text-sm font-medium text-amber-700 mb-1">Related Asset</h5>
                      <p className="text-sm text-amber-600">{selectedTicket.asset.hostname}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && editingTicket && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 mx-auto p-5 w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Edit Ticket
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTicket(null);
                    resetForm();
                  }}
                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors duration-200"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                    placeholder="Detailed description of the problem or request"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTicket(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Update Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;