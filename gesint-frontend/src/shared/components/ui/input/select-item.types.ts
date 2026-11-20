export type SelectItem = {
    value: string;
    label: string;
    description?: string;
    /** Rótulo curto à direita da opção (ex.: "Obrigatório"). */
    badge?: string;
    /** Destaque visual da opção na lista (borda/peso). */
    emphasized?: boolean;
    disabled?: boolean;
};

export type SelectSearchResult = {
    items: SelectItem[];
    hasMore: boolean;
    page: number;
};

export type SelectSearchFn = (query: string, page: number) => Promise<SelectSearchResult>;
