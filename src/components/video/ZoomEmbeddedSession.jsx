import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * ZoomEmbeddedSession (Optimized)
 * Loads the Zoom Meeting SDK only when mounted using dynamic imports.
 * Uses the lightweight 'Component View' for a seamless integrated experience.
 */
const ZoomEmbeddedSession = ({ zoomData, onLeave }) => {
    const { signature, sdkKey, meetingNumber, userName, zoomPassword, zakToken } = zoomData;
    const [status, setStatus] = useState('initializing');
    const clientRef = useRef(null);
    const initStartedRef = useRef(false); // Guard against StrictMode double-init

    useEffect(() => {
        let isMounted = true;

        const initZoom = async () => {
            if (initStartedRef.current) return;
            initStartedRef.current = true;

            try {
                console.log('🚀 Loading Zoom Meeting SDK (v5)...');

                // Lazy load the latest meeting SDK
                const { default: ZoomMtgEmbedded } = await import('@zoom/meetingsdk/embedded');

                console.log('🧪 Debug SDK Data:', {
                    meetingNumber: String(meetingNumber),
                    hasSignature: !!signature,
                    sigStart: signature?.substring(0, 10),
                    sdkKey: sdkKey?.substring(0, 5) + '...'
                });

                if (!isMounted) return;

                const client = ZoomMtgEmbedded.createClient();
                clientRef.current = client;

                const meetingSDKElement = document.getElementById('meetingSDKElement');

                await client.init({
                    zoomAppRoot: meetingSDKElement,
                    language: 'en-US',
                    leaveUrl: window.location.origin,
                    debug: false,
                });

                console.log('🔄 Joining Meeting:', meetingNumber);

                await client.join({
                    signature: signature,
                    clientId: sdkKey, // Using clientId instead of sdkKey for v5+
                    meetingNumber: String(meetingNumber).replace(/\s/g, ''),
                    userName: userName || 'Legal Consultation',
                    password: zoomPassword || '',
                    zak: zakToken || ''
                });

                // --- POST-MEETING REDIRECTION ---
                client.on('connection-change', (payload) => {
                    console.log('🔄 Zoom Connection Change:', payload);
                    if (payload.state === 'Closed' || payload.state === 'Disconnected') {
                        console.log('🏁 Meeting ended, redirecting...');
                        if (isMounted) onLeave();
                    }
                });

                if (isMounted) setStatus('joined');
                console.log('✅ Zoom Session Active');

            } catch (error) {
                console.error('❌ Zoom SDK Failure:', error);
                if (isMounted) setStatus('error');
            }
        };

        initZoom();

        return () => {
            isMounted = false;
            if (clientRef.current && typeof clientRef.current.leave === 'function') {
                console.log('🧹 Cleaning up Zoom Session...');
                try {
                    clientRef.current.leave().catch(e => {
                        // Ignore already-closed errors
                        if (e?.errorCode !== 5002) console.warn('Zoom leave warning:', e);
                    });
                } catch (e) {
                    // Ignore synchronous errors during cleanup
                }
            }
        };
    }, [signature, sdkKey, meetingNumber, userName, zoomPassword, zakToken]);

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-[2rem] border border-red-500/20 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Zoom SDK Connection Failed</h3>
                <p className="text-slate-400 mb-6">There was a problem initializing the secure video session.</p>
                <button
                    onClick={onLeave}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div id="meetingSDKElement"></div>
    );
};

export default ZoomEmbeddedSession;
