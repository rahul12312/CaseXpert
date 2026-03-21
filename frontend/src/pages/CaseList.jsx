import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertCircle, Plus } from 'lucide-react';
import caseService from '../services/caseService';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await caseService.getCaseList();
      setCases(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'hearing-scheduled': 'bg-purple-100 text-purple-800',
      'evidence-pending': 'bg-orange-100 text-orange-800',
      'closed': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all your legal cases
          </p>
        </div>
        <Link
          to="/cases/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Case
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cases</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new case.</p>
          <div className="mt-6">
            <Link
              to="/cases/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Case
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/cases/${caseItem.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Case Number & Priority */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-gray-500">
                    {caseItem.case_number}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(caseItem.priority)}`}>
                    {caseItem.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {caseItem.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {caseItem.description || 'No description'}
                </p>

                {/* Status & Type */}
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {caseItem.case_type}
                  </span>
                </div>

                {/* Lawyer */}
                {caseItem.lawyer_name && (
                  <p className="text-xs text-gray-500 mb-2">
                    Lawyer: {caseItem.lawyer_name}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{caseItem.document_count || 0} docs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{caseItem.update_count || 0} updates</span>
                  </div>
                </div>

                {/* Last Activity */}
                <p className="text-xs text-gray-400 mt-2">
                  Updated {new Date(caseItem.updated_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseList;
