package br.com.gommo.core.branch;

import java.util.UUID;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Aplica o filtro de filial na sessao do Hibernate antes de cada acesso a repositorio.
 *
 * Sem isso, cada consulta precisaria repetir {@code AND company_id = ?} manualmente, e um unico
 * esquecimento vazaria dados de outra filial. Como o filtro vive na sessao e o projeto roda com
 * {@code open-in-view: false}, ele e reaplicado a cada chamada, dentro da transacao corrente.
 *
 * SQL nativo nao passa pelo filtro do Hibernate e continua exigindo escopo explicito.
 */
@Aspect
@Component
public class BranchScopeAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("execution(* br.com.gommo.modules..repository..*(..))")
    public Object applyBranchScope(ProceedingJoinPoint joinPoint) throws Throwable {
        applyToCurrentSession();
        return joinPoint.proceed();
    }

    @Around("@annotation(br.com.gommo.core.branch.BranchUnscoped)")
    public Object runUnscoped(ProceedingJoinPoint joinPoint) throws Throwable {
        BranchContextHolder.BranchContext previous = BranchContextHolder.current();
        BranchContextHolder.set(new BranchContextHolder.BranchContext(
                previous == null ? null : previous.branchId(), true));
        try {
            return joinPoint.proceed();
        } finally {
            if (previous == null) {
                BranchContextHolder.clear();
            } else {
                BranchContextHolder.set(previous);
            }
        }
    }

    private void applyToCurrentSession() {
        Session session = currentSession();
        if (session == null) {
            return;
        }
        if (BranchContextHolder.isUnscoped()) {
            if (session.getEnabledFilter(BranchScopedEntity.FILTER_NAME) != null) {
                session.disableFilter(BranchScopedEntity.FILTER_NAME);
            }
            return;
        }
        UUID branchId = BranchContextHolder.require();
        session.enableFilter(BranchScopedEntity.FILTER_NAME)
                .setParameter(BranchScopedEntity.FILTER_PARAM, branchId);
    }

    /** Fora de transacao nao ha sessao para filtrar; nesse caso nao ha consulta a escapar. */
    private Session currentSession() {
        try {
            return entityManager.unwrap(Session.class);
        } catch (IllegalStateException ex) {
            return null;
        }
    }
}
