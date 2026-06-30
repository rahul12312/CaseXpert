import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Search, Plus, Eye, MessageSquare, X, User, Mail, Phone, Briefcase, Calendar, Hash } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/clients');
      if (res.data.success) {
        setClients(res.data.clients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClient = (client) => {
    setSelectedClient(client);
  };

  const handleMessageClient = (client) => {
    // Navigate to messages with a query so the messages page can pre-select the conversation
    navigate(`/messages?userId=${client.id}&name=${encodeURIComponent(client.name)}`);
  };

  const formatId = (id) => {
    if (!id) return 'N/A';
    return `#${id.slice(-8).toUpperCase()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all client accounts on the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-[#1E3A8A] dark:text-white"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{filteredClients.length} clients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Client Info</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Assigned Lawyer</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-center">Cases</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <span className="text-slate-500 text-sm">Loading clients...</span>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No clients found.
                  </td>
                </tr>
              ) : filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
                        {c.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Client ID: {formatId(c.id)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`text-sm font-medium ${c.lawyer === 'Unassigned' ? 'text-orange-500 italic' : 'text-slate-700 dark:text-slate-300'}`}>
                        {c.lawyer}
                      </span>
                      {c.lawyer_id && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Lawyer ID: {formatId(c.lawyer_id)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">
                      {c.cases}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      c.status === 'Active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="View Client Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMessageClient(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Message Client"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLIENT DETAIL MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                  {selectedClient.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedClient.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      selectedClient.status === 'Active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* IDs Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Client ID
                  </p>
                  <p className="text-sm font-mono font-bold text-blue-800 dark:text-blue-300">{selectedClient.id?.slice(-12).toUpperCase() || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 border ${selectedClient.lawyer_id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Lawyer ID
                  </p>
                  <p className="text-sm font-mono font-bold text-indigo-800 dark:text-indigo-300">
                    {selectedClient.lawyer_id ? selectedClient.lawyer_id.slice(-12).toUpperCase() : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Info Items */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedClient.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Assigned Lawyer</p>
                    <p className={`text-sm font-medium ${selectedClient.lawyer === 'Unassigned' ? 'text-orange-500 italic' : 'text-slate-900 dark:text-white'}`}>
                      {selectedClient.lawyer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Total Cases</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedClient.cases} case{selectedClient.cases !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Joined</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(selectedClient.joined)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { handleMessageClient(selectedClient); setSelectedClient(null); }}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> Message Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
