import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqData } from '../data/faqData';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`border-b border-slate-200 last:border-0 transition-all duration-300 ${isOpen ? 'bg-blue-50/30' : ''}`}>
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-blue-600 focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="text-base font-semibold text-slate-900 pr-8">
                    {question}
                </span>
                <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className={`h-5 w-5 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-sm leading-relaxed text-slate-600">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const items = faqData || [];

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="py-12 px-4 sm:px-0">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center justify-center rounded-full bg-blue-100 p-2 text-blue-600">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-lg text-slate-500">
                        Find answers to common questions about CaseXpert.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm sm:px-8">
                    {items.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                {/* Still have questions? */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-slate-500">
                        Still have questions?{' '}
                        <a
                            href="/contact"
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
