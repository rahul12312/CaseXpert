import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, Zap } from 'lucide-react';

const Careers = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="bg-slate-900 pt-24 pb-20 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900 pointer-events-none"></div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl relative z-10">
                    Shape the Future of <span className="text-blue-400">Justice</span>
                </h1>
                <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto relative z-10">
                    Join a team of visionaries, legal experts, and technologists redefining how the world accesses legal help.
                </p>
            </div>

            {/* Why Join Us - Block Style Content */}
            <div className="w-full">
                {/* Block 1 */}
                <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-900">
                    <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-4">
                            <Zap className="h-5 w-5" />
                            <span>Innovation First</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Redefining Legal Tech</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            At CaseXpert, we are not just building software; we are architecting the digital infrastructure of justice.
                            Our team leverages cutting-edge AI to solve complex legal challenges that have existed for decades.
                            If you love tackling hard problems and seeing your code make a real-world difference, this is your home.
                        </p>
                    </div>
                    <div className="lg:w-1/2 bg-slate-100 dark:bg-slate-800 min-h-[400px] relative">
                        <img
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
                            alt="Team Collaboration"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
                    </div>
                </div>

                {/* Block 2 */}
                <div className="flex flex-col lg:flex-row-reverse bg-slate-50 dark:bg-slate-950">
                    <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-4">
                            <Users className="h-5 w-5" />
                            <span>Collaboration & Growth</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">A Culture of Excellence</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            We believe that the best ideas come from diverse minds working together.
                            Our culture privileges openness, mentorship, and continuous learning.
                            From weekly tech talks to hackathons, we invest heavily in your professional growth because when you grow, we grow.
                        </p>
                    </div>
                    <div className="lg:w-1/2 bg-slate-200 min-h-[400px] relative">
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                            alt="Modern Office"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
                    </div>
                </div>

                {/* Block 3 */}
                <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-900">
                    <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold mb-4">
                            <Briefcase className="h-5 w-5" />
                            <span>Meaningful Impact</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Work That Matters</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            Your work here directly impacts lives. By making legal services more accessible and affordable,
                            we empower individuals to protect their rights. Every line of code contributes to a fairer, more transparent legal system.
                        </p>
                    </div>
                    <div className="lg:w-1/2 bg-slate-100 dark:bg-slate-800 min-h-[400px] relative">
                        <img
                            src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                            alt="Legal Impact"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply"></div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 py-24 text-center px-4">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to Join Us?</h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
                    We are always looking for exceptional talent to join our mission.
                    If you share our passion for technology and justice, we want to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="mailto:casexpert.support@gmail.com" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-all">
                        Email Your Resume
                    </a>
                    <Link to="/about" className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-transparent px-8 py-3 text-base font-semibold text-white hover:bg-slate-800 transition-all">
                        Learn More About Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Careers;
