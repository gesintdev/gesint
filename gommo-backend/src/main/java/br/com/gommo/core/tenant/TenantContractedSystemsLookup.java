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
}
