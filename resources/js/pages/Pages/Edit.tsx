import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

type Props = { page: any };

export default function Edit({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: page.title, href: `/pages/${page.id}` },
        { title: 'Edit', href: `/pages/${page.id}/edit` },
    ];

    const form = useForm({ title: page.title || '', slug: page.slug || '', content: page.content || '', active: page.active ?? true });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/pages/${page.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${page.title}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Slug</label>
                    <input value={form.data.slug} onChange={e => form.setData('slug', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Content</label>
                    <textarea value={form.data.content} onChange={e => form.setData('content', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                </div>
            </form>
        </AppLayout>
    );
}
