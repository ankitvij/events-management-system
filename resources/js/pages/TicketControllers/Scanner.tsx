import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type EventRow = {
    id: number;
    slug?: string | null;
    title: string;
    start_at?: string | null;
};

type TicketScan = {
    status: 'ready_to_check_in' | 'already_checked_in' | 'invalid';
    label: string;
    detail?: string | null;
};

type Props = {
    controllerEmail: string;
    events: EventRow[];
};

declare global {
    interface Window {
        BarcodeDetector?: {
            new (options?: { formats?: string[] }): {
                detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
            };
        };
    }
}

export default function TicketControllerScanner({ controllerEmail, events }: Props) {
    const page = usePage<{ flash?: { ticketScan?: TicketScan; success?: string } }>();
    const [payload, setPayload] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    const ticketScan = page.props?.flash?.ticketScan;

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

    async function startScanning(): Promise<void> {
        setScanError(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setScanError('Camera access is not available in this browser.');
            return;
        }

        if (!window.BarcodeDetector) {
            setScanError('QR scanning is not supported in this browser. Paste QR payload manually below.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setIsScanning(true);

            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const tick = async (): Promise<void> => {
                if (!videoRef.current) {
                    return;
                }

                try {
                    const codes = await detector.detect(videoRef.current);
                    const value = codes.find((code) => typeof code.rawValue === 'string' && code.rawValue.trim() !== '')?.rawValue;
                    if (value) {
                        setPayload(value);
                        stopScanning();
                        submitPayload(value);
                        return;
                    }
                } catch {
                    setScanError('Unable to decode QR from camera. You can paste payload manually.');
                }

                rafRef.current = window.requestAnimationFrame(() => {
                    void tick();
                });
            };

            void tick();
        } catch {
            setScanError('Could not access camera. Please allow camera permission or paste payload manually.');
            stopScanning();
        }
    }

    function stopScanning(): void {
        setIsScanning(false);

        if (rafRef.current !== null) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }

    function submitPayload(value: string): void {
        router.post('/ticket-controllers/check-in', { payload: value }, { preserveScroll: true, preserveState: true });
    }

    function statusClasses(status: TicketScan['status']): string {
        if (status === 'ready_to_check_in') {
            return 'border-blue-200 bg-blue-50 text-blue-800';
        }

        if (status === 'already_checked_in') {
            return 'border-gray-300 bg-gray-100 text-gray-700';
        }

        return 'border-red-200 bg-red-50 text-red-700';
    }

    return (
        <AppLayout>
            <Head title="Ticket controller scanner" />

            <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Ticket controller scanner</h1>
                    <p className="text-sm text-muted">Signed in as {controllerEmail}</p>
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Assigned events</h2>
                    <div className="mt-2 grid gap-2">
                        {events.map((event) => (
                            <div key={event.id} className="text-sm text-muted">
                                {event.title}{event.start_at ? ` · ${new Date(event.start_at).toLocaleDateString()}` : ''}
                            </div>
                        ))}
                    </div>
                </div>

                {ticketScan && (
                    <div className={`rounded-md border p-3 text-sm ${statusClasses(ticketScan.status)}`}>
                        <div className="font-semibold">{ticketScan.label}</div>
                        {ticketScan.detail ? <div className="mt-1">{ticketScan.detail}</div> : null}
                    </div>
                )}

                <div className="box space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {!isScanning ? (
                            <button type="button" className="btn-primary" onClick={() => void startScanning()}>
                                Start QR scan
                            </button>
                        ) : (
                            <button type="button" className="btn-secondary" onClick={stopScanning}>
                                Stop scan
                            </button>
                        )}
                        <form method="post" action="/ticket-controllers/logout">
                            <button type="submit" className="btn-secondary">Logout</button>
                        </form>
                    </div>

                    <video ref={videoRef} className="w-full max-w-xl rounded border border-border bg-black" autoPlay muted playsInline />

                    {scanError ? <div className="text-sm text-red-600">{scanError}</div> : null}

                    <div className="grid gap-2">
                        <label htmlFor="payload" className="text-sm font-medium">Manual payload input</label>
                        <textarea
                            id="payload"
                            className="input min-h-24"
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            placeholder='Paste QR payload JSON (for example: {"booking_code":"ABC123"})'
                        />
                        <div>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => submitPayload(payload)}
                                disabled={payload.trim() === ''}
                            >
                                Check in scanned ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
