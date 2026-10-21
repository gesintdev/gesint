package br.com.gesint.core.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gesint.security.jwt")
public record JwtProperties(String secret, long accessTokenMinutes, long refreshTokenRotationMinutes) {}
