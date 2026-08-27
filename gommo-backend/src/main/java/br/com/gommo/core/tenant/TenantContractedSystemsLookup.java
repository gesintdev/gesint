package br.com.gommo.core.tenant;

import java.util.List;
import java.util.UUID;

public interface TenantContractedSystemsLookup {

    /**
     * Keys do catalogo ({@code product_system.key}) com contrato operacional ACTIVE
     * para o cliente. Lista vazia se nao houver contratos; falha de leitura tambem
     * devolve lista vazia.
     */
    List<String> findActiveKeysByClientId(UUID clientId);

    /**
     * Mesmas keys, mas separadas por onde valem. Contrato em modo ALL nao tem associacao de filial
     * e por isso vale em qualquer uma, inclusive nas cadastradas depois.
     */
    ContractedSystemScope findActiveKeyScope(UUID clientId);

    /**
     * @param allBranchesKeys keys validas em qualquer filial
     * @param keysByCompanyId keys extras de cada filial, pela {@code company.id} do schema do
     *     tenant; a matriz entra pelo {@code tenant_company_id} do proprio cliente
     */
    record ContractedSystemScope(List<String> allBranchesKeys, java.util.Map<UUID, List<String>> keysByCompanyId) {

        public static ContractedSystemScope empty() {
            return new ContractedSystemScope(List.of(), java.util.Map.of());
        }

        /** Keys efetivas numa filial. Sem filial resolvida, sobra o que vale em qualquer uma. */
        public List<String> keysFor(UUID companyId) {
            if (companyId == null) {
                return allBranchesKeys;
            }
            List<String> extra = keysByCompanyId.get(companyId);
            if (extra == null || extra.isEmpty()) {
                return allBranchesKeys;
            }
            return java.util.stream.Stream.concat(allBranchesKeys.stream(), extra.stream())
                    .distinct()
                    .sorted()
                    .toList();
        }
    }
}
