package br.com.gesint.core.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import br.com.gesint.core.tenant.TenantResolutionFilter;
import br.com.gesint.modules.careers.candidateportal.auth.CandidatePortalSecurity;
import br.com.gesint.modules.careers.candidateportal.config.CandidatePortalProperties;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties({JwtProperties.class, CandidatePortalProperties.class})
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorrelationIdFilter correlationIdFilter;
    private final TenantResolutionFilter tenantResolutionFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CorrelationIdFilter correlationIdFilter,
            TenantResolutionFilter tenantResolutionFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.correlationIdFilter = correlationIdFilter;
        this.tenantResolutionFilter = tenantResolutionFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/session-check",
                                "/api/v1/auth/tenant",
                                "/api/v1/auth/password-setup",
                                "/api/v1/auth/password-setup/**",
                                "/api/v1/auth/forgot-password")
                        .permitAll()
                        .requestMatchers("/api/v1/public/**")
                        .permitAll()
                        .requestMatchers(CandidatePortalSecurity.API_PREFIX + "/**")
                        .hasAuthority(CandidatePortalSecurity.AUTHORITY)
                        .requestMatchers("/api/v1/internal/**")
                        .permitAll()
                        .requestMatchers("/actuator/health", "/actuator/prometheus")
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(tenantResolutionFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
