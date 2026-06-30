import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Using the configured api instance
            const response = await api.post('/auth/forgot-password', { email });


            setSent(true);
            toast.success(response.data.message || 'Email sent successfully');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-lg dark:bg-slate-800 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">Check your email</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
                        We have sent a password reset link to <strong>{email}</strong>.
                    </p>
                    <div className="mt-6">
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-lg dark:bg-slate-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">
                        Forgot Password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 text-sm">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
