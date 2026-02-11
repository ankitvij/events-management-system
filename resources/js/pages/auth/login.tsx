import { Head, router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [message, setMessage] = useState<string | undefined>(status);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(undefined);

        const password = form.data.password?.trim();
        if (password) {
            form.post(store.url(), {
                preserveScroll: true,
                onSuccess: () => setMessage(undefined),
            });
            return;
        }

        router.post(
            '/login/token',
            { email: form.data.email },
            {
                preserveScroll: true,
                onSuccess: () => setMessage('If that email exists, we have sent a sign-in link.'),
                onFinish: () => form.setData('password', ''),
            }
        );
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and a password, or leave password blank to get a sign-in link"
        >
            <Head title="Log in" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={form.data.email}
                            onChange={e => form.setData('email', e.target.value)}
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Leave blank to receive a login link"
                            value={form.data.password}
                            onChange={e => form.setData('password', e.target.value)}
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={form.data.remember}
                            onCheckedChange={checked => form.setData('remember', Boolean(checked))}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={form.processing}
                        data-test="login-button"
                    >
                        {form.processing && <Spinner />}
                        Log in or email me a link
                    </Button>
                </div>

                {canRegister && (
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <TextLink href={register()} tabIndex={5}>
                            Sign up
                        </TextLink>
                    </div>
                )}
            </form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
            {message && message !== status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {message}
                </div>
            )}
        </AuthLayout>
    );
}
