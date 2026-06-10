package br.com.gommo.core.tenant;

public interface TenantClientUserLookup {

    boolean isRegisteredClientUsername(String username);
}
