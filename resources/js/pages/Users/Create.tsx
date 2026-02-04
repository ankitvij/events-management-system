import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: 'Create', href: '/users/create' },
    ];

    const form = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true,
    });

    const page = usePage();
    const isSuper = !!page.props?.auth?.user?.is_super_admin;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/users');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                        {form.errors.name && <div className="text-sm text-destructive mt-1">{form.errors.name}</div>}
                </div>

                {isSuper && (
                    <div>
                        <label className="block text-sm font-medium">Role</label>
                        <select name="role" value={form.data.role} onChange={e => form.setData('role', e.target.value)} className="input">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                            {form.errors.role && <div className="text-sm text-destructive mt-1">{form.errors.role}</div>}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                        {form.errors.email && <div className="text-sm text-destructive mt-1">{form.errors.email}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input name="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} className="input" />
                        {form.errors.password && <div className="text-sm text-destructive mt-1">{form.errors.password}</div>}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Create</button>
                </div>
            </form>
        </AppLayout>
    );
}
