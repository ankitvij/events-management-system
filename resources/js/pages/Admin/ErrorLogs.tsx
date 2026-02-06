import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import ActionButton from '@/components/ActionButton';
import type { BreadcrumbItem } from '@/types';

type Props = {
    errorLines?: string[];
    accessLines?: string[];
    emailLines?: string[];
};

export default function ErrorLogs({ errorLines = [], accessLines = [], emailLines = [] }: Props) {
    const [errors, setErrors] = useState<string[]>(errorLines);
    const [access, setAccess] = useState<string[]>(accessLines);
    const [emails, setEmails] = useState<string[]>(emailLines);
    const [loading, setLoading] = useState(false);

    async function refresh() {
        setLoading(true);
        try {
            const res = await fetch('/admin/error-logs/data');
            if (! res.ok) return;
            const json = await res.json();
            setErrors(json.errorLines || []);
            setAccess(json.accessLines || []);
            setEmails(json.emailLines || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const id = setInterval(() => {
            refresh();
        }, 30000);
        return () => clearInterval(id);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Error Logs', href: '/admin/error-logs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Error Logs" />

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Error Logs</h1>
                    <ActionButton onClick={refresh} className={loading ? 'opacity-60 pointer-events-none' : ''}>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </ActionButton>
                </div>

                <div className="mt-4 space-y-3">
                    <details open className="rounded border bg-black text-green-200 p-3 text-xs">
                        <summary className="cursor-pointer font-semibold">Logs</summary>

                        <div className="mt-3 space-y-3">
                            <section>
                                <div className="text-sm font-semibold text-white">Error logs</div>
                                <div className="mt-2 max-h-[30vh] overflow-auto">
                                    {errors.length === 0 ? (
                                        <div className="text-muted">No error log lines found.</div>
                                    ) : (
                                        errors.map((line, idx) => (
                                            <pre key={`err-${idx}`} className="whitespace-pre-wrap break-words">{line}</pre>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="text-sm font-semibold text-white">Access logs</div>
                                <div className="mt-2 max-h-[30vh] overflow-auto">
                                    {access.length === 0 ? (
                                        <div className="text-muted">No access log lines found.</div>
                                    ) : (
                                        access.map((line, idx) => (
                                            <pre key={`acc-${idx}`} className="whitespace-pre-wrap break-words">{line}</pre>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="text-sm font-semibold text-white">Email logs</div>
                                <div className="mt-2 max-h-[30vh] overflow-auto">
                                    {emails.length === 0 ? (
                                        <div className="text-muted">No email log lines found.</div>
                                    ) : (
                                        emails.map((line, idx) => (
                                            <pre key={`mail-${idx}`} className="whitespace-pre-wrap break-words">{line}</pre>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </details>
                </div>
            </div>
        </AppLayout>
    );
}
