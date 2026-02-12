import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function CustomerRegister() {
    const initialEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email') ?? ''
        : '';
    const form = useForm({ name: '', email: initialEmail, password: '', password_confirmation: '' });
    const [processing, setProcessing] = useState(false);

    function submit(e: any) {
        e.preventDefault();
        setProcessing(true);
        form.post('/customer/register', {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AuthLayout title="Create customer account" description="Create an account to manage your orders">
            <Head title="Customer register" />

            <form onSubmit={submit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} required />
                    <InputError message={form.errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} required />
                    <InputError message={form.errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm</Label>
                    <Input id="password_confirmation" type="password" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.target.value)} required />
                </div>

                <Button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create account'}</Button>
            </form>
        </AuthLayout>
    );
}
