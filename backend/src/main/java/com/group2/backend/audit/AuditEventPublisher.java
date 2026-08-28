package com.group2.backend.audit;

public interface AuditEventPublisher {
    void publish(AuditEvent event);
}
