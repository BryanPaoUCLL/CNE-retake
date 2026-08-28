package com.group2.backend.audit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.audit.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpAuditEventPublisher implements AuditEventPublisher {
    @Override
    public void publish(AuditEvent event) {
        // Audit delivery is intentionally disabled for this environment.
    }
}
