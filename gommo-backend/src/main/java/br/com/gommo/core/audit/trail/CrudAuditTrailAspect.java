package br.com.gommo.core.audit.trail;

import java.util.UUID;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.core.GenericTypeResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import br.com.gommo.core.base.service.BaseService;

/**
 * Grava na trilha as acoes de CRUD ({@link AuditActionEnum#CREATE} ... {@link AuditActionEnum#DEACTIVATE})
 * de todo servico que estende {@link BaseService}, inclusive os que sobrescrevem os metodos.
 *
 * A chamada roda dentro de uma transacao REQUIRED junto com o registro: evento e operacao
 * confirmam ou desfazem juntos, qualquer que seja a ordem entre este aspecto e o
 * {@code @Transactional} do servico.
 *
 * Servicos de CRUD que nao estendem BaseService registram explicitamente via
 * {@link AuditTrailRecorder}.
 */
@Aspect
@Component
public class CrudAuditTrailAspect {

    private final AuditTrailRecorder recorder;
    private final TransactionTemplate transactionTemplate;

    public CrudAuditTrailAspect(AuditTrailRecorder recorder, PlatformTransactionManager transactionManager) {
        this.recorder = recorder;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Around("target(br.com.gommo.core.base.service.BaseService) && ("
            + "execution(* br.com.gommo.core.base.service.IBaseService+.create(..))"
            + " || execution(* br.com.gommo.core.base.service.IBaseService+.update(..))"
            + " || execution(* br.com.gommo.core.base.service.IBaseService+.delete(..))"
            + " || execution(* br.com.gommo.core.base.service.IBaseService+.activate(..))"
            + " || execution(* br.com.gommo.core.base.service.IBaseService+.deactivate(..)))")
    public Object recordCrud(ProceedingJoinPoint joinPoint) throws Throwable {
        AuditActionEnum action = AuditActionEnum.fromCrudMethod(joinPoint.getSignature().getName());
        Class<?> entityType = entityTypeOf(AopUtils.getTargetClass(joinPoint.getTarget()));
        if (action == null || entityType == null) {
            return joinPoint.proceed();
        }
        try {
            return transactionTemplate.execute(status -> {
                Object result = proceedUnchecked(joinPoint);
                UUID entityId = resolveEntityId(action, joinPoint.getArgs(), result);
                if (entityId != null) {
                    recorder.record(AuditTrailEntry.of(action, entityType, entityId));
                }
                return result;
            });
        } catch (CheckedInvocationException ex) {
            throw ex.getCause();
        }
    }

    private static Object proceedUnchecked(ProceedingJoinPoint joinPoint) {
        try {
            return joinPoint.proceed();
        } catch (RuntimeException | Error ex) {
            throw ex;
        } catch (Throwable ex) {
            throw new CheckedInvocationException(ex);
        }
    }

    static Class<?> entityTypeOf(Class<?> targetClass) {
        Class<?>[] generics = GenericTypeResolver.resolveTypeArguments(targetClass, BaseService.class);
        return generics == null ? null : generics[0];
    }

    private static UUID resolveEntityId(AuditActionEnum action, Object[] args, Object result) {
        if (action != AuditActionEnum.CREATE) {
            return args.length > 0 && args[0] instanceof UUID id ? id : null;
        }
        if (result == null) {
            return null;
        }
        BeanWrapperImpl wrapper = new BeanWrapperImpl(result);
        if (!wrapper.isReadableProperty("id")) {
            return null;
        }
        return wrapper.getPropertyValue("id") instanceof UUID id ? id : null;
    }

    private static final class CheckedInvocationException extends RuntimeException {
        CheckedInvocationException(Throwable cause) {
            super(cause);
        }
    }
}
