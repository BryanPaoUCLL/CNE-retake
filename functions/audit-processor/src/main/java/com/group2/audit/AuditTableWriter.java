package com.group2.audit;

public interface AuditTableWriter {
    void upsert(AuditEvent event);
}
