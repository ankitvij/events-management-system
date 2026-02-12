import type { ImgHTMLAttributes } from 'react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Props = ImgHTMLAttributes<HTMLImageElement>;
type SharedProps = {
    brand?: {
        logo_url?: string;
        logo_alt?: string;
    };
};

export default function AppLogoIcon({ className, alt, ...props }: Props) {
    const page = usePage<SharedProps>();
    const logoSrc = page.props.brand?.logo_url ?? '/images/logo.png';
    const logoAlt = page.props.brand?.logo_alt ?? 'Events logo';

    return (
        <img
            src={logoSrc}
            alt={alt ?? logoAlt}
            className={cn('h-8 w-auto', className)}
            loading="lazy"
            {...props}
        />
    );
}
