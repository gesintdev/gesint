/**
 * Padrão global de dados
 *
 * 1) Server (await no RSC):
 *    <DataRequest request={fetchFn}>{(data) => <View data={data} />}</DataRequest>
 *
 * 2) Server + use() (streaming):
 *    <Suspense fallback={<Skeleton />}>
 *      <PersonAsyncSection promise={fetchFn()} />
 *    </Suspense>
 *
 * 3) Client + React Query (lista):
 *    <QueryTablePanel queryKey={keys} request={fetchFn} columns={cols} onRowActivate={...} />
 *    ou <QueryPanel>{({ data }) => <DataTable data={data} onRowActivate={...} />}</QueryPanel>
 */
export { DataRequest } from "@/shared/components/data/DataRequest";
export { AsyncResult, useAsyncData } from "@/shared/components/data/DataResult";
export {
    QueryPagedTablePanel,
    type QueryPagedTablePanelProps,
    QueryPanel,
    type QueryPanelRenderProps,
    QueryTablePanel,
    type QueryTablePanelProps,
    type QueryTablePanelTableProps,
} from "@/shared/components/data/QueryPanel";
