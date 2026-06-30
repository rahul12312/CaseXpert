import React, { useState } from 'react';
import { Search, UploadCloud, FileText, Download, Trash2, File } from 'lucide-react';

const MOCK_DOCS = [
  { id: 1, name: 'Bar_Council_ID_Rahul.pdf', lawyer: 'Rahul Sharma', category: 'ID Proof', date: '2023-11-20', size: '1.2 MB', url: '/documents/Bar_Council_ID_Rahul.pdf' },
  { id: 2, name: 'LLB_Degree_Certificate.pdf', lawyer: 'Amit Kumar', category: 'Educational', date: '2023-11-19', size: '3.1 MB', url: '/documents/LLB_Degree_Certificate.pdf' },
  { id: 3, name: 'Practice_License_2023.pdf', lawyer: 'Priya Patel', category: 'License', date: '2023-11-18', size: '850 KB', url: '/documents/Practice_License_2023.pdf' },
  { id: 4, name: 'Tax_Registration_Card.pdf', lawyer: 'Rahul Sharma', category: 'Tax & Compliance', date: '2023-11-21', size: '420 KB', url: '/documents/Tax_Registration_Card.pdf' },
  { id: 5, name: 'Address_Proof_Utility.pdf', lawyer: 'Vikram Singh', category: 'Address Proof', date: '2023-11-22', size: '2.4 MB', url: '/documents/Address_Proof_Utility.pdf' },
];

const AdminDocuments = () => {
  const [documents] = useState(MOCK_DOCS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.lawyer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lawyer Document Storage</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and securely store lawyer credentials, ID proofs, and licenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DRAG & DROP UPLOAD */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center h-64 border-dashed border-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <UploadCloud className="w-12 h-12 text-[#1E3A8A] mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Upload Document</h3>
            <p className="text-xs text-slate-500 mb-4">Drag & drop files here or click to browse</p>
            <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
              Select Files
            </button>
          </div>
        </div>

        {/* DOCUMENT LIST */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents by name or lawyer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Document</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Lawyer / Category</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Date & Size</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-slate-300 font-medium">{d.lawyer}</div>
                      <div className="text-xs text-slate-500">{d.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-slate-300">{d.date}</div>
                      <div className="text-xs text-slate-500">{d.size}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={d.url} download={d.name} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded flex items-center justify-center" title="Download">
                          <Download className="w-4 h-4" />
                        </a>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No documents found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocuments;
