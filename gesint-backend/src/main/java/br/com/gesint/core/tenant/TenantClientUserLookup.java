package br.com.gesint.core.tenant;

import java.util.UUID;

public interface TenantClientUserLookup {

    boolean isRegisteredClientUsername(String username);

    boolean isLinkedToClient(UUID clientId, UUID appUserId);
}
