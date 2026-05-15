import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    User, Mail, Phone, Shield, Calendar, MapPin,
    Edit2, Save, X, LogOut, Key, CheckCircle, AlertCircle, Loader2, Camera
} from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        created_at: '',
        profile_image: ''
    });

    // Fetch latest profile data
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success) {
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                        role: data.user.user_type || '',
                        created_at: data.user.created_at || '',
                        profile_image: data.user.profile_image || ''
                    });
                    // Sync context if needed
                    updateUser(data.user);
                }
            } catch (error) {
                showNotification('error', 'Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('error', 'Image size should be less than 5MB');
                return;
            }
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }

            const { data } = await api.put('/auth/profile', formDataToSend, {
                headers: { 'Content-Type': undefined }
            });

            if (data.success) {
                showNotification('success', 'Profile updated successfully');

                // Update local state with returned data
                const updatedUser = {
                    name: formData.name,
                    phone: formData.phone
                };

                if (data.profile_image) {
                    updatedUser.profile_image = data.profile_image;
                    setFormData(prev => ({ ...prev, profile_image: data.profile_image }));
                }

                updateUser(updatedUser);
                setIsEditing(false);
                setProfileImage(null);
                setPreviewImage(null);
            }
        } catch (error) {
            console.error('Update error:', error);
            showNotification('error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to current user data
        setFormData({
            ...formData,
            name: user.name || '',
            phone: user.phone || ''
        });
        setProfileImage(null);
        setPreviewImage(null);
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-12">
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-slate-50">
                    My Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all ${notification.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            {/* Main Profile Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Cover Image */}
                <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
                    <div className="absolute -bottom-12 left-8 group">
                        <div className="relative">
                            <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-sm overflow-hidden dark:border-slate-900 dark:bg-slate-800 ${isEditing ? 'cursor-pointer' : ''}`}
                                onClick={triggerFileInput}>
                                {previewImage || formData.profile_image ? (
                                    <img
                                        src={previewImage || formData.profile_image}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="h-full w-full items-center justify-center text-2xl font-bold text-slate-500"
                                    style={{ display: (previewImage || formData.profile_image) ? 'none' : 'flex' }}
                                >
                                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={48} />}
                                </div>

                                {/* Overlay for editing */}
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity">
                                        <Camera size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 pt-16">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-50">
                                {formData.name || 'User'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400 capitalize">
                                {formData.role || 'Member'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        disabled={isSaving}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Details Form/View */}
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        {/* Name Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50 font-medium">
                                    <span>{formData.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Email Field (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Email Address
                            </label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50">
                                <Mail size={16} className="text-slate-400" />
                                <span>{formData.email}</span>
                                <span className="text-xs text-slate-400">(Cannot be changed)</span>
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="Enter phone number"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{formData.phone || 'Not provided'}</span>
                                </div>
                            )}
                        </div>

                        {/* Role Field (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Account Type
                            </label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50">
                                <Shield size={16} className="text-slate-400" />
                                <span className="capitalize">{formData.role}</span>
                            </div>
                        </div>

                        {/* Join Date (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Member Since
                            </label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50">
                                <Calendar size={16} className="text-slate-400" />
                                <span>{formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                        {/* Location (Static for now) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                Location
                            </label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-slate-50">
                                <MapPin size={16} className="text-slate-400" />
                                <span>New York, USA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Account Security */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-50 mb-4">
                        Account Security
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Key size={18} className="text-slate-400" />
                                <span>Change Password</span>
                            </div>
                            <span className="text-xs text-slate-400">Last changed 30 days ago</span>
                        </button>

                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-50 mb-4">
                        Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 dark:text-slate-300 dark:text-slate-300">Email Notifications</span>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 dark:text-slate-300 dark:text-slate-300">Two-Factor Auth</span>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
                onShowNotification={showNotification}
            />
        </div>
    );
};

export default Profile;
