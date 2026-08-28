package com.group2.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProcessAuditEventFunctionTest {
    private final CapturingWriter writer = new CapturingWriter();
    private final ProcessAuditEventFunction function = new ProcessAuditEventFunction(
        new ObjectMapper().registerModule(new JavaTimeModule()),
        writer
    );

    @Test
    void parsesAndForwardsAValidEvent() {
        String message = """
            {
              "eventId": "event-1",
              "eventType": "ARTWORK_CREATED",
              "actorAccountId": "account-1",
              "entityId": "artwork-1",
              "relatedEntityId": null,
              "occurredAt": "2026-08-28T12:00:00Z"
            }
            """;

        AuditEvent event = function.parseAndValidate(message);
        writer.upsert(event);

        assertEquals("event-1", writer.event.eventId());
        assertEquals(Instant.parse("2026-08-28T12:00:00Z"), writer.event.occurredAt());
    }

    @Test
    void rejectsEventsWithoutAnId() {
        String message = """
            {
              "eventType": "ACCOUNT_CREATED",
              "entityId": "account-1",
              "occurredAt": "2026-08-28T12:00:00Z"
            }
            """;

        assertThrows(IllegalArgumentException.class, () -> function.parseAndValidate(message));
    }

    private static class CapturingWriter implements AuditTableWriter {
        private AuditEvent event;

        @Override
        public void upsert(AuditEvent event) {
            this.event = event;
        }
    }
}
