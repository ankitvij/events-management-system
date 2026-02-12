export type Organiser = {
    id: number;
    name: string;
    email?: string | null;
    active?: boolean;
    bank_account_name?: string | null;
    bank_iban?: string | null;
    bank_bic?: string | null;
    bank_reference_hint?: string | null;
    paypal_id?: string | null;
    revolut_id?: string | null;
};

export type UserShort = { id: number; name?: string | null; email?: string | null; role?: string | null; is_super_admin?: boolean };

export type Customer = { id: number; name?: string | null; email?: string | null; phone?: string | null; active?: boolean };

export type Promoter = { id: number; name?: string | null; email?: string | null; active?: boolean };

export type Artist = {
    id: number;
    name: string;
    email: string;
    city: string;
    experience_years: number;
    skills: string;
    description?: string | null;
    equipment?: string | null;
    photo?: string | null;
    photo_url?: string | null;
    active?: boolean;
    email_verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type Vendor = {
    id: number;
    name: string;
    email: string;
    type: string;
    city?: string | null;
    description?: string | null;
    active?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
};

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
    organiser_id?: number | null;
    organiser?: Organiser | null;
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
