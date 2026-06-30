import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle,
  X, User, Mail, Phone, Award, FileText
} from 'lucide-react';

const AdminLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/lawyers');
      setLawyers(res.data.lawyers || []);
    } catch (error) {
      console.error("Failed to fetch lawyers", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyerDetails = async (id) => {
    try {
      setViewLoading(true);
      const response = await api.get(`/admin/lawyers/${id}`);
      if (response.data.success) {
        setSelectedLawyer(response.data.lawyer);
      }
    } catch (error) {
      console.error("Failed to fetch lawyer details", error);
      alert("Failed to load lawyer details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Approve this lawyer?')) return;
    try {
      await api.put(`/admin/lawyers/${id}/approve`);
      fetchLawyers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this lawyer?')) return;
    try {
      await api.put(`/admin/lawyers/${id}/reject`);
      fetchLawyers();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredLawyers = lawyers.filter(l => {
    const matchesSearch = l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const paginatedLawyers = filteredLawyers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lawyers Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and verify lawyer profiles on the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Lawyer
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-sm font-medium focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Lawyer Info</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Contact</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Specialization & Exp</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Verification</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                    Loading lawyers...
                  </td>
                </tr>
              ) : paginatedLawyers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No lawyers found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedLawyers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {l.profile_image ? <img src={l.profile_image} className="w-full h-full rounded-full object-cover" alt="" /> : l.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{l.name}</div>
                          <div className="text-xs text-slate-500">ID: {l.bar_council_id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-slate-300">{l.email}</div>
                      <div className="text-xs text-slate-500">{l.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-300 truncate max-w-[150px]">{l.specialization || 'General'}</div>
                      <div className="text-xs text-slate-500">{l.experience} Years Exp.</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-block ${
                        l.verification_status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                        l.verification_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {l.verification_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {l.verification_status === 'PENDING_VERIFICATION' && (
                           <>
                             <button onClick={() => handleVerify(l.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                             <button onClick={() => handleReject(l.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle className="w-4 h-4" /></button>
                           </>
                        )}
                        <button onClick={() => fetchLawyerDetails(l.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded" title="View Profile"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 rounded"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLawyers.length)} of {filteredLawyers.length} lawyers
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-50"
              >Prev</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Loading Overlay */}
      {viewLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-full shadow-xl shadow-blue-200/50">
            <div className="w-6 h-6 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* DETAILED LAWYER PROFILE MODAL */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                  {selectedLawyer.profile_image ? (
                    <img src={selectedLawyer.profile_image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ) : selectedLawyer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLawyer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide border ${selectedLawyer.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
                      selectedLawyer.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                      {selectedLawyer.verification_status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">• Joined {new Date(selectedLawyer.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Personal Info */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#1E3A8A]" /> Personal Details
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.email}</p>
                        </div>
                      </div>
                      <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#1E3A8A]" /> Professional Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Specialization</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLawyer.specialization?.split(',').map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-xs font-semibold rounded-lg border border-blue-100">
                              {tag.trim()}
                            </span>
                          )) || <span className="text-gray-400 italic">None listed</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedLawyer.experience} Years</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Fees</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">₹{selectedLawyer.consultation_fee || '0'} /hr</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Languages</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.languages || 'Not specified'}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Documents & Actions */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1E3A8A]" /> Verification Documents
                    </h3>

                    {selectedLawyer.documents && selectedLawyer.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedLawyer.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-10 w-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title || doc.document_type || 'Document'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.file_type?.toUpperCase()} • {(doc.file_size / 1024).toFixed(0)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(doc.url || doc.s3_key || '#', '_blank')}
                              className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No documents uploaded</p>
                        <p className="text-xs text-gray-400">This lawyer hasn't uploaded verification proofs yet.</p>
                      </div>
                    )}
                  </section>

                  {selectedLawyer.bio && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">About</h3>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{selectedLawyer.bio}"</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setSelectedLawyer(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>

              {selectedLawyer.verification_status === 'PENDING_VERIFICATION' && (
                <>
                  <button
                    onClick={() => handleReject(selectedLawyer.id)}
                    className="px-5 py-2.5 text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Application
                  </button>
                  <button
                    onClick={() => handleVerify(selectedLawyer.id)}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 rounded-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Verify & Approve
                  </button>
                </>
              )}

              {selectedLawyer.verification_status === 'VERIFIED' && (
                <button
                  onClick={() => handleReject(selectedLawyer.id)}
                  className="px-5 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Revoke Verification
                </button>
              )}

              {selectedLawyer.verification_status === 'REJECTED' && (
                <button
                  onClick={() => handleVerify(selectedLawyer.id)}
                  className="px-5 py-2.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Re-Approve Lawyer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLawyers;
