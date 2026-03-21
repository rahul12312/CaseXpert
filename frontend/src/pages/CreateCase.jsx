import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Toast from '../components/Toast';

const CreateCase = () => {
    const navigate = useNavigate();
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
                opponent_lawyer: formData.opponent_lawyer.trim() || undefined
            };

            console.log('Submitting case data to /api/cases:', submitData);

            // Updated to /cases as per system requirements
            const response = await api.post('/cases', submitData);

            if (response.data.success) {
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Case</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Enter the details of the new legal case.</p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                            Case Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                            placeholder="e.g. Smith vs. Jones Property Dispute"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                            Case Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="case_number"
                            value={formData.case_number}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.case_number ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                            placeholder="e.g. CN-2024-001"
                        />
                        {errors.case_number && (
                            <p className="text-sm text-red-600">{errors.case_number}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                            Case Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="case_type"
                            value={formData.case_type}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.case_type ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
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
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Priority</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.priority ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
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
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Description / Brief Facts</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                    <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Court Name</label>
                            <input
                                name="court_name"
                                value={formData.court_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. Supreme Court of India"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Filing Date</label>
                            <input
                                type="date"
                                name="filing_date"
                                value={formData.filing_date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Opponent Name</label>
                            <input
                                name="opponent_name"
                                value={formData.opponent_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. ABC Corporation"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Opponent Lawyer</label>
                            <input
                                name="opponent_lawyer"
                                value={formData.opponent_lawyer}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. Adv. Rajesh Kumar"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/cases')}
                        disabled={loading}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
