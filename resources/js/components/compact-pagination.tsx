import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type PaginationLink = {
    label?: string | null;
    url?: string | null;
    active?: boolean;
};

type RenderItem =
    | { type: 'link'; link: PaginationLink }
    | { type: 'ellipsis'; key: string };

type Props = {
    links?: PaginationLink[];
    className?: string;
};

function normalizeLabel(label: string): string {
    let value = label;
    value = value.replace(/Previous/gi, '‹').replace(/Next/gi, '›');
    value = value.replace(/&laquo;|«|&lsaquo;|‹/g, '‹').replace(/&raquo;|»|&rsaquo;|›/g, '›');
    value = value.replace(/\s*‹\s*‹\s*/g, '‹').replace(/\s*›\s*›\s*/g, '›');
    value = value.replace(/‹+/g, '‹').replace(/›+/g, '›');

    return value;
}

function toPlainText(label?: string | null): string {
    if (!label) {
        return '';
    }

    return label
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

function parsePage(label?: string | null): number | null {
    const text = toPlainText(label);
    if (!/^\d+$/.test(text)) {
        return null;
    }

    const page = Number.parseInt(text, 10);
    return Number.isFinite(page) ? page : null;
}

function compactMiddleLinks(middleLinks: PaginationLink[]): RenderItem[] {
    const numericLinks = middleLinks
        .map((link) => ({ link, page: parsePage(link.label) }))
        .filter((item): item is { link: PaginationLink; page: number } => item.page !== null)
        .sort((a, b) => a.page - b.page);

    if (numericLinks.length <= 7) {
        return middleLinks.map((link) => ({ type: 'link', link }));
    }

    const pageToLink = new Map<number, PaginationLink>();
    numericLinks.forEach((item) => {
        pageToLink.set(item.page, item.link);
    });

    const firstPage = numericLinks[0]?.page ?? 1;
    const lastPage = numericLinks[numericLinks.length - 1]?.page ?? firstPage;
    const activePage =
        numericLinks.find((item) => item.link.active)?.page ??
        numericLinks.find((item) => item.page === firstPage)?.page ??
        firstPage;

    const selectedPages = new Set<number>([
        firstPage,
        lastPage,
        activePage - 1,
        activePage,
        activePage + 1,
    ]);

    const orderedPages = Array.from(selectedPages)
        .filter((page) => page >= firstPage && page <= lastPage)
        .sort((a, b) => a - b);

    const items: RenderItem[] = [];

    orderedPages.forEach((page, index) => {
        const link = pageToLink.get(page);
        if (!link) {
            return;
        }

        if (index > 0) {
            const previousPage = orderedPages[index - 1] ?? page;
            if (page - previousPage > 1) {
                items.push({ type: 'ellipsis', key: `ellipsis-${previousPage}-${page}` });
            }
        }

        items.push({ type: 'link', link });
    });

    return items;
}

export default function CompactPagination({ links = [], className }: Props) {
    if (!links.length) {
        return null;
    }

    const prev = links[0];
    const next = links[links.length - 1];
    const middle = links.slice(1, -1);
    const middleItems = compactMiddleLinks(middle);

    return (
        <nav className={cn('flex flex-wrap items-center gap-2 pagination', className)}>
            {[prev ? { type: 'link', link: prev } as RenderItem : null, ...middleItems, next ? { type: 'link', link: next } as RenderItem : null]
                .filter((item): item is RenderItem => item !== null)
                .map((item, index) => {
                    if (item.type === 'ellipsis') {
                        return (
                            <span key={item.key} className="btn-ghost opacity-60 cursor-default" aria-hidden="true">
                                …
                            </span>
                        );
                    }

                    const normalizedLabel = normalizeLabel(item.link.label ?? '');
                    const key = `${toPlainText(item.link.label)}-${item.link.url ?? index}`;

                    if (item.link.url) {
                        return (
                            <Link key={key} href={item.link.url} className={item.link.active ? 'btn-primary' : 'btn-ghost'}>
                                <span dangerouslySetInnerHTML={{ __html: normalizedLabel }} />
                            </Link>
                        );
                    }

                    return (
                        <span key={key} className="btn-ghost opacity-60 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: normalizedLabel }} />
                    );
                })}
        </nav>
    );
}
