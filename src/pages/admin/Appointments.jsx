import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Calendar as CalendarIcon, List, Clock, Video, Plus, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminAppointments = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => 
    a.lawyer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage scheduled consultations and meetings.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1E3A8A] dark:text-blue-400' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`p-1.5 rounded-md ${view === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1E3A8A] dark:text-blue-400' : 'text-slate-500'}`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by lawyer or client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
        </div>

        {view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Participants</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Date & Time</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Type</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                       Loading appointments...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                       No appointments found.
                    </td>
                  </tr>
                ) : filteredAppointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">L: {a.lawyer}</div>
                      <div className="text-sm text-slate-500">C: {a.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-slate-300 flex items-center gap-2"><CalendarIcon className="w-3 h-3 text-slate-400" /> {a.date}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2"><Clock className="w-3 h-3 text-slate-400" /> {a.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        a.type === 'Video' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {a.type === 'Video' && <Video className="w-3 h-3" />}
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        a.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {a.status === 'Scheduled' && (
                          <>
                            <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark Completed"><CheckCircle className="w-4 h-4" /></button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancel"><XCircle className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 border-t border-slate-200 dark:border-slate-800">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Calendar view is under construction. Please use list view.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
