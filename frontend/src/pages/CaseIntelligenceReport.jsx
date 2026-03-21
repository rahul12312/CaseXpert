import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reportsService from '../services/reportsService';
import BackButton from '../components/BackButton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

const CaseIntelligenceReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await reportsService.getCaseIntelligenceReport(id);
                if (res.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch report", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Intelligence Report...</div>;

    // If no report exists, show "Generate" CTA
    if (!data || !data.report) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-10">
                <div className="mx-auto w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-4xl mb-6">
                    ✨
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Intelligence Report Found</h2>
                <p className="text-slate-500 max-w-lg mx-auto mb-8">
                    Generate a comprehensive AI-powered analysis for this case. Get risk assessments, outcome predictions, strategy recommendations, and document gap analysis.
                </p>
                <button
                    onClick={() => navigate(`/cases/${id}/generate-report`)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-1"
                >
                    Generate Advanced Report ⚡
                </button>
            </div>
        );
    }

    const { report, stats, generated_at } = data;
    const riskScore = report.risk_analysis?.risk_score || 0;

    // Risk Gauge Data
    const riskData = [
        { name: 'Risk', value: riskScore },
        { name: 'Safe', value: 100 - riskScore }
    ];
    const RISK_COLORS = ['#ef4444', '#e2e8f0']; // Red for risk

    // Win Prob Data (Mocking for visuals if strict number not present)
    // Assuming outcome_prediction.probability_score exists from new prompt
    const winProb = report.outcome_prediction?.probability_score || 50;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <BackButton />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">Case Intelligence Report</h1>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            AI Generated
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">Generated on {new Date(generated_at).toLocaleDateString()} at {new Date(generated_at).toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        🖨️ Print / PDF
                    </button>
                    <button
                        onClick={() => navigate(`/cases/${id}/generate-report`)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100"
                    >
                        🔄 Update Analysis
                    </button>
                </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Risk Score Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Risk Assessment</h3>
                    <div className="h-32 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="80%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 text-center">
                            <span className="text-3xl font-bold text-slate-900">{riskScore}%</span>
                            <p className="text-xs text-slate-400">Risk Score</p>
                        </div>
                    </div>
                    <p className="text-center text-sm font-medium text-slate-600 mt-2">
                        Level: <span className={`text-${report.risk_analysis?.risk_level === 'High' ? 'red' : 'green'}-600`}>{report.risk_analysis?.risk_level}</span>
                    </p>
                </div>

                {/* Prediction Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50/50">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Outcome Prediction</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-indigo-600">{report.outcome_prediction?.win_probability || 'Medium'}</span>
                            <span className="text-sm text-slate-400">Probability</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-3">
                            {report.outcome_prediction?.disclaimer}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-center text-xs text-indigo-800 font-medium">
                        <span>Confidence: {report.outcome_prediction?.confidence_level || 'Medium'}</span>
                    </div>
                </div>

                {/* Timeline & Stats Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Case Velocity</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">Est. Duration</span>
                            <span className="font-bold text-slate-900">
                                {report.estimated_timeframe?.min_months} - {report.estimated_timeframe?.max_months} Months
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-slate-800">{stats?.total_hearings || 0}</span>
                                <span className="text-xs text-slate-500">Hearings</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-slate-800">{stats?.total_documents || 0}</span>
                                <span className="text-xs text-slate-500">Documents</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Analysis Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Summary, Issues, SWOT */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Overview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            📄 Executive Summary
                        </h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {report.case_overview_summary || report.summary}
                        </p>

                        {report.key_legal_issues && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Key Legal Issues Identified</h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.key_legal_issues.map((issue, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-200">
                                            {issue}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SWOT Analysis Grid */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">SWOT Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                    <span>💪</span> Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {report.swot_analysis?.strengths?.map((item, i) => (
                                        <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                    <span>⚠️</span> Weaknesses
                                </h4>
                                <ul className="space-y-2">
                                    {report.swot_analysis?.weaknesses?.map((item, i) => (
                                        <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Opportunities */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <span>🚀</span> Opportunities
                                </h4>
                                <ul className="space-y-2">
                                    {report.swot_analysis?.opportunities?.map((item, i) => (
                                        <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Threats */}
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                    <span>🛡️</span> Threats
                                </h4>
                                <ul className="space-y-2">
                                    {report.swot_analysis?.threats?.map((item, i) => (
                                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Strategy, Documents, Hearing */}
                <div className="space-y-8">

                    {/* Strategy Recommendations */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">♟️</div>
                        <h3 className="text-lg font-bold mb-4 relative z-10">Strategic Recommendations</h3>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider mb-2">Immediate Actions</h4>
                                <ul className="space-y-2">
                                    {report.strategy_recommendations?.immediate_actions?.map((action, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                                            <span>👉</span> {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider mb-2">Long Term Strategy</h4>
                                <ul className="space-y-2">
                                    {report.strategy_recommendations?.long_term_strategy?.map((action, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                                            <span>🔭</span> {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Document Analysis */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">Document Health</h3>
                            <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {report.document_analysis?.completeness_score || 0}%
                            </span>
                        </div>

                        {report.document_analysis?.missing_critical_documents?.length > 0 ? (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <h4 className="text-sm font-semibold text-orange-800 mb-2">Missing Critical Docs:</h4>
                                <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                                    {report.document_analysis.missing_critical_documents.map((doc, i) => (
                                        <li key={i}>{doc}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">All critical documents appear to be present.</div>
                        )}
                        <p className="text-xs text-slate-400 mt-3 italic">"{report.document_analysis?.document_strength_notes}"</p>
                    </div>

                    {/* Hearing Insights */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4">Hearing Trends</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-slate-500 uppercase">Adjournment Risk</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`h-3 w-full rounded-full bg-slate-100 overflow-hidden`}>
                                        <div className={`h-full ${report.hearing_insights?.adjournment_risk === 'High' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: report.hearing_insights?.adjournment_risk === 'High' ? '80%' : '20%' }}></div>
                                    </div>
                                    <span className="text-sm font-medium">{report.hearing_insights?.adjournment_risk}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 uppercase">Next Likely Step</span>
                                <p className="text-sm font-medium text-slate-800">{report.hearing_insights?.next_likely_step}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CaseIntelligenceReport;
