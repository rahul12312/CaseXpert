import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    User, Mail, Phone, Shield, Calendar, MapPin,
    Edit2, Save, X, LogOut, Key, CheckCircle, AlertCircle, Loader2, Camera, FileText
} from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

const InputField = ({ label, name, type="text", options=null, formData, handleChange, isEditing, maxLength, minLength, pattern }) => (
    <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
        </label>
        {isEditing ? (
            options ? (
                <select name={name} value={formData[name]} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:text-white">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={formData[name]} onChange={handleChange} maxLength={maxLength} minLength={minLength} pattern={pattern} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:text-white" />
            )
        ) : (
            <div className="rounded-lg border border-transparent bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white">
                {formData[name] || <span className="text-slate-400 italic">Not provided</span>}
            </div>
        )}
    </div>
);

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

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const [identityProof, setIdentityProof] = useState(null);
    const [identityProofName, setIdentityProofName] = useState("");

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: '', created_at: '', profile_image: '', client_id: '',
        dob: '', gender: 'Prefer not to say', occupation: '', nationality: '', marital_status: 'Prefer not to say', blood_group: '',
        alternate_phone: '', emergency_contact: '', preferred_communication: 'Email',
        address_street: '', address_city: '', address_state: '', address_country: '', address_pin_code: '',
        identity_aadhaar: '', identity_pan: '', identity_passport: '', identity_driving_license: '', identity_proof_url: ''
    });

    // Fetch latest profile data
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success) {
                    setFormData({
                        name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '', role: data.user.user_type || '', created_at: data.user.created_at || '', profile_image: data.user.profile_image || '', client_id: data.user._id ? data.user._id.slice(-6).toUpperCase() : '',
                        dob: data.user.dob ? data.user.dob.substring(0, 10) : '', gender: data.user.gender || 'Prefer not to say', occupation: data.user.occupation || '', nationality: data.user.nationality || '', marital_status: data.user.marital_status || 'Prefer not to say', blood_group: data.user.blood_group || '',
                        alternate_phone: data.user.alternate_phone || '', emergency_contact: data.user.emergency_contact || '', preferred_communication: data.user.preferred_communication || 'Email',
                        address_street: data.user.address?.street || '', address_city: data.user.address?.city || '', address_state: data.user.address?.state || '', address_country: data.user.address?.country || '', address_pin_code: data.user.address?.pin_code || '',
                        identity_aadhaar: data.user.identity?.aadhaar || '', identity_pan: data.user.identity?.pan || '', identity_passport: data.user.identity?.passport || '', identity_driving_license: data.user.identity?.driving_license || '', identity_proof_url: data.user.identity?.proof_url || ''
                    });
                    if (data.user.email_notifications !== undefined) {
                        setEmailNotifications(data.user.email_notifications);
                    } else {
                        const localEmail = localStorage.getItem(`casexpert_pref_email_${data.user._id || data.user.id}`);
                        if (localEmail !== null) setEmailNotifications(localEmail === 'true');
                    }
                    if (data.user.two_factor_auth !== undefined) {
                        setTwoFactorAuth(data.user.two_factor_auth);
                    } else {
                        const local2fa = localStorage.getItem(`casexpert_pref_2fa_${data.user._id || data.user.id}`);
                        if (local2fa !== null) setTwoFactorAuth(local2fa === 'true');
                    }
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

    const handleToggleEmailNotifications = async () => {
        const newValue = !emailNotifications;
        setEmailNotifications(newValue);
        const userId = user._id || user.id;
        if (userId) {
            localStorage.setItem(`casexpert_pref_email_${userId}`, String(newValue));
        }
        try {
            await api.put('/auth/preferences', { email_notifications: newValue });
            showNotification('success', `Email notifications turned ${newValue ? 'ON' : 'OFF'}`);
        } catch (error) {
            console.error('Failed to update email preferences:', error);
        }
    };

    const handleToggleTwoFactorAuth = async () => {
        const newValue = !twoFactorAuth;
        setTwoFactorAuth(newValue);
        const userId = user._id || user.id;
        if (userId) {
            localStorage.setItem(`casexpert_pref_2fa_${userId}`, String(newValue));
        }
        try {
            await api.put('/auth/preferences', { two_factor_auth: newValue });
            showNotification('success', `Two-Factor Authentication turned ${newValue ? 'ON' : 'OFF'}`);
        } catch (error) {
            console.error('Failed to update 2FA preferences:', error);
        }
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
            
            // Append all fields
            Object.keys(formData).forEach(key => {
                // don't send uneditable fields
                if (!['email', 'role', 'created_at', 'profile_image', 'client_id', 'identity_proof_url'].includes(key)) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }
            if (identityProof) {
                formDataToSend.append('identityProof', identityProof);
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 md:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        My Profile
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your account settings, personal information, and preferences.
                    </p>
                </div>
                <div>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={handleCancel} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <X size={16} /> Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {notification && (
                <div className={`fixed top-24 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN - Avatar & Security */}
                <div className="space-y-6">
                    {/* Avatar Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col items-center">
                        <div className={`relative mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`} onClick={triggerFileInput}>
                            {previewImage || formData.profile_image ? (
                                <img src={previewImage || formData.profile_image} alt="Profile" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div className="h-full w-full items-center justify-center text-4xl font-bold text-slate-400" style={{ display: (previewImage || formData.profile_image) ? 'none' : 'flex' }}>
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={48} />}
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="text-white h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">{formData.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 capitalize">{formData.role}</p>
                        
                        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex justify-between items-center text-sm border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Client ID:</span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">#{formData.client_id || 'PENDING'}</span>
                        </div>
                    </div>

                    {/* Security & Preferences Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Shield size={18} className="text-blue-500" /> Security & Preferences</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates via email</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input type="checkbox" className="peer sr-only" checked={emailNotifications} onChange={handleToggleEmailNotifications} />
                                    <div className="peer h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Auth</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input type="checkbox" className="peer sr-only" checked={twoFactorAuth} onChange={handleToggleTwoFactorAuth} />
                                    <div className="peer h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                                </label>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <button onClick={() => setIsPasswordModalOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <Key size={16} /> Change Password
                                </button>
                                <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Information */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><User size={18} className="text-blue-500" /> Basic Information</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputField label="Full Name" name="name" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Email Address" name="email" type="email" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Date of Birth" name="dob" type="date" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Gender" name="gender" options={["Male", "Female", "Other", "Prefer not to say"]} formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Occupation" name="occupation" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Nationality" name="nationality" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Marital Status" name="marital_status" options={["Single", "Married", "Divorced", "Widowed", "Separated", "Prefer not to say"]} formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            <InputField label="Blood Group (Optional)" name="blood_group" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Phone size={18} className="text-blue-500" /> Contact Information</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InputField label="Mobile Number" name="phone" type="tel" maxLength="10" minLength="10" pattern="[0-9]{10}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="Alternate Mobile Number" name="alternate_phone" type="tel" maxLength="10" minLength="10" pattern="[0-9]{10}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="Emergency Contact" name="emergency_contact" type="tel" maxLength="10" minLength="10" pattern="[0-9]{10}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="Preferred Communication" name="preferred_communication" options={["Phone", "Email", "WhatsApp"]} formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 mt-2">Address</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <InputField label="Street Address" name="address_street" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                    </div>
                                    <InputField label="City" name="address_city" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                    <InputField label="State / Province" name="address_state" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                    <InputField label="Country" name="address_country" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                    <InputField label="PIN / ZIP Code" name="address_pin_code" maxLength="6" minLength="6" pattern="[0-9]{6}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identity Details */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">ID</span> 
                                Identity Details
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InputField label="Aadhaar Number" name="identity_aadhaar" maxLength="12" minLength="12" pattern="[0-9]{12}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="PAN Number" name="identity_pan" maxLength="10" minLength="10" pattern="[A-Z0-9]{10}" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="Passport Number (Optional)" name="identity_passport" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                                <InputField label="Driving License (Optional)" name="identity_driving_license" formData={formData} handleChange={handleChange} isEditing={isEditing} />
                            </div>
                            
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Identity Proof Document
                                </label>
                                {isEditing ? (
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                        <div className="space-y-1 text-center">
                                            <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setIdentityProof(file);
                                                            setIdentityProofName(file.name);
                                                        }
                                                    }} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">PDF, PNG, JPG up to 5MB</p>
                                            {identityProofName && <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2">{identityProofName}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                                        {formData.identity_proof_url ? (
                                            <a href={formData.identity_proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">ID</div>
                                                View Uploaded Document
                                            </a>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No identity proof uploaded</p>
                                        )}
                                    </div>
                                )}
                            </div>
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
        </div>
    );
};

export default Profile;
