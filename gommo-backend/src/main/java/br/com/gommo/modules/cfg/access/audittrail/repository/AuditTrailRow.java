package br.com.gommo.modules.cfg.access.audittrail.repository;

import br.com.gommo.core.audit.trail.AuditLog;

/** Evento da trilha com o usuario resolvido (login pode ter sido renomeado depois). */
public record AuditTrailRow(AuditLog log, String username, String userName) {}
