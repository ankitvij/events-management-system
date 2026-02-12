import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Artist } from '@/types/entities';

type Props = {
    artist: Artist;
};

export default function ArtistsEdit({ artist }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Artists', href: '/artists' },
        { title: artist.name, href: `/artists/${artist.id}` },
        { title: 'Edit', href: `/artists/${artist.id}/edit` },
    ];

    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const form = useForm({
        name: artist.name ?? '',
        email: artist.email ?? '',
        city: artist.city ?? '',
        experience_years: artist.experience_years ?? 0,
        skills: artist.skills ?? '',
        description: artist.description ?? '',
        equipment: artist.equipment ?? '',
        photo: null as File | null,
        active: !!artist.active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/artists/${artist.id}`, { forceFormData: true, preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${artist.name}`} />

            <div className="p-4">
                {page.props?.flash?.error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
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
                        <label htmlFor="name" className="block text-sm font-medium">Name <span className="text-red-600">*</span></label>
                        <input id="name" name="name" required value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                        <input id="email" name="email" type="email" required value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium">City <span className="text-red-600">*</span></label>
                        <input id="city" name="city" required value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
                    </div>

                    <div>
                        <label htmlFor="experience_years" className="block text-sm font-medium">Experience (years) <span className="text-red-600">*</span></label>
                        <input id="experience_years" name="experience_years" type="number" min={0} max={80} required value={form.data.experience_years} onChange={e => form.setData('experience_years', Number(e.target.value))} className="input" />
                    </div>

                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium">Skills <span className="text-red-600">*</span></label>
                        <textarea id="skills" name="skills" required value={form.data.skills} onChange={e => form.setData('skills', e.target.value)} className="input" rows={3} />
                    </div>

                    <div>
                        <label htmlFor="equipment" className="block text-sm font-medium">Equipment</label>
                        <textarea id="equipment" name="equipment" value={form.data.equipment} onChange={e => form.setData('equipment', e.target.value)} className="input" rows={3} />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea id="description" name="description" value={form.data.description} onChange={e => form.setData('description', e.target.value)} className="input" rows={4} />
                    </div>

                    <div>
                        <label htmlFor="photo" className="block text-sm font-medium">Photo</label>
                        <input id="photo" name="photo" type="file" onChange={e => form.setData('photo', e.target.files?.[0] ?? null)} accept="image/*" />
                        {artist.photo_url && (
                            <div className="mt-2">
                                <img src={artist.photo_url} alt={artist.name} className="h-20 w-20 rounded object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                            <span className="text-sm">Active</span>
                        </label>
                    </div>

                    <div>
                        <ActionButton type="submit" disabled={form.processing}>Save</ActionButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
