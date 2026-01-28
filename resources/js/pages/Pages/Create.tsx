import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import RichEditor from '@/components/RichEditor';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: 'Create', href: '/pages/create' },
    ];

    const form = useForm({ title: '', slug: '', content: '', active: true });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/pages');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />

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
                    <RichEditor value={form.data.content} onChange={v => form.setData('content', v)} />
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
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
