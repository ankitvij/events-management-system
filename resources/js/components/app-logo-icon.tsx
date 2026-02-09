import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = ImgHTMLAttributes<HTMLImageElement>;

export default function AppLogoIcon({ className, alt, ...props }: Props) {
    return (
        <img
            src="/images/logo.png"
            alt={alt ?? 'Events logo'}
            className={cn('h-8 w-auto', className)}
            loading="lazy"
            {...props}
        />
    );
}
