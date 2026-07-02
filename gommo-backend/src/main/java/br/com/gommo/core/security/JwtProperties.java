package br.com.gommo.core.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gommo.security.jwt")
public record JwtProperties(String secret, long accessTokenMinutes, long refreshTokenRotationMinutes) {}
