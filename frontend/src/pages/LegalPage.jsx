import React from 'react';
import { useParams } from 'react-router-dom';

const legalContent = {
    terms: {
        title: 'Terms and Conditions',
        updated: 'December 31, 2024',
        content: (
            <>
                <h3 className="text-lg font-semibold mt-6 mb-2">1. Introduction</h3>
                <p>Welcome to CaseXpert. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">2. Use of Service</h3>
                <p>You agree to use CaseXpert only for lawful purposes. You must not use our service to transmit any malicious code or interfere with the operation of the site.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">3. Intellectual Property</h3>
                <p>All content, features, and functionality are owned by CaseXpert and are protected by international copyright, trademark, and other intellectual property laws.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">4. Limitation of Liability</h3>
                <p>CaseXpert shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>
            </>
        )
    },
    privacy: {
        title: 'Privacy Policy',
        updated: 'December 31, 2024',
        content: (
            <>
                <p>At CaseXpert, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">How We Use Information</h3>
                <p>We use your information to provide, maintain, and improve our services, communicate with you, and personalize your experience.</p>
            </>
        )
    },
    cookies: {
        title: 'Cookie Policy',
        updated: 'December 31, 2024',
        content: (
            <>
                <p>This Cookie Policy explains how CaseXpert uses cookies and similar technologies to recognize you when you visit our website.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">What are cookies?</h3>
                <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
            </>
        )
    },
    disclaimer: {
        title: 'Disclaimer',
        updated: 'December 31, 2024',
        content: (
            <>
                <p className="font-medium text-red-600 mb-4 bg-red-50 p-4 rounded-lg">Usage of this website does not create an attorney-client relationship.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">No Legal Advice</h3>
                <p>The information provided on CaseXpert is for general informational purposes only. It is not intended to constitute legal advice or to substitute for obtaining legal advice from a qualified attorney.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Accuracy of Information</h3>
                <p>While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information.</p>
            </>
        )
    }
};

const LegalPage = () => {
    const { type } = useParams();
    const data = legalContent[type] || legalContent.terms; // Default to terms if type not found

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{data.title}</h1>
                <p className="text-sm text-slate-500 mb-8">Last Updated: {data.updated}</p>

                <div className="prose prose-slate max-w-none text-slate-600">
                    {data.content}
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
