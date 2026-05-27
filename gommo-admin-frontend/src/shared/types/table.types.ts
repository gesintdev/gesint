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
};
