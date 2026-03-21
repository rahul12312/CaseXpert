import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <div className="mb-4">
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
                <div className="rounded-full bg-slate-100 p-2 transition-colors group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Back</span>
            </button>
        </div>
    );
};

export default BackButton;
