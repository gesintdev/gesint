package br.com.gommo.admin.core.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gommo-admin.security.jwt")
public record JwtProperties(String secret, long accessTokenMinutes, long refreshTokenDays) {}
