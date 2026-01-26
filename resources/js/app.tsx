import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');

        const variants = [
            `./pages/${name}.tsx`,
            `./pages/${name.replaceAll('.', '/')}.tsx`,
            `./pages/${name.replaceAll('\\\\', '/')}.tsx`,
        ];

        const allKeys = Object.keys(pages);

        // 1) exact match
        let key = allKeys.find(k => variants.includes(k));

        // 2) case-insensitive exact
        if (!key) {
            const lowers = variants.map(v => v.toLowerCase());
            key = allKeys.find(k => lowers.includes(k.toLowerCase()));
        }

        // 3) endsWith match (handles ./pages/Users/Index.tsx vs different root)
        if (!key) {
            const suffix = `/${name}.tsx`.toLowerCase();
            key = allKeys.find(k => k.toLowerCase().endsWith(suffix));
        }

        // 4) dot->slash endsWith
        if (!key && name.includes('.')) {
            const alt = `/${name.replaceAll('.', '/')}.tsx`.toLowerCase();
            key = allKeys.find(k => k.toLowerCase().endsWith(alt));
        }

        return resolvePageComponent(key || `./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
