import { Head, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function CustomerLogin() {
    const page = usePage();
    const status = (page.props as any)?.status as string | undefined;
    const initialEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email') ?? ''
        : '';
    const form = useForm({ email: initialEmail, password: '' });
    const [processing, setProcessing] = useState(false);

    function submit(e: any) {
        e.preventDefault();
        setProcessing(true);
        form.post('/customer/login', {
            onFinish: () => setProcessing(false),
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

                <Button type="submit" disabled={processing}>{processing ? 'Signing in...' : 'Sign in or email me a link'}</Button>
            </form>

            {status && (
                <div className="mt-6 rounded-md bg-muted/50 p-3 text-sm text-foreground">
                    {status}
                </div>
            )}

        </AuthLayout>
    );
}
