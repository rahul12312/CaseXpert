import React, { useState, useRef, useEffect } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Download,
    Eye,
    Edit2,
    Search,
    X,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    File,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import api from '../lib/api';
import { 
    getDocumentsByCaseId, 
    saveDocumentToLocalStorage, 
    deleteDocumentFromLocalStorage, 
    updateDocumentInLocalStorage,
    fileToBase64 
} from '../lib/documentStorage';




const CaseDocuments = ({ caseId, initialDocuments = [], onRefresh }) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);

    // Rename State
    const [isRenaming, setIsRenaming] = useState(null);
    const [newName, setNewName] = useState('');

    // AI State
    const [isSummarizing, setIsSummarizing] = useState(null);
    const [summary, setSummary] = useState(null);

    const fileInputRef = useRef(null);

    // Load documents from localStorage on mount and when caseId changes
    useEffect(() => {
        const storedDocs = getDocumentsByCaseId(caseId);
        // Map stored docs to match the component's expected structure if needed
        const mappedDocs = storedDocs.map(doc => ({
            id: doc.documentId,
            original_name: doc.fileName,
            file_name: doc.fileName,
            file_type: doc.fileType,
            file_size: doc.fileSize,
            uploaded_at: doc.uploadDate,
            file_url: doc.fileData, // Base64 data used as URL
            uploaded_by: 'You'
        }));
        
        setDocuments([...initialDocuments, ...mappedDocs]);
    }, [caseId, initialDocuments]);


    const filteredDocuments = documents.filter(doc =>
        doc.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type) => {
        const t = type.toLowerCase();
        if (t === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(t)) return <ImageIcon className="w-8 h-8 text-blue-500" />;
        if (['doc', 'docx'].includes(t)) return <FileText className="w-8 h-8 text-blue-600" />;
        return <File className="w-8 h-8 text-slate-400" />;
    };


    const handleUpload = async (e) => {
        const files = e.target.files || e.dataTransfer.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validation
        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'image/jpeg', 
            'image/png', 
            'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Please upload PDF, DOC, JPG, PNG or TXT.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit for localStorage reliability
            setError("File too large for local storage. Maximum size is 5MB.");
            return;
        }

        // Check duplicates
        if (documents.some(d => d.original_name === file.name)) {
            if (!confirm("A file with this name already exists. Do you want to upload it anyway?")) {
                return;
            }
        }

        setUploading(true);
        setError(null);
        setUploadProgress(20);

        try {
            // Convert to Base64 for persistence
            setUploadProgress(40);
            const base64Data = await fileToBase64(file);
            setUploadProgress(80);

            const documentId = `doc_${Date.now()}`;
            const fileExt = file.name.split('.').pop().toLowerCase();
            
            const docMetadata = {
                documentId,
                fileName: file.name,
                fileType: fileExt,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                relatedCaseId: caseId,
                fileData: base64Data
            };

            // Save to localStorage
            const saved = saveDocumentToLocalStorage(docMetadata);
            
            if (saved) {
                const newDocument = {
                    id: documentId,
                    file_name: file.name,
                    original_name: file.name,
                    file_url: base64Data,
                    file_type: fileExt,
                    file_size: file.size,
                    uploaded_by: 'You',
                    uploaded_at: docMetadata.uploadDate
                };

                setDocuments(prev => [...prev, newDocument]);
                setUploadProgress(100);
                
                setTimeout(() => {
                    setUploading(false);
                    setUploadProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }, 300);
            } else {
                setError("Failed to save document to local storage.");
                setUploading(false);
            }

        } catch (error) {
            console.error("Upload failed", error);
            setError("Upload failed. Please try again.");
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;

        try {
            // Remove from localStorage
            const deleted = deleteDocumentFromLocalStorage(docId);
            
            if (deleted) {
                // Remove from state
                setDocuments(prev => prev.filter(d => d.id !== docId));
            } else {
                alert("Failed to delete document from local storage");
            }
        } catch (error) {
            alert("Failed to delete document");
        }
    };

    const handleRename = async (docId) => {
        if (!newName.trim()) return;

        try {
            // Update in localStorage
            const updated = updateDocumentInLocalStorage(docId, { fileName: newName.trim() });
            
            if (updated) {
                // Update document name in state
                setDocuments(prev => prev.map(doc =>
                    doc.id === docId
                        ? { ...doc, original_name: newName.trim(), file_name: newName.trim() }
                        : doc
                ));
                setIsRenaming(null);
            } else {
                alert("Failed to update document name in local storage");
            }
        } catch (error) {
            alert("Failed to rename document");
        }
    };

    const handleSummarize = async (docId, fileName) => {
        setIsSummarizing(docId);
        setSummary(null);

        try {
            // Find the document in state
            const doc = documents.find(d => d.id === docId);
            if (!doc || !doc.fileObject) {
                setError("Cannot summarize - file not found");
                setIsSummarizing(null);
                return;
            }

            // Check file type - only text and PDF can be easily summarized
            const textTypes = ['txt', 'text'];
            const docTypes = ['doc', 'docx'];
            const pdfTypes = ['pdf'];

            if (!textTypes.includes(doc.file_type) && !docTypes.includes(doc.file_type) && !pdfTypes.includes(doc.file_type)) {
                setSummary(`⚠️ AI Summarization is currently only available for TXT, DOC, DOCX, and PDF files. Your file type (${doc.file_type.toUpperCase()}) cannot be automatically summarized yet.`);
                setActiveMenu(docId);
                setIsSummarizing(null);
                return;
            }

            // For PDF/DOC files, show a temporary message since we can't parse them client-side easily
            if (pdfTypes.includes(doc.file_type) || docTypes.includes(doc.file_type)) {
                setSummary(`📄 "${fileName}" - This is a ${doc.file_type.toUpperCase()} document (${formatSize(doc.file_size)}). Full AI summarization requires server-side processing. For now, you can download and review the document manually.`);
                setActiveMenu(docId);
                setIsSummarizing(null);
                return;
            }

            // For text files, read content and show summary
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const content = e.target.result;
                const preview = content.substring(0, 500); // First 500 characters
                setSummary(`📝 "${fileName}" - Text document with ${content.length} characters. Preview: "${preview}${content.length > 500 ? '...' : ''}"`);
                setActiveMenu(docId);
                setIsSummarizing(null);
            };
            fileReader.onerror = () => {
                setError("Failed to read file content");
                setIsSummarizing(null);
            };
            fileReader.readAsText(doc.fileObject);

        } catch (error) {
            console.error("Summarization error:", error);
            setError("AI Summarization failed.");
            setIsSummarizing(null);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Info Banner */}
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                    <p className="font-semibold text-green-900">Persistent Local Storage Active</p>
                    <p className="text-green-700 mt-1 leading-relaxed">
                        Your uploaded documents are now safely stored in your browser's local storage. They will persist even if you refresh the page.
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        <span className="hidden xs:inline">{uploading ? `Uploading ${uploadProgress}%` : "Upload Document"}</span>
                        <span className="xs:hidden">{uploading ? `${uploadProgress}%` : "Upload"}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 border border-red-100 rounded-lg text-xs sm:text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Document Grid/List */}
            <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredDocuments.length === 0 ? (
                    <div className="py-12 sm:py-20 px-4 text-center space-y-3 sm:space-y-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">No documents found</h4>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                {searchQuery ? "No documents match your search criteria." : "Upload case documents like FIRs, legal notices, and evidence here."}
                            </p>
                        </div>
                        {!searchQuery && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 text-primary-600 font-medium text-xs sm:text-sm hover:underline"
                            >
                                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Click to upload your first document
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="p-3 sm:p-4 hover:bg-slate-50/50 transition-colors group">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden space-y-3">
                                    {/* File Info */}
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {getFileIcon(doc.file_type || 'file')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isRenaming === doc.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleRename(doc.id)}
                                                        className="w-full px-2 py-1 border border-primary-500 rounded text-xs outline-none"
                                                    />
                                                    <button onClick={() => handleRename(doc.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                                    <button onClick={() => setIsRenaming(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="text-xs font-medium text-slate-900 truncate flex items-center gap-2">
                                                        {doc.original_name}
                                                        {doc.file_type === 'pdf' && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase bg-red-100 text-red-700 font-bold">PDF</span>
                                                        )}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                                        <span>{formatSize(doc.file_size)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile Actions - Grid Layout */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => window.open(doc.file_url, '_blank')}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                        <a
                                            href={doc.file_url}
                                            download={doc.original_name}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </a>
                                        <button
                                            onClick={() => {
                                                setIsRenaming(doc.id);
                                                setNewName(doc.original_name);
                                            }}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Rename
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>

                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(doc.file_type || 'file')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {isRenaming === doc.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleRename(doc.id)}
                                                    className="w-full max-w-sm px-2 py-1 border border-primary-500 rounded text-sm outline-none"
                                                />
                                                <button onClick={() => handleRename(doc.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                                <button onClick={() => setIsRenaming(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <h4 className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                                                {doc.original_name}
                                                {doc.file_type === 'pdf' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-red-100 text-red-700 font-bold">PDF</span>
                                                )}
                                            </h4>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span>{formatSize(doc.file_size)}</span>
                                            <span>•</span>
                                            <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} by {doc.uploaded_by}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => window.open(doc.file_url, '_blank')}
                                            title="View"
                                            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={doc.file_url}
                                            download={doc.original_name}
                                            title="Download"
                                            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => {
                                                setIsRenaming(doc.id);
                                                setNewName(doc.original_name);
                                            }}
                                            title="Rename"
                                            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            title="Delete"
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                    </div>
                                </div>

                                {summary && isSummarizing === null && activeMenu === doc.id && (
                                    <div className="mt-3 p-3 sm:p-4 bg-violet-50 border border-violet-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-[10px] sm:text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <span>✨</span> AI Document Insight
                                            </h5>
                                            <button onClick={() => setSummary(null)}><X className="w-3 h-3 text-violet-400 hover:text-violet-600" /></button>
                                        </div>
                                        <p className="text-xs sm:text-sm text-violet-900 leading-relaxed">
                                            {summary}
                                        </p>
                                    </div>
                                )}

                                {/* AI Summary View Logic (Simplified) */}
                                {summary && !isSummarizing && (
                                    <div className="mt-4 p-3 sm:p-4 bg-violet-50/50 border border-violet-100 rounded-lg sm:rounded-xl relative">
                                        <button onClick={() => setSummary(null)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-violet-300 hover:text-violet-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                                                <span className="text-lg sm:text-xl">✨</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] sm:text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">AI Summary Result</p>
                                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                                    {summary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseDocuments;
