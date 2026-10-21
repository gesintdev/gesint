package br.com.gesint.modules.cfg.access.branch.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.root.security.BranchAccessResolver.BranchSummary;

public interface IBranchAccessService {

    List<BranchSummary> findAccessibleBranches(UUID userId);
}
