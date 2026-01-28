import { Link } from '@inertiajs/react';
import React from 'react';

export default function OrganiserPlaceholder() {
    return (
        <div className="text-sm text-muted mt-1">
            Organisers are hidden — <Link href="/login" className="text-blue-600">log in</Link> to view organisers.
        </div>
    );
}
