import React, { useState } from 'react';
import { Save, Globe, Shield, Mail, CreditCard, Building } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure global settings for the CaseXpert platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general' ? 'bg-[#1E3A8A] text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" /> General
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security' ? 'bg-[#1E3A8A] text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'email' ? 'bg-[#1E3A8A] text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" /> Email & SMTP
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website Name</label>
                  <input type="text" defaultValue="CaseXpert" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                  <input type="email" defaultValue="support@casexpert.com" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platform Logo</label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Building className="w-8 h-8 text-slate-400" />
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Upload New Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Security Settings</h3>
              <p className="text-sm text-slate-500">Manage 2FA, session timeouts, and password policies.</p>
              {/* Mock fields */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Require 2FA for Admins</h4>
                  <p className="text-xs text-slate-500">Enforce two-factor authentication for all admin accounts.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#1E3A8A] translate-x-5" style={{ transition: 'transform 0.2s ease-in-out' }}/>
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-[#1E3A8A] cursor-pointer"></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">SMTP Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP Host</label>
                  <input type="text" defaultValue="smtp.sendgrid.net" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP Port</label>
                  <input type="text" defaultValue="587" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button className="flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
