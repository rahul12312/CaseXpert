import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (error) setError('');
    };

    const validatePassword = (pwd) => {
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use configured api instance with POST method
            const response = await api.post(`/auth/reset-password/${token}`, { password });

            setSuccess(true);
            toast.success('Password reset successfully!');

            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds

        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to reset password. Link may be expired.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-lg dark:bg-slate-800 text-center">
                    <h2 className="text-3xl font-extrabold text-green-600">Success!</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-lg dark:bg-slate-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:text-sm"
                                placeholder="Enter new password"
                                value={password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:text-sm"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
