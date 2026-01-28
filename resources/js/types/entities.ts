export type Organiser = { id: number; name: string; email?: string | null; active?: boolean };

export type UserShort = { id: number; name?: string | null; email?: string | null; role?: string | null; is_super_admin?: boolean };

export type Customer = { id: number; name?: string | null; email?: string | null; phone?: string | null; active?: boolean };

export type Event = {
    id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    image?: string | null;
    image_thumbnail?: string | null;
    active?: boolean;
    organisers?: Organiser[];
    user?: UserShort | null;
    start_at?: string | null;
    end_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type PaginationLink = { label?: string | null; url?: string | null; active?: boolean };

export type Pagination<T> = { data: T[]; links?: PaginationLink[] };

export type LooseObject = Record<string, unknown>;
