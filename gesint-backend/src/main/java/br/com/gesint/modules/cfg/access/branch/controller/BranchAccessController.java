package br.com.gesint.modules.cfg.access.branch.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.cfg.access.branch.service.IBranchAccessService;
import br.com.gesint.modules.root.security.BranchAccessResolver.BranchSummary;

/**
 * Filiais que o usuario logado pode operar. Alimenta o seletor de filial do header.
 *
 * Nao exige authority especifica porque e justamente a chamada que acontece antes de haver
 * filial ativa, e sem ela o usuario nao teria como escolher uma.
 */
@RestController
@RequestMapping("/api/v1/branches")
public class BranchAccessController {

    private final IBranchAccessService branchAccessService;

    public BranchAccessController(IBranchAccessService branchAccessService) {
        this.branchAccessService = branchAccessService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<BranchSummary>> findMyBranches(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(branchAccessService.findAccessibleBranches(userId));
    }
}
