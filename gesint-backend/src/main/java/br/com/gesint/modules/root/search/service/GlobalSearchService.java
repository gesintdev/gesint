package br.com.gesint.modules.root.search.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.modules.root.search.dto.GlobalSearchGroupDto;
import br.com.gesint.modules.root.search.dto.GlobalSearchItemDto;
import br.com.gesint.modules.root.search.dto.GlobalSearchResponseDto;

@Service
public class GlobalSearchService implements IGlobalSearchService {

    public static final int DEFAULT_LIMIT_PER_TYPE = 5;
    public static final int MIN_QUERY_LENGTH = 2;
    public static final int MAX_LIMIT_PER_TYPE = 20;

    private final List<GlobalSearchProvider> providers;

    public GlobalSearchService(List<GlobalSearchProvider> providers) {
        this.providers = providers;
    }

    @Override
    @Transactional(readOnly = true)
    public GlobalSearchResponseDto search(String query, int limitPerType) {
        String normalized = query == null ? "" : query.trim();
        int limit = Math.clamp(limitPerType, 1, MAX_LIMIT_PER_TYPE);
        if (normalized.length() < MIN_QUERY_LENGTH) {
            return GlobalSearchResponseDto.builder().query(normalized).groups(List.of()).build();
        }

        List<GlobalSearchGroupDto> groups = new ArrayList<>();
        for (GlobalSearchProvider provider : providers) {
            if (!hasAuthority(provider.requiredAuthority())) {
                continue;
            }
            List<GlobalSearchItemDto> items = provider.search(normalized, limit);
            if (items.isEmpty()) {
                continue;
            }
            groups.add(GlobalSearchGroupDto.builder()
                    .type(provider.getType().name())
                    .label(provider.getLabel())
                    .items(items)
                    .build());
        }
        return GlobalSearchResponseDto.builder().query(normalized).groups(groups).build();
    }

    private static boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authority == null || authority.isBlank()) {
            return false;
        }
        return AuthorityWildcards.allows(authentication.getAuthorities(), authority);
    }
}
