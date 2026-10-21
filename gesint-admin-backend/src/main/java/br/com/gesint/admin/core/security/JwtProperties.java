package br.com.gesint.admin.core.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gesint-admin.security.jwt")
public record JwtProperties(String secret, long accessTokenMinutes, long refreshTokenDays) {}
