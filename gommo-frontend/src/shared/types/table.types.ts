export enum TableDataType {
    /** Texto livre (alias legado de STRING). */
    TEXT = "TEXT",
    STRING = "STRING",
    INTEGER = "INTEGER",
    DECIMAL = "DECIMAL",
    /** Alias legado de DECIMAL. */
    FLOAT = "FLOAT",
    MONEY = "MONEY",
    /** Alias legado de MONEY. */
    CURRENCY = "CURRENCY",
    PERCENT = "PERCENT",
    UUID = "UUID",
    CPF = "CPF",
    CNPJ = "CNPJ",
    CEP = "CEP",
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    DATE = "DATE",
    DATETIME = "DATETIME",
    BOOLEAN = "BOOLEAN",
    /** Lista fechada de opções (filtro SELECT com options do servidor). */
    SELECT = "SELECT",
    /** Badge visual; filtro usa SELECT com options do servidor. */
    BADGE = "BADGE",
    /** Avatar + nome (estilo DaisyUI) */
    AVATAR_PROFILE = "AVATAR_PROFILE",
    /** Swatch de cor (#RRGGBB). */
    COLOR = "COLOR",
}

export type TableColumnConfig = {
    /** Identificador único da coluna */
    id: string;
    /** Título exibido no cabeçalho */
    columnName: string;
    /** Caminho do campo no objeto (suporta dot notation — ex.: `address.city`) */
    fieldValue: string;
    /** Tipo de valor: máscara da célula e input do filtro. */
    dataType?: TableDataType;
    align?: "left" | "center" | "right";
    /** Classes Tailwind extras na célula (ex.: `hidden md:table-cell`) */
    className?: string;
    /** Classes Tailwind extras no `<th>` */
    headerClassName?: string;
    /** Campo UUID do storage para avatar (AVATAR_PROFILE) */
    avatarImageField?: string;
    /** Subtítulo abaixo do nome (AVATAR_PROFILE) */
    avatarSubtitleField?: string;
    /** Campo com tags exibidas ao lado do nome (AVATAR_PROFILE). */
    avatarTagsField?: string;
    /** Rótulos customizados para tags de perfil. */
    avatarTagLabels?: Record<string, string>;
    /** Classes customizadas para tags de perfil. */
    avatarTagClassNames?: Record<string, string>;
    /** Tamanho do avatar; listas mais densas podem usar `sm`. */
    avatarSize?: "sm" | "md" | "lg";
    /** Rótulos customizados para células BADGE (sobrescreve o mapa global) */
    badgeLabels?: Record<string, string>;
    /**
     * Quando true, a coluna não exibe filtro.
     * Por padrão todas as colunas são filtráveis.
     */
    notFilterable?: boolean;
};

/** Coluna filtrável por padrão, salvo `notFilterable`. */
export function isColumnFilterable(column: TableColumnConfig): boolean {
    return !column.notFilterable;
}

/** Tipos que usam lista fechada de opções vindas do servidor (`filterOptions`). */
export function isSelectFilterDataType(dataType?: TableDataType): boolean {
    return dataType === TableDataType.SELECT || dataType === TableDataType.BADGE || dataType === TableDataType.BOOLEAN;
}
