import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import TextLink from '@/components/text-link';
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
        password: '',
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
                        <label htmlFor="password" className="block text-sm font-medium">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.data.password}
                            onChange={e => form.setData('password', e.target.value)}
                            className="input"
                            placeholder="Leave blank to receive a sign-in link"
                        />
                        {form.errors.password && <div className="mt-1 text-sm text-red-600">{form.errors.password}</div>}
                    </div>

                    <div>
                        <ActionButton type="submit" disabled={form.processing}>
                            {form.processing ? 'Signing in...' : 'Sign in or send login link'}
                        </ActionButton>
                    </div>

                    <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                        <div>
                            Admin?{' '}
                            <TextLink href="/login">Log in here</TextLink>
                        </div>
                        <div>
                            Customer?{' '}
                            <TextLink href="/customer/login">Customer login</TextLink>
                        </div>
                        <div>
                            Agency?{' '}
                            <TextLink href="/login">Agency login</TextLink>
                        </div>
                        <div>
                            Artist?{' '}
                            <TextLink href="/login">Artist login</TextLink>
                        </div>
                        <div>
                            Promoter?{' '}
                            <TextLink href="/login">Promoter login</TextLink>
                        </div>
                        <div>
                            Vendor?{' '}
                            <TextLink href="/login">Vendor login</TextLink>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
