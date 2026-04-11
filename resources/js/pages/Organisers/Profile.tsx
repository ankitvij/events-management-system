import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    organiser: {
        id: number;
        name: string;
        email: string;
    };
    hasPassword: boolean;
};

export default function Profile({ organiser, hasPassword }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: 'Organiser profile', href: '/organisers/profile' },
    ];

    const profileForm = useForm({
        name: organiser.name ?? '',
        email: organiser.email ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        profileForm.put('/organisers/profile', { preserveScroll: true });
    };

    const submitPassword = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        passwordForm.put('/organisers/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organiser profile" />

            <div className="mx-auto w-full max-w-3xl p-4">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
                        <p className="mt-1 text-sm text-gray-600">Update your organiser details.</p>

                        <form onSubmit={submitProfile} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input mt-1"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                />
                                {profileForm.errors.name ? <p className="mt-1 text-sm text-red-600">{profileForm.errors.name}</p> : null}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input mt-1"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                />
                                {profileForm.errors.email ? <p className="mt-1 text-sm text-red-600">{profileForm.errors.email}</p> : null}
                            </div>

                            <button type="submit" className="btn-primary" disabled={profileForm.processing}>
                                Save profile
                            </button>
                        </form>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">{hasPassword ? 'Change password' : 'Set password'}</h2>
                        <p className="mt-1 text-sm text-gray-600">Use a strong password with at least 8 characters.</p>

                        <form onSubmit={submitPassword} className="mt-4 space-y-4">
                            {hasPassword ? (
                                <div>
                                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current password</label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        className="input mt-1"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        required
                                    />
                                    {passwordForm.errors.current_password ? <p className="mt-1 text-sm text-red-600">{passwordForm.errors.current_password}</p> : null}
                                </div>
                            ) : null}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="input mt-1"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    required
                                />
                                {passwordForm.errors.password ? <p className="mt-1 text-sm text-red-600">{passwordForm.errors.password}</p> : null}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm new password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className="input mt-1"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={passwordForm.processing}>
                                {hasPassword ? 'Change password' : 'Set password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
