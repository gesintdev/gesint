package br.com.gommo.modules.cfg.access.branch.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.branch.BranchUnscoped;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.security.BranchAccessResolver;
import br.com.gommo.modules.root.security.BranchAccessResolver.BranchSummary;

@Service
public class BranchAccessService implements IBranchAccessService {

    private final AppUserRepository appUserRepository;
    private final BranchAccessResolver branchAccessResolver;

    public BranchAccessService(AppUserRepository appUserRepository, BranchAccessResolver branchAccessResolver) {
        this.appUserRepository = appUserRepository;
        this.branchAccessResolver = branchAccessResolver;
    }

    /** Descobrir as filiais disponiveis e, por definicao, uma leitura que atravessa filiais. */
    @Override
    @BranchUnscoped
    @Transactional(readOnly = true)
    public List<BranchSummary> findAccessibleBranches(UUID userId) {
        AppUser user = appUserRepository
                .findByIdAndStatusNot(userId, StatusEnum.DELETED)
                .orElse(null);
        if (user == null) {
            return List.of();
        }
        return branchAccessResolver.resolve(user).branches();
    }
}
