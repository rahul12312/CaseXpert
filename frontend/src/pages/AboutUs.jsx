import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-90" />
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                        Revolutionizing <span className="text-blue-400">Legal Practice</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
                        CaseXpert is on a mission to democratize access to legal services and empower legal professionals with cutting-edge AI technology.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Our Mission
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                We believe that justice should be accessible, efficient, and transparent. By leveraging the power of Artificial Intelligence, we are bridging the gap between complex legal processes and the people who need them.
                            </p>
                            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
                                For lawyers, we provide tools that automate the mundane, allowing them to focus on strategy and client relationships. For clients, we provide clarity and connection in what is often a confusing landscape.
                            </p>
                        </div>
                        <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-lg sm:h-96">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-9xl opacity-20 font-bold">
                                ⚖️
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-6">
                                    <div className="text-5xl font-bold text-indigo-600 mb-2">10k+</div>
                                    <div className="text-slate-600 dark:text-slate-400 font-medium">Cases Managed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-slate-50 dark:bg-slate-950 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Our Core Values</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            Principles that guide every innovation and interaction at CaseXpert.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Innovation',
                                description: 'Constant pushing of boundaries to bring the best tech to law.',
                                icon: '🚀',
                            },
                            {
                                title: 'Integrity',
                                description: 'Building trust through transparency and ethical AI use.',
                                icon: '🛡️',
                            },
                            {
                                title: 'Accessibility',
                                description: 'Making legal help available to everyone, everywhere.',
                                icon: '🌍',
                            },
                        ].map((value) => (
                            <div key={value.title} className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm transition-all hover:shadow-md">
                                <div className="mb-4 text-4xl">{value.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{value.title}</h3>
                                <p className="mt-2 text-slate-600 dark:text-slate-400">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white dark:bg-slate-900 py-16 text-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to join the future of law?</h2>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/register" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors">
                            Get Started
                        </Link>
                        <Link to="/contact" className="rounded-full border border-slate-300 bg-white dark:bg-slate-900 px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
