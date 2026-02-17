import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Organisers', href: '/organisers' },
    { title: 'Login', href: '/organisers/login' },
];

export default function OrganisersLogin() {
    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const form = useForm({
        email: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/organisers/login/token');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organiser Login" />

            <div className="p-4">
                {page.props?.flash?.error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
                    </div>
                )}
                {page.props?.flash?.success && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {page.props.flash.success}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {Object.keys(form.errors).length > 0 && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                            <p className="font-semibold">Please fix the following:</p>
                            <ul className="list-disc pl-5">
                                {Object.values(form.errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                        <input id="email" name="email" type="email" required value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                        {form.errors.email && <div className="mt-1 text-sm text-red-600">{form.errors.email}</div>}
                    </div>

                    <div>
                        <ActionButton type="submit" disabled={form.processing}>{form.processing ? 'Sending...' : 'Send login link'}</ActionButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
