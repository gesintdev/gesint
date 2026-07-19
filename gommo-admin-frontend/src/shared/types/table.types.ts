import { DataType } from "@/shared/types/data-type";

/** @deprecated Preferir {@link DataType}. Mantido para compatibilidade com DataTable. */
export { DataType as TableDataType };

export type TableColumnConfig = {
    /** Identificador único da coluna */
    id: string;
    /** Título exibido no cabeçalho */
    columnName: string;
    /** Caminho do campo no objeto (suporta dot notation — ex.: `address.city`) */
    fieldValue: string;
    dataType?: DataType;
    align?: "left" | "center" | "right";
    /** Classes Tailwind extras na célula (ex.: `hidden md:table-cell`) */
    className?: string;
    /** Classes Tailwind extras no `<th>` */
    headerClassName?: string;
};
