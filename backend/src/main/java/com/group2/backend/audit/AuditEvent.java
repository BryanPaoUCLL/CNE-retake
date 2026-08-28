package com.group2.backend.audit;

import java.time.Instant;
import java.util.UUID;

public record AuditEvent(
    String eventId,
    String eventType,
    String actorAccountId,
    String entityId,
    String relatedEntityId,
    Instant occurredAt
) {
    public static AuditEvent create(
        AuditEventType eventType,
        String actorAccountId,
        String entityId,
        String relatedEntityId
    ) {
        return new AuditEvent(
            UUID.randomUUID().toString(),
            eventType.name(),
            actorAccountId,
            entityId,
            relatedEntityId,
            Instant.now()
        );
    }
}
