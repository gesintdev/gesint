export enum TableDataType {
    TEXT = "TEXT",
    UUID = "UUID",
    CPF = "CPF",
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    DATE = "DATE",
    DATETIME = "DATETIME",
    FLOAT = "FLOAT",
    CURRENCY = "CURRENCY",
    PERCENT = "PERCENT",
    BADGE = "BADGE",
    BOOLEAN = "BOOLEAN",
    /** Avatar + nome (estilo DaisyUI) */
    AVATAR_PROFILE = "AVATAR_PROFILE",
}

export type TableColumnConfig = {
    /** Identificador único da coluna */
    id: string;
    /** Título exibido no cabeçalho */
    columnName: string;
    /** Caminho do campo no objeto (suporta dot notation — ex.: `address.city`) */
    fieldValue: string;
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
    /** Rótulos customizados para células BADGE (sobrescreve o mapa global) */
    badgeLabels?: Record<string, string>;
};
