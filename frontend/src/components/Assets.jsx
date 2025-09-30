import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TopNavigation from './TopNavigation';
import { assetService } from '../services/api';
import {
  ComputerDesktopIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filters, setFilters] = useState({
    hostname: '',
    serial: '',
    model: '',
    location: '',
    purchased: '',
    status: 'all'
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [customLocations, setCustomLocations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    hostname: '',
    serial: '',
    model: '',
    location: '',
    status: 'active',
    purchased_at: '',
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getAssets();
      console.log('Assets response:', response);
      setAssets(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('Authentication required. Please log in to create assets.');
      return;
    }
    
    if (!formData.hostname.trim()) {
      setError('Hostname is required.');
      return;
    }
    
    try {
      if (isEditing) {
        await assetService.updateAsset(currentAsset.id, formData);
        setSuccess('Asset updated successfully!');
      } else {
        await assetService.createAsset(formData);
        setSuccess('Asset created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchAssets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Failed to save asset:", error);
      let errorMessage = 'Failed to save asset. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data provided. Please check your input.';
      } else if (error.response?.status === 500) {
        const errorText = error.response?.data?.detail || '';
        if (errorText.includes('Duplicate entry') && errorText.includes('serial')) {
          errorMessage = 'This serial number already exists. Please use a different serial number.';
        } else if (errorText.includes('Duplicate entry') && errorText.includes('hostname')) {
          errorMessage = 'This hostname already exists. Please use a different hostname.';
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
    }
  };

  const handleEdit = (asset) => {
    setFormData({
      hostname: asset.hostname || '',
      serial: asset.serial || '',
      model: asset.model || '',
      location: asset.location || '',
      status: asset.status || 'active',
      purchased_at: asset.purchased_at || '',
    });
    setCurrentAsset(asset);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.deleteAsset(id);
        fetchAssets();
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      hostname: '',
      serial: '',
      model: '',
      location: '',
      status: 'active',
      purchased_at: '',
    });
    setIsEditing(false);
    setCurrentAsset(null);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || (
      asset.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = 
      (!filters.hostname || asset.hostname?.toLowerCase().includes(filters.hostname.toLowerCase())) &&
      (!filters.serial || asset.serial?.toLowerCase().includes(filters.serial.toLowerCase())) &&
      (!filters.model || asset.model?.toLowerCase().includes(filters.model.toLowerCase())) &&
      (!filters.location || asset.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.purchased || asset.purchased_at?.includes(filters.purchased)) &&
      (filters.status === 'all' || asset.status === filters.status);
    
    return matchesSearch && matchesFilters;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Get unique values for filter options
  const getUniqueValues = (field) => {
    const values = assets.map(asset => asset[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      hostname: '',
      serial: '',
      model: '',
      location: '',
      purchased: '',
      status: 'all'
    });
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Get unique locations from assets and custom locations
  const getUniqueLocations = () => {
    const assetLocations = assets.map(asset => asset.location).filter(Boolean);
    const allLocations = [...assetLocations, ...customLocations];
    return [...new Set(allLocations)].sort();
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const trimmedLocation = newLocation.trim();
      
      // Add to custom locations if not already exists
      if (!customLocations.includes(trimmedLocation) && !assets.some(asset => asset.location === trimmedLocation)) {
        setCustomLocations(prev => [...prev, trimmedLocation]);
      }
      
      // Set the location in the form
      setFormData(prev => ({
        ...prev,
        location: trimmedLocation
      }));
      
      setNewLocation('');
      setShowLocationModal(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-md flex items-center justify-center">
                <ComputerDesktopIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-800">Asset Management</h1>
                <p className="text-sm text-amber-700">Manage and track your IT assets</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={!user}
              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                user 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 hover:from-amber-700 hover:to-amber-800 hover:text-amber-50' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add Asset
            </button>
          </div>
        </div>
      </div>


      {/* Assets List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white rounded-md shadow-sm border overflow-hidden">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <ComputerDesktopIcon className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-amber-800 mb-2">No assets found</h3>
              <p className="text-sm text-amber-700 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first asset'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && user && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 rounded-md hover:from-amber-700 hover:to-amber-800 hover:text-amber-50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1.5" />
                  Add Your First Asset
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        HOSTNAME
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        SERIAL
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        MODEL
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        LOCATION
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        PURCHASED
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        STATUS
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        ACTION
                      </th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2">
                        <select
                          value={filters.hostname}
                          onChange={(e) => handleFilterChange('hostname', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">All Hostnames</option>
                          {getUniqueValues('hostname').map(hostname => (
                            <option key={hostname} value={hostname}>{hostname}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <select
                          value={filters.serial}
                          onChange={(e) => handleFilterChange('serial', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">All Serials</option>
                          {getUniqueValues('serial').map(serial => (
                            <option key={serial} value={serial}>{serial}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <select
                          value={filters.model}
                          onChange={(e) => handleFilterChange('model', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">All Models</option>
                          {getUniqueValues('model').map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <select
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">All Locations</option>
                          {getUniqueValues('location').map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <select
                          value={filters.purchased}
                          onChange={(e) => handleFilterChange('purchased', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">All Dates</option>
                          {getUniqueValues('purchased_at').map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </th>
                      <th className="px-3 py-2">
                        <button
                          onClick={clearAllFilters}
                          className="w-full text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded px-2 py-1 transition-colors"
                        >
                          Clear All
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-md flex items-center justify-center shadow-sm mr-2">
                              <span className="text-xs font-bold text-white">
                                {asset.hostname?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {asset.hostname}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 font-mono truncate">
                          {asset.serial || 'N/A'}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 truncate">
                          {asset.model || 'N/A'}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 truncate">
                          {asset.location || 'N/A'}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          {asset.purchased_at || 'N/A'}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            asset.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {asset.status === 'active' ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(asset)}
                              className="text-amber-600 hover:text-amber-900 p-1 rounded transition-colors"
                              title="Edit asset"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete asset"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 py-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-amber-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          currentPage === 1
                            ? 'text-amber-300 cursor-not-allowed bg-amber-50'
                            : 'text-amber-600 hover:bg-amber-100 bg-white border border-amber-200'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-amber-600 text-amber-100'
                              : 'text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'text-amber-300 cursor-not-allowed bg-amber-50'
                            : 'text-amber-600 hover:bg-amber-100 bg-white border border-amber-200'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-amber-800">
                  {isEditing ? 'Edit Asset' : 'Add New Asset'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-amber-500 hover:text-amber-700"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Hostname *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      style={{ width: 'calc(100% + 18px)' }}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    >
                      <option value="">Select a location</option>
                      {getUniqueLocations().map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="px-3 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 flex-shrink-0"
                      title="Add new location"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={formData.purchased_at}
                    onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 rounded-lg hover:from-amber-700 hover:to-amber-800 hover:text-amber-50 transition-colors"
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">Add New Location</h3>
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setNewLocation('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Enter new location"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setNewLocation('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLocation}
                  disabled={!newLocation.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;