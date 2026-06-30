import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import caseService from '../services/caseService';

const NewCase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const assignedLawyerId = queryParams.get('lawyer_id');
  const assignedLawyerName = queryParams.get('lawyer_name');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    case_number: '',
    case_type: 'civil',
    priority: 'medium',
    lawyer_id: assignedLawyerId || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await caseService.createCase(formData);
      navigate(`/cases/${response.data.case_id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cases
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Case</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Fill in the details to create a new legal case
        </p>
      </div>

      {/* Assignment Banner */}
      {assignedLawyerId && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Assigning to Lawyer</h3>
            <p className="text-sm text-green-700">
              This case will be automatically assigned to <strong>{assignedLawyerName || 'Selected Lawyer'}</strong> upon creation.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-6">
        {/* Case Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Case Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Property Dispute - Mumbai"
          />
        </div>

        {/* Case Number */}
        <div>
          <label htmlFor="case_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Case Number *
          </label>
          <input
            type="text"
            id="case_number"
            name="case_number"
            required
            value={formData.case_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., CASE-2025-001"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Unique identifier for this case
          </p>
        </div>

        {/* Case Type and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="case_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Case Type *
            </label>
            <select
              id="case_type"
              name="case_type"
              required
              value={formData.case_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="civil">Civil</option>
              <option value="criminal">Criminal</option>
              <option value="property">Property</option>
              <option value="family">Family</option>
              <option value="corporate">Corporate</option>
              <option value="labor">Labor</option>
              <option value="tax">Tax</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority *
            </label>
            <select
              id="priority"
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide detailed information about the case..."
          />
        </div>



        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Create Case
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCase;
