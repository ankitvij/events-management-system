import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type ModuleSettings = {
    agencies_enabled: boolean;
    organisers_enabled: boolean;
    artists_enabled: boolean;
    promoters_enabled: boolean;
    vendors_enabled: boolean;
    venues_enabled: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Module settings',
        href: '/settings/modules',
    },
];

const moduleFields: Array<{ key: keyof ModuleSettings; label: string; description: string }> = [
    {
        key: 'agencies_enabled',
        label: 'Agencies',
        description: 'Enable agency listing and management pages.',
    },
    {
        key: 'organisers_enabled',
        label: 'Organisers',
        description: 'Enable organiser pages, signup, and organiser access routes.',
    },
    {
        key: 'artists_enabled',
        label: 'Artists',
        description: 'Enable artist directory, signup, and artist portal routes.',
    },
    {
        key: 'promoters_enabled',
        label: 'Promoters',
        description: 'Enable promoter listing and signup pages.',
    },
    {
        key: 'vendors_enabled',
        label: 'Vendors',
        description: 'Enable vendor directory, signup, and vendor portal routes.',
    },
    {
        key: 'venues_enabled',
        label: 'Venues',
        description: 'Enable venue listing and management pages.',
    },
];

export default function ModulesSettings() {
    const page = usePage<SharedData & { module_settings: ModuleSettings }>();
    const settings = page.props.module_settings;
    const flashSuccess = (page.props as any)?.flash?.success as string | undefined;

    const form = useForm<ModuleSettings>({
        agencies_enabled: settings?.agencies_enabled ?? true,
        organisers_enabled: settings?.organisers_enabled ?? true,
        artists_enabled: settings?.artists_enabled ?? true,
        promoters_enabled: settings?.promoters_enabled ?? true,
        vendors_enabled: settings?.vendors_enabled ?? true,
        venues_enabled: settings?.venues_enabled ?? true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/settings/modules');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Module controls"
                        description="Turn modules on or off globally for non-superadmin users."
                    />

                    {flashSuccess && (
                        <div className="rounded-md bg-green-600 p-3 text-sm text-white">
                            {flashSuccess}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {moduleFields.map((field) => (
                            <div
                                key={field.key}
                                className="flex items-center justify-between rounded-lg border border-border p-4"
                            >
                                <div className="pr-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        {field.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {field.description}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => form.setData(field.key, !form.data[field.key])}
                                    className={`rounded-md px-3 py-1 text-xs font-semibold text-white ${form.data[field.key] ? 'bg-green-600' : 'bg-zinc-600'}`}
                                >
                                    {form.data[field.key] ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                        ))}

                        <div className="pt-2">
                            <Button type="submit" disabled={form.processing}>
                                Save module settings
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
