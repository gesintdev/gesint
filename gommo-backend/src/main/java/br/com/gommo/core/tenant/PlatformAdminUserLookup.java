package br.com.gommo.core.tenant;

import java.util.UUID;

public interface PlatformAdminUserLookup {

    boolean isPlatformAdmin(String username);

    boolean isPlatformAdminAppUser(UUID appUserId);
}
