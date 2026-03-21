import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, Loader2, Upload, Trash2, HardDrive, Lock, Copy, PenTool, LayoutTemplate } from 'lucide-react';
import api from '../lib/api.js';
import { API_BASE_URL } from '../config/api.js';
import { legalTemplates } from '../data/legalTemplates.js';

const DocumentDrafting = () => {
  const [documentType, setDocumentType] = useState('agreement');
  const [details, setDetails] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [samples, setSamples] = useState([]);
  // Removed governmentSamples state
  const [activeTab, setActiveTab] = useState('templates');
  // 'draft', 'templates', 'storage'

  // Secure Storage State
  const [storedDocs, setStoredDocs] = useState([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch available document types and storage on mount
  useEffect(() => {
    fetchDocumentTypes();
    fetchStoredDocuments();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      const { data: typeData } = await api.get('/documents/types');
      if (typeData.success) {
        setDocumentTypes(typeData.types);
      }
      const { data: sampleData } = await api.get('/documents/samples');
      if (sampleData.success) {
        setSamples(sampleData.samples);
      }
    } catch (err) {
      console.error('Failed to fetch document metadata:', err);
    }
  };

  const fetchStoredDocuments = async () => {
    try {
      setStorageLoading(true);
      const { data } = await api.get('/user-documents/list');
      if (data.success) {
        setStoredDocs(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch stored documents:', err);
    } finally {
      setStorageLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStorageLoading(true);
    try {
      // Try real upload first
      await api.post('/user-documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchStoredDocuments();
      // alert('Document uploaded securely to Vault.');
    } catch (err) {
      console.warn("Backend upload failed, utilizing temporary local storage for demo.", err);
      // Fallback: Show file temporarily on UI
      const tempDoc = {
        id: `temp-${Date.now()}`,
        title: file.name,
        document_type: 'uploaded',
        file_size: file.size,
        created_at: new Date().toISOString(),
        is_local: true,
        fileObj: file
      };
      setStoredDocs(prev => [tempDoc, ...prev]);
    } finally {
      setStorageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadStoredDocument = async (docId) => {
    // Check if local mock file
    const doc = storedDocs.find(d => d.id === docId);
    if (doc && doc.is_local && doc.fileObj) {
      const url = URL.createObjectURL(doc.fileObj);
      window.open(url, '_blank');
      return;
    }

    try {
      const { data } = await api.get(`/user-documents/${docId}/url`);
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      alert('Failed to access document.');
    }
  };

  const deleteStoredDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from your secure vault?')) return;

    // Check local mock file
    const doc = storedDocs.find(d => d.id === docId);
    if (doc && doc.is_local) {
      setStoredDocs(docs => docs.filter(d => d.id !== docId));
      return;
    }

    try {
      await api.delete(`/user-documents/${docId}`);
      setStoredDocs(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!details.trim()) {
      setError('Please provide details for the document');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/documents/draft', {
        documentType,
        userInputs: { details }
      });

      if (response.data.success) {
        setDraft(response.data.draft);
        setSuccess('Draft generated successfully!');

        // Auto-save draft to secure storage
        try {
          await api.post('/user-documents/save-draft', {
            title: `${documentType}_draft_${new Date().toISOString().split('T')[0]}`,
            content: response.data.draft
          });
          fetchStoredDocuments();
        } catch (saveErr) {
          console.warn('Auto-save failed', saveErr);
        }

      } else {
        setError(response.data.message || 'Failed to generate draft');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    if (draft && !window.confirm('This will overwrite current draft content. Continue?')) return;

    setDraft(template.content); // Load template
    setDetails(`I am filling out the ${template.title}. Here are the party details:\n\n[Provide Name, Address, etc here to let AI help you, or edit the draft manually on the right]`);
    setActiveTab('draft');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccess('Template loaded! You can now edit blanks manually or use AI to refine it.');
  };

  const downloadDraft = () => {
    if (!draft) return;
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draft_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!draft) return;
    try {
      setLoading(true);
      const response = await api.post('/documents/generate', {
        documentType,
        details,
        draft
      }, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewSample = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/samples/${documentType}`);
      if (response.data.success) {
        let finalUrl = response.data.sample?.fullUrl || response.data.sample?.url || response.data.url;
        if (finalUrl && !finalUrl.startsWith('http')) finalUrl = API_BASE_URL.replace(/\/api$/, '') + finalUrl;
        if (finalUrl) window.open(finalUrl, '_blank');
      }
    } catch (err) {
      // Fallback
    } finally { setLoading(false); }
  };

  const selectedDocType = documentTypes.find(t => t.id === documentType);

  // Group templates by category
  const categories = [...new Set(legalTemplates.map(t => t.category))];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-8 h-8 text-blue-600" />
          Document Drafting & Secure Storage
        </h1>
        <p className="text-sm text-slate-600">
          Professional legal drafting, standard templates, and secure Digilocker-style vault.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('draft')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'draft'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Draft Editor (AI)
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Legal Templates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'storage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Document Vault
            </div>
          </button>
        </div>
      </div>

      {/* AI Document Generator / Editor Tab */}
      {activeTab === 'draft' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Document Details</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="documentType">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.length > 0 ? (
                      documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))
                    ) : (
                      <option value="agreement">Agreement</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="details">
                    Key Facts / Instructions
                  </label>
                  <textarea
                    id="details"
                    rows={8}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe parties, dates, amounts, etc. Or ask AI to fill the template on the right."
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
                {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}

                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                  <strong>Tip:</strong> You can edit the draft on the right manually, or click Generate to let AI rewrite/complete it based on your facts.
                </div>

                <button
                  type="submit"
                  disabled={loading || !details.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  Generate / Refine with AI
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Editable Preview */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Editor / Preview</h2>
                {draft && (
                  <div className="flex gap-2">
                    <button onClick={downloadDraft} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200">
                      <Download className="w-4 h-4" /> TXT
                    </button>
                    <button onClick={downloadPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 relative rounded-lg bg-slate-50 border border-slate-200 min-h-[500px]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Draft content will appear here..."
                  className="w-full h-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed text-slate-800"
                  spellCheck="false"
                />
                {!draft && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-sm font-medium text-slate-500">Document Workspace</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Legal Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Legal Document Templates Library</h2>
            <p className="text-blue-700 max-w-2xl">
              Access standard legal formats used in Indian regulations. Click "Use Template" to load the structure into the editor and fill in the details manually or with AI assistance.
            </p>
            <p className="mt-4 text-xs text-blue-600 bg-white/50 inline-block px-3 py-1 rounded-full border border-blue-200">
              ⚖️ Disclaimer: Templates are for guidance only. Consult a lawyer for final review.
            </p>
          </div>

          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3">{category}</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {legalTemplates.filter(t => t.category === category).map(template => (
                  <div key={template.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-blue-300 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded">
                        {template.authority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{template.title}</h4>
                    <p className="text-sm text-slate-500 mb-4 flex-1">{template.description}</p>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full py-2 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" /> Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Secure Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Document Vault</h2>
                <p className="text-sm text-slate-500">Secure cloud storage for your legal files (Only accessible by you)</p>
              </div>
              <div className="w-full sm:w-auto">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png,.txt" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </div>

            {storageLoading && <div className="text-center py-4"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>}

            {!storageLoading && storedDocs.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-lg dashed-border">
                <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Your vault is empty. Draft new documents or upload existing ones.</p>
              </div>
            )}

            {!storageLoading && storedDocs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Document Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Uploaded</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storedDocs.map(doc => (
                      <tr key={doc.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          {doc.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${doc.document_type === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {doc.document_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{(doc.file_size / 1024).toFixed(1)} KB</td>
                        <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right flex gap-3 justify-end">
                          <button onClick={() => downloadStoredDocument(doc.id)} className="text-blue-600 hover:text-blue-800" title="View/Download">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteStoredDocument(doc.id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentDrafting;
