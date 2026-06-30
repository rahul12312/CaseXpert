import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Info, Send, Bot, FileWarning, ArrowRight, Loader } from 'lucide-react';
import api from '../lib/api';

const DocumentAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [rawText, setRawText] = useState('');
    
    // Chat state
    const [chatHistory, setChatHistory] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;
        
        const validTypes = ['application/pdf', 'text/plain'];
        if (!validTypes.includes(selectedFile.type)) {
            alert('Please upload a PDF or TXT file.');
            return;
        }
        
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size exceeds 10MB limit.');
            return;
        }

        setFile(selectedFile);
        setAnalysisResult(null); // Reset previous analysis
        setChatHistory([]); // Reset chat
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await api.post('/ai-document/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 90000 // 90 seconds timeout for document analysis
            });

            if (response.data.success) {
                setAnalysisResult(response.data.data);
                setRawText(response.data.rawText);
                setChatHistory([{
                    role: 'assistant',
                    content: `I've analyzed the document "${file.name}". You can ask me any specific questions about its contents!`
                }]);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert(error.response?.data?.message || 'Failed to analyze document. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim() || !rawText || isChatting) return;

        const userMsg = currentMessage.trim();
        setCurrentMessage('');
        
        const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
        setChatHistory(newHistory);
        setIsChatting(true);

        try {
            const response = await api.post('/ai-document/chat', {
                documentText: rawText,
                question: userMsg,
                history: chatHistory
            }, {
                timeout: 60000 // 60 seconds timeout for document chat
            });

            if (response.data.success) {
                setChatHistory([...newHistory, { role: 'assistant', content: response.data.answer }]);
            }
        } catch (error) {
            console.error('Chat failed:', error);
            setChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsChatting(false);
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            
            {/* Left Panel - Upload & Analysis */}
            <div className="flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-1/2 lg:w-3/5 overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        AI Document Analyzer
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Upload any legal contract or document to get an instant plain-English summary and risk detection.
                    </p>

                    {/* Upload Zone */}
                    {!analysisResult && !isAnalyzing && (
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
                                isDragging 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                className="hidden" 
                                accept=".pdf,.txt"
                            />
                            <UploadCloud className={`h-12 w-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                                {file ? file.name : 'Click or Drag & Drop Document'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-2 text-center">
                                Supports PDF and TXT (Max 10MB)
                            </p>
                            
                            {file && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                    className="mt-6 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    Analyze Document <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Analyzing Document...</h3>
                            <p className="text-slate-500 mt-2">Extracting text, finding risks, and generating summary.</p>
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysisResult && (
                        <div className="space-y-6 animate-fade-in-up">
                            {/* File Status */}
                            <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{file?.name}</p>
                                        <p className="text-xs text-slate-500">{analysisResult.document_type || 'Legal Document'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setAnalysisResult(null); setFile(null); }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Analyze another
                                </button>
                            </div>

                            {/* Summary */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                                    <Info className="h-5 w-5 text-blue-500" />
                                    Plain English Summary
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {analysisResult.summary}
                                </p>
                            </div>

                            {/* Risky Clauses */}
                            {analysisResult.risky_clauses && analysisResult.risky_clauses.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                                        <FileWarning className="h-5 w-5 text-red-500" />
                                        Detected Risks & Flags
                                    </h3>
                                    <div className="space-y-3">
                                        {analysisResult.risky_clauses.map((risk, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`rounded-lg border p-4 ${
                                                    risk.risk_level === 'High' 
                                                        ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' 
                                                        : risk.risk_level === 'Medium'
                                                            ? 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10'
                                                            : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                                                        risk.risk_level === 'High' ? 'text-red-500' : 
                                                        risk.risk_level === 'Medium' ? 'text-orange-500' : 'text-yellow-500'
                                                    }`} />
                                                    <div>
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                                                            risk.risk_level === 'High' ? 'bg-red-100 text-red-700' : 
                                                            risk.risk_level === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {risk.risk_level} Risk
                                                        </span>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">"{risk.clause}"</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Reason: <span className="font-normal">{risk.reason}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Obligations */}
                            {analysisResult.key_obligations && analysisResult.key_obligations.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Key Obligations</h3>
                                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Party</th>
                                                    <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Obligation</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                                {analysisResult.key_obligations.map((obs, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{obs.party}</td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{obs.obligation}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="hidden flex-1 flex-col bg-slate-50 dark:bg-slate-900/30 md:flex relative border-l border-slate-200 dark:border-slate-800">
                {!analysisResult ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                            <Bot className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Document Chat</h3>
                        <p className="text-sm max-w-sm">Upload and analyze a document first to start asking specific questions about it.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Bot className="h-5 w-5 text-blue-600" /> Ask AI about this document
                            </h3>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatHistory.map((msg, idx) => {
                                const isAi = msg.role === 'assistant';
                                return (
                                    <div key={idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`flex max-w-[85%] gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                isAi ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-slate-800 text-white dark:bg-slate-700'
                                            }`}>
                                                {isAi ? <Bot className="h-5 w-5" /> : <span className="text-xs font-bold">You</span>}
                                            </div>
                                            <div className={`rounded-2xl px-4 py-3 text-sm ${
                                                isAi 
                                                    ? 'rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200' 
                                                    : 'rounded-tr-sm bg-blue-600 text-white'
                                            }`}>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[85%] gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 px-4 py-4 border border-slate-200 dark:border-slate-700">
                                            <div className="flex gap-1">
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.4s' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="bg-white dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    placeholder="e.g. Can they terminate this contract early?"
                                    className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-5 pr-14 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                    disabled={isChatting}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!currentMessage.trim() || isChatting}
                                    className="absolute right-2 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DocumentAnalyzer;
