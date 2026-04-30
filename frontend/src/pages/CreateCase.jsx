import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import Toast from '../components/Toast';

const CreateCase = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const assignedLawyerId = queryParams.get('lawyer_id');
    const assignedLawyerName = queryParams.get('lawyer_name');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        case_number: '',
        case_type: 'civil',
        priority: 'medium',
        description: '',
        court_name: '',
        filing_date: '',
        opponent_name: '',
        opponent_lawyer: ''
    });
    const [files, setFiles] = useState([]);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

    // Ensure error states are clear on mount
    React.useEffect(() => {
        setGeneralError('');
        setErrors({});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Clear general error
        if (generalError) setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            // Prepare data - only fields that exist in database
            const submitData = {
                title: formData.title.trim(),
                case_number: formData.case_number.trim(),
                case_type: formData.case_type,
                priority: formData.priority,
                description: formData.description.trim() || undefined,
                court_name: formData.court_name.trim() || undefined,
                filing_date: formData.filing_date || undefined,
                opponent_name: formData.opponent_name.trim() || undefined,
                opponent_lawyer: formData.opponent_lawyer.trim() || undefined,
                lawyer_id: assignedLawyerId ? parseInt(assignedLawyerId, 10) : undefined
            };

            console.log('Submitting case data to /api/cases:', submitData);

            // Updated to /cases as per system requirements
            const response = await api.post('/cases', submitData);

            if (response.data.success) {
                const caseId = response.data.data.case_id;

                if (files.length > 0) {
                    for (const file of files) {
                        const fileData = new FormData();
                        fileData.append('case_id', caseId);
                        fileData.append('file', file);
                        try {
                            await api.post('/cases/upload-document', fileData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                        } catch (err) {
                            console.error('Failed to upload file:', file.name, err);
                        }
                    }
                }

                // Show toast notification
                setToastMessage(`Case #${response.data.data.case_number} created successfully!`);
                setShowToast(true);

                // Navigate to case tracker after showing toast
                setTimeout(() => {
                    navigate('/cases');
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to create case:', error);

            // Handle error response from backend
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                // Set field-specific errors if available
                if (errorData.fieldErrors) {
                    setErrors(errorData.fieldErrors);
                }

                // Set general error message
                setGeneralError(errorData.message || 'Failed to create case. Please try again.');
            } else if (error.request) {
                // Network error
                setGeneralError('Unable to connect to server. Please check your connection.');
            } else {
                // Other errors
                setGeneralError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            {/* Toast Notification */}
            {showToast && (
                <Toast
                    type="success"
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                    duration={3000}
                />
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">Create New Case</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">Enter the details of the new legal case.</p>
            </div>

            {assignedLawyerId && (
                <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/20 flex items-start gap-3">
                    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Lawyer Assignment</h3>
                        <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
                            This case will be automatically assigned to <strong>{assignedLawyerName || 'Selected Lawyer'}</strong> upon creation.
                        </p>
                    </div>
                </div>
            )}

            {/* General Error Message */}
            {generalError && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-900/50">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{generalError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                            Case Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                            placeholder="e.g. Smith vs. Jones Property Dispute"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                            Case Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="case_number"
                            value={formData.case_number}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.case_number ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                            placeholder="e.g. CN-2024-001"
                        />
                        {errors.case_number && (
                            <p className="text-sm text-red-600">{errors.case_number}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                            Case Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="case_type"
                            value={formData.case_type}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.case_type ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        >
                            <option value="civil">Civil</option>
                            <option value="criminal">Criminal</option>
                            <option value="corporate">Corporate</option>
                            <option value="family">Family</option>
                            <option value="property">Property</option>
                            <option value="labor">Labor</option>
                            <option value="consumer">Consumer</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.case_type && (
                            <p className="text-sm text-red-600">{errors.case_type}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Priority</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.priority ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                        {errors.priority && (
                            <p className="text-sm text-red-600">{errors.priority}</p>
                        )}
                    </div>


                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Description / Brief Facts</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Enter a brief description of the case..."
                    />
                </div>

                {/* More Options Toggle */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        <svg
                            className={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {showMoreOptions ? 'Fewer Information' : 'More Information (Optional)'}
                    </button>
                </div>

                {/* Optional Fields */}
                {showMoreOptions && (
                    <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Court Name</label>
                            <input
                                name="court_name"
                                value={formData.court_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. Supreme Court of India"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Filing Date</label>
                            <input
                                type="date"
                                name="filing_date"
                                value={formData.filing_date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Opponent Name</label>
                            <input
                                name="opponent_name"
                                value={formData.opponent_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. ABC Corporation"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Opponent Lawyer</label>
                            <input
                                name="opponent_lawyer"
                                value={formData.opponent_lawyer}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. Adv. Rajesh Kumar"
                            />
                        </div>
                    </div>
                )}

                {/* File Upload Section */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800">
                    <label className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                        Attachments (Optional)
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You can upload PDF, Word documents, text files, or photos.</p>
                    {files.length > 0 && (
                        <ul className="mt-3 space-y-2">
                            {files.map((file, index) => (
                                <li key={index} className="text-sm text-slate-700 dark:text-slate-300 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 dark:border-slate-700">
                                    <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-xs text-slate-400 ml-auto flex-shrink-0">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/cases')}
                        disabled={loading}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Create Case'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCase;
