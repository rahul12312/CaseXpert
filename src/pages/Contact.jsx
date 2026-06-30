import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">get in Touch</h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                        Have questions about CaseXpert? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Email Us</p>
                                        <p className="text-slate-600 dark:text-slate-400">support@casexpert.com</p>
                                        <p className="text-slate-600 dark:text-slate-400">sales@casexpert.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Call Us</p>
                                        <p className="text-slate-600 dark:text-slate-400">+91 98765 43210</p>
                                        <p className="text-slate-600 dark:text-slate-400">Mon-Fri, 9am - 6pm IST</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Visit Us</p>
                                        <p className="text-slate-600 dark:text-slate-400">123 Legal Tech Park,</p>
                                        <p className="text-slate-600 dark:text-slate-400">Cyber City, Gurugram, India 122002</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-2">Need Immediate Legal Help?</h3>
                            <p className="text-indigo-100 mb-4">Our AI Assistant is available 24/7 to answer your legal queries.</p>
                            <a href="/assistant" className="inline-block rounded-lg bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                                Try AI Assistant
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-md">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="rounded-full bg-green-100 p-4 text-green-600 mb-4">
                                    <span className="text-4xl">✓</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">Thank you for contacting us. We will get back to you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-6 text-blue-600 font-medium hover:underline">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="support">Technical Support</option>
                                        <option value="sales">Sales Inquiry</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        required
                                        className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Send className="h-4 w-4" /> Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
