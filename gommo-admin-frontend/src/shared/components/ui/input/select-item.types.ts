export type SelectItem = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectSearchResult = {
  items: SelectItem[];
  hasMore: boolean;
  page: number;
};

export type SelectSearchFn = (query: string, page: number) => Promise<SelectSearchResult>;
