import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import reportsService from '../services/reportsService';

const GenerateCaseReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [documents, setDocuments] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        case_type: '',
        court_name: '',
        filing_date: '',
        current_stage: '',
        case_number: '',

        plaintiff_details: '',
        defendant_details: '',
        opponent_name: '',
        opponent_lawyer: '',

        summary: '',
        key_issues: ''
    });

    useEffect(() => {
        const fetchCaseData = async () => {
            try {
                const res = await api.get(`/case/details/${id}`);
                if (res.data.success) {
                    const c = res.data.data;
                    setFormData(prev => ({
                        ...prev,
                        title: c.title || '',
                        case_type: c.case_type || '',
                        court_name: c.court_name || '',
                        filing_date: c.filing_date ? c.filing_date.split('T')[0] : '',
                        case_number: c.case_number || '',
                        current_stage: c.status || '',
                        opponent_name: c.opponent_name || '',
                        opponent_lawyer: c.opponent_lawyer || '',
                        summary: c.description || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch case details", err);
            } finally {
                setInitializing(false);
            }
        };
        fetchCaseData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('data', JSON.stringify(formData));

            documents.forEach(doc => {
                submitData.append('documents', doc);
            });

            const res = await reportsService.generateCaseIntelligenceReport(id, submitData);
            if (res.success) {
                navigate(`/reports/intelligence/${id}`);
            }
        } catch (error) {
            console.error("Generation failed", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) return <div className="p-10 text-center">Loading case details...</div>;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Advanced Analysis</h2>
            <p className="text-slate-500 max-w-md">Our AI is analyzing 500+ data points, reviewing documents, and predicting outcomes based on precedents...</p>
            <div className="mt-8 space-y-2 text-sm text-slate-400">
                <p>✅ Extracting Case Facts</p>
                <p>✅ Identifying Legal Precedents</p>
                <p className="animate-pulse">🔄 Calculating Risk Probability...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Advanced Case Report Wizard</h1>
                <p className="text-slate-500">Generate a comprehensive AI-powered legal analysis.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10"></div>
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`flex flex-col items-center bg-slate-50 px-2`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                            {s}
                        </div>
                        <span className="text-xs font-medium text-slate-500 mt-1">
                            {s === 1 ? 'Details' : s === 2 ? 'Parties' : s === 3 ? 'Analysis' : 'Files'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Step 1: Case Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Case Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Case Number</label>
                                <input name="case_number" value={formData.case_number} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
                                <select name="case_type" value={formData.case_type} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border">
                                    <option value="">Select Type</option>
                                    <option value="criminal">Criminal</option>
                                    <option value="civil">Civil</option>
                                    <option value="family">Family</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="property">Property</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stage</label>
                                <select name="current_stage" value={formData.current_stage} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border">
                                    <option value="">Select Stage</option>
                                    <option value="Notice">Notice</option>
                                    <option value="Filing">Filing</option>
                                    <option value="Evidence">Evidence</option>
                                    <option value="Argument">Argument</option>
                                    <option value="Judgment">Judgment</option>
                                    <option value="Appeal">Appeal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Filing Date</label>
                                <input type="date" name="filing_date" value={formData.filing_date} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction / Court</label>
                                <input name="court_name" value={formData.court_name} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" placeholder="e.g. High Court of Delhi" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Step 2: Parties Involved</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Plaintiff / Complainant Details</label>
                                <textarea name="plaintiff_details" value={formData.plaintiff_details} onChange={handleChange} rows="3" className="w-full rounded-lg border-slate-300 px-3 py-2 border" placeholder="Name, details..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Opponent Name</label>
                                <input name="opponent_name" value={formData.opponent_name} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Opponent Lawyer</label>
                                <input name="opponent_lawyer" value={formData.opponent_lawyer} onChange={handleChange} className="w-full rounded-lg border-slate-300 px-3 py-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Defendant / Respondent Details</label>
                                <textarea name="defendant_details" value={formData.defendant_details} onChange={handleChange} rows="3" className="w-full rounded-lg border-slate-300 px-3 py-2 border" placeholder="Name, details..." />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Step 3: Case Summary & Issues</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Case Description</label>
                            <textarea name="summary" value={formData.summary} onChange={handleChange} rows="6" className="w-full rounded-lg border-slate-300 px-3 py-2 border" placeholder="Describe the facts of the case..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Key Issues Involved</label>
                            <textarea name="key_issues" value={formData.key_issues} onChange={handleChange} rows="3" className="w-full rounded-lg border-slate-300 px-3 py-2 border" placeholder="e.g. Breach of contract, Property dispute, Delayed payment..." />
                            <p className="text-xs text-slate-500 mt-1">Separate issues with commas.</p>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Step 4: Evidence & Documents</h2>
                        <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300 text-center">
                            <div className="mb-4 text-4xl">📂</div>
                            <h3 className="text-sm font-medium text-slate-900">Upload Case Files</h3>
                            <p className="text-xs text-slate-500 mb-4">PDF, DOCX, JPG (Max 10MB)</p>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>

                        {documents.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Files:</h4>
                                <ul className="space-y-2">
                                    {documents.map((doc, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-sm">
                                            <span className="truncate max-w-xs">{doc.name}</span>
                                            <span className="text-xs text-slate-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <span className="text-blue-600 text-xl">ℹ️</span>
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold">Privacy Notice</p>
                                <p>All documents are encrypted. The AI analyzes them for insights and does not store them permanently.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                    <button
                        disabled={step === 1}
                        onClick={() => setStep(s => s - 1)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5"
                        >
                            GENERATE REPORT ⚡
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateCaseReport;
