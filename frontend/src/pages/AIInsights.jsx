import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ShieldAlert,
    Calendar,
    Sparkles,
    Loader2,
    RefreshCcw,
    Zap,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIInsights = () => {
    const { user } = useAuth();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const { data } = await api.get('/insights/dashboard');
            if (data.success) {
                setInsights(data.insights);
                setLastUpdated(new Date(data.lastUpdated));
            }
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getIcon = (category) => {
        switch (category) {
            case 'risk': return <AlertTriangle className="w-6 h-6 text-red-500" />;
            case 'performance': return <TrendingUp className="w-6 h-6 text-green-500" />;
            case 'responsiveness': return <Clock className="w-6 h-6 text-blue-500" />;
            case 'patterns': return <Zap className="w-6 h-6 text-amber-500" />;
            case 'health': return <ShieldAlert className="w-6 h-6 text-purple-500" />;
            default: return <Brain className="w-6 h-6 text-slate-400" />;
        }
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
                    <Brain className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6">Analyzing Legal Data...</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">AI is detecting patterns and risks in your profile.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200">
                        <Sparkles className="w-8 h-8 text-white fill-white/20" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Legal Insights</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                            Advisory intelligence for your legal activity
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchInsights(true)}
                        disabled={refreshing}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />}
                        {refreshing ? 'Refreshing...' : 'Regenerate'}
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Analysis Scope</div>
                        <div className="text-slate-900 dark:text-white font-bold">Past 30 Days</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Confidence</div>
                        <div className="text-slate-900 dark:text-white font-bold">94% Accurate</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Role Context</div>
                        <div className="text-slate-900 dark:text-white font-bold capitalize">{user?.user_type || user?.role || 'User'}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                        <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Processing</div>
                        <div className="text-slate-900 dark:text-white font-bold">Real-time</div>
                    </div>
                </div>
            </div>

            {/* Main Insights Grid */}
            {insights.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-20 text-center">
                    <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 underline decoration-blue-200 decoration-4">Zero Insight Artifacts Found</h3>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">Our AI hasn't detected any significant patterns for your profile yet. Engage more with the platform to see insights.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Category Accent */}
                            <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-500`}>
                                {getIcon(insight.category)}
                            </div>

                            <div className="flex items-start gap-4 h-full">
                                <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                    {getIcon(insight.category)}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getSeverityStyles(insight.severity)}`}>
                                                {insight.severity}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {insight.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-3">
                                            {insight.content}
                                        </h3>
                                    </div>

                                    {insight.action && (
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                                            <div className="p-1.5 bg-indigo-50 rounded-lg">
                                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-indigo-600">
                                                Action: <span className="font-medium text-slate-600 dark:text-slate-400">{insight.action}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Disclaimer Footer */}
            <div className="mt-16 p-6 bg-slate-100/50 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    <span className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest block mb-1">Disclaimer</span>
                    These insights are generated by CaseXpert AI based on activity metrics and non-sensitive case data.
                    They are advisory in nature and do not constitute legal advice or formal professional evaluations.
                    Always consult with a qualified professional for decision-making.
                </p>
            </div>
        </div>
    );
};

export default AIInsights;
