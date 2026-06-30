import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search, Plus, MoreVertical, Eye, MessageSquare } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
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
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                       Loading clients...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                       No clients found.
                    </td>
                  </tr>
                ) : filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.email}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${c.lawyer === 'Unassigned' ? 'text-orange-500 italic' : 'text-slate-700 dark:text-slate-300'}`}>
                      {c.lawyer}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {c.cases}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      c.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:yellow-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 rounded"><MessageSquare className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
