export type Organiser = {
    id: number;
    name: string;
    email?: string | null;
    active?: boolean;
    bank_account_name?: string | null;
    bank_iban?: string | null;
    bank_bic?: string | null;
    bank_reference_hint?: string | null;
    bank_instructions?: string | null;
};

export type UserShort = { id: number; name?: string | null; email?: string | null; role?: string | null; is_super_admin?: boolean };

export type Customer = { id: number; name?: string | null; email?: string | null; phone?: string | null; active?: boolean };

export type Event = {
    id: number;
    slug?: string | null;
    title: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
    image?: string | null;
    image_thumbnail?: string | null;
    image_url?: string | null;
    image_thumbnail_url?: string | null;
    active?: boolean;
    organisers?: Organiser[];
    user?: UserShort | null;
    start_at?: string | null;
    end_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    min_ticket_price?: string | number | null;
    max_ticket_price?: string | number | null;
};

export type PaginationLink = { label?: string | null; url?: string | null; active?: boolean };

export type Pagination<T> = { data: T[]; links?: PaginationLink[] };

export type LooseObject = Record<string, unknown>;
