import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

export default function CustomerLogin() {
    const page = usePage<{ status?: string }>();
    const status = page.props.status;
    const initialEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email') ?? ''
        : '';
    const form = useForm({ email: initialEmail, password: '' });

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post('/customer/login', {
            preserveScroll: true,
        });
    }

    return (
        <AuthLayout title="Customer login" description="Login to view your orders">
            <Head title="Customer login" />

            <form onSubmit={submit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} required />
                    <InputError message={form.errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={form.data.password}
                        onChange={e => form.setData('password', e.target.value)}
                        placeholder="Leave blank to receive a login link"
                    />
                    <InputError message={form.errors.password} />
                </div>

                <Button type="submit" disabled={form.processing}>{form.processing ? 'Signing in...' : 'Sign in'}</Button>
            </form>

            {status && (
                <div className="mt-6 rounded-md bg-muted/50 p-3 text-sm text-foreground">
                    {status}
                </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                <div>
                    Admin?{' '}
                    <TextLink href={login()}>
                        Log in here
                    </TextLink>
                </div>
                <div>
                    Organiser?{' '}
                    <TextLink href="/organisers/login">
                        Organiser login
                    </TextLink>
                </div>
                <div>
                    Agency?{' '}
                    <TextLink href={login()}>
                        Agency login
                    </TextLink>
                </div>
                <div>
                    Artist?{' '}
                    <TextLink href={login()}>
                        Artist login
                    </TextLink>
                </div>
                <div>
                    Promoter?{' '}
                    <TextLink href={login()}>
                        Promoter login
                    </TextLink>
                </div>
                <div>
                    Vendor?{' '}
                    <TextLink href={login()}>
                        Vendor login
                    </TextLink>
                </div>
            </div>

        </AuthLayout>
    );
}
