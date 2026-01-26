import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const saved = localStorage.getItem('theme');
            return (saved === 'dark' || saved === 'light') ? saved : 'light';
        } catch {
            return 'light';
        }
    });

    useEffect(() => {
        try {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
        } catch {
            // noop in non-browser environments
        }
    }, [theme]);

    function toggle() {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
            {theme === 'dark' ? (
                <Sun className="!size-5 opacity-80" />
            ) : (
                <Moon className="!size-5 opacity-80" />
            )}
        </Button>
    );
}
