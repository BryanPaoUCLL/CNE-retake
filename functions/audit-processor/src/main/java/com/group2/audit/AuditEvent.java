package com.group2.audit;

import java.time.Instant;

public record AuditEvent(
    String eventId,
    String eventType,
    String actorAccountId,
    String entityId,
    String relatedEntityId,
    Instant occurredAt
) {
}
