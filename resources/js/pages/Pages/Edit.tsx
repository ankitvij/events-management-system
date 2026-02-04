import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import RichEditor from '@/components/RichEditor';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { LooseObject } from '@/types/entities';

type Page = { id: number; title?: string | null; slug?: string | null; content?: string | null; active?: boolean } & LooseObject;

type Props = { page: Page };

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
                    <input name="title" value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Slug</label>
                    <input name="slug" value={form.data.slug} onChange={e => form.setData('slug', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Content</label>
                    <RichEditor value={form.data.content} onChange={v => form.setData('content', v)} />
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
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
