export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    module_settings?: {
        agencies_enabled?: boolean;
        organisers_enabled?: boolean;
        artists_enabled?: boolean;
        promoters_enabled?: boolean;
        vendors_enabled?: boolean;
        venues_enabled?: boolean;
    };
    [key: string]: unknown;
};
