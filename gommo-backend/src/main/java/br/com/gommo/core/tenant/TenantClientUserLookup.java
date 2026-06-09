package br.com.gommo.core.tenant;

import java.util.UUID;

public interface TenantClientUserLookup {

    boolean belongsToTenant(UUID appUserId, UUID clientId);

    boolean isBoundToAnyClient(UUID appUserId);
}
