import { Head, Link } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Artist } from '@/types/entities';

type Props = {
    artist: Artist;
};

export default function ArtistsShow({ artist }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Artists', href: '/artists' },
        { title: artist.name, href: `/artists/${artist.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={artist.name} />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{artist.name}</h1>
                        <div className="text-sm text-muted">{artist.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href={`/artists/${artist.id}/edit`}>Edit</ActionButton>
                        <Link href="/artists" className="btn-secondary">Back</Link>
                    </div>
                </div>

                {artist.photo_url && (
                    <div>
                        <img src={artist.photo_url} alt={artist.name} className="h-32 w-32 rounded object-cover" />
                    </div>
                )}

                <div className="grid gap-2 text-sm">
                    <div><span className="text-muted">City:</span> {artist.city}</div>
                    <div><span className="text-muted">Experience:</span> {artist.experience_years} years</div>
                    <div><span className="text-muted">Skills:</span> {artist.skills}</div>
                    {artist.equipment ? <div><span className="text-muted">Equipment:</span> {artist.equipment}</div> : null}
                </div>

                {artist.description ? (
                    <div>
                        <h2 className="text-sm font-medium">Description</h2>
                        <div className="text-sm text-muted whitespace-pre-wrap">{artist.description}</div>
                    </div>
                ) : null}

                <div className="text-sm">
                    <span className="text-muted">Status:</span> {artist.active ? 'Active' : 'Inactive'}
                    {artist.email_verified_at ? <span className="text-muted"> · Verified</span> : <span className="text-muted"> · Not verified</span>}
                </div>
            </div>
        </AppLayout>
    );
}
