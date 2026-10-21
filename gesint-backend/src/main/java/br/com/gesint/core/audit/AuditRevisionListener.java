package br.com.gesint.core.audit;

import org.hibernate.envers.RevisionListener;

public class AuditRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        CurrentAuditor.userId().ifPresent(((AuditRevision) revisionEntity)::setChangedBy);
    }
}
