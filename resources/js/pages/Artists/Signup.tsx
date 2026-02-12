import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Artists', href: '/artists' },
    { title: 'Signup', href: '/artists/signup' },
];

const artistTypeOptions = [
    { value: 'dj', label: 'DJ' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'performer', label: 'Performer' },
    { value: 'public_speaker', label: 'Public Speaker' },
    { value: 'other', label: 'Other' },
];

export default function ArtistsSignup() {
    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const form = useForm({
        name: '',
        email: '',
        city: '',
        experience_years: 0,
        skills: '',
        artist_types: [] as string[],
        description: '',
        equipment: '',
        photo: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/artists/signup', { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artist Signup" />

            <div className="p-4">
                {page.props?.flash?.error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
                    </div>
                )}
                {page.props?.flash?.success && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        <p>{page.props.flash.success}</p>
                        <ul className="mt-2 list-disc pl-5">
                            <li>Check your inbox for the verification email.</li>
                            <li>Click the verification link to activate your profile.</li>
                            <li>After activation, your profile appears in the artists directory.</li>
                        </ul>
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
                        {form.errors.name && <div className="mt-1 text-sm text-red-600">{form.errors.name}</div>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                        <input id="email" name="email" type="email" required value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                        {form.errors.email && <div className="mt-1 text-sm text-red-600">{form.errors.email}</div>}
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium">City <span className="text-red-600">*</span></label>
                        <input id="city" name="city" required value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
                        {form.errors.city && <div className="mt-1 text-sm text-red-600">{form.errors.city}</div>}
                    </div>

                    <div>
                        <label htmlFor="experience_years" className="block text-sm font-medium">Experience (years) <span className="text-red-600">*</span></label>
                        <input id="experience_years" name="experience_years" type="number" min={0} max={80} required value={form.data.experience_years} onChange={e => form.setData('experience_years', Number(e.target.value))} className="input" />
                        {form.errors.experience_years && <div className="mt-1 text-sm text-red-600">{form.errors.experience_years}</div>}
                    </div>

                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium">Skills <span className="text-red-600">*</span></label>
                        <textarea id="skills" name="skills" required value={form.data.skills} onChange={e => form.setData('skills', e.target.value)} className="input" rows={3} />
                        {form.errors.skills && <div className="mt-1 text-sm text-red-600">{form.errors.skills}</div>}
                    </div>

                    <div>
                        <label htmlFor="artist_types" className="block text-sm font-medium">Artist type <span className="text-red-600">*</span></label>
                        <select
                            id="artist_types"
                            name="artist_types"
                            multiple
                            required
                            className="input min-h-28"
                            value={form.data.artist_types}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                                form.setData('artist_types', selected);
                            }}
                        >
                            {artistTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                        {form.errors.artist_types && <div className="mt-1 text-sm text-red-600">{form.errors.artist_types}</div>}
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
                        <label htmlFor="photo" className="block text-sm font-medium">Photo <span className="text-red-600">*</span></label>
                        <input id="photo" name="photo" type="file" required onChange={e => form.setData('photo', e.target.files?.[0] ?? null)} accept="image/*" />
                        {form.errors.photo && <div className="mt-1 text-sm text-red-600">{form.errors.photo}</div>}
                    </div>

                    <div>
                        <ActionButton type="submit" disabled={form.processing}>Sign Up</ActionButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
