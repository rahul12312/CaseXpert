import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const types = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-500'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-500'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500'
        }
    };

    const config = types[type] || types.success;
    const Icon = config.icon;

    return (
        <div
            className={`fixed top-4 right-4 z-50 min-w-[320px] max-w-md animate-slide-in-right shadow-lg rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
                    aria-label="Close notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
