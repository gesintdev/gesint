export type GlobalSearchItem = {
    id: string;
    title: string;
    subtitle?: string | null;
    href: string;
};

export type GlobalSearchGroup = {
    type: string;
    label: string;
    items: GlobalSearchItem[];
};

export type GlobalSearchResponse = {
    query: string;
    groups: GlobalSearchGroup[];
};
