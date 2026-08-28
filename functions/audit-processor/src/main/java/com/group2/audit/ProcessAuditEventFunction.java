package com.group2.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.QueueTrigger;

public class ProcessAuditEventFunction {
    private final ObjectMapper objectMapper;
    private final AuditTableWriter tableWriter;

    public ProcessAuditEventFunction() {
        this(new ObjectMapper().registerModule(new JavaTimeModule()), new AzureTableAuditWriter());
    }

    ProcessAuditEventFunction(ObjectMapper objectMapper, AuditTableWriter tableWriter) {
        this.objectMapper = objectMapper;
        this.tableWriter = tableWriter;
    }

    @FunctionName("ProcessAuditEvent")
    public void run(
        @QueueTrigger(
            name = "message",
            queueName = "%AUDIT_QUEUE_NAME%",
            connection = "AzureWebJobsStorage"
        ) String message,
        ExecutionContext context
    ) {
        AuditEvent event = parseAndValidate(message);
        tableWriter.upsert(event);
        context.getLogger().info(
            "Stored audit event type=" + event.eventType() + " eventId=" + event.eventId()
        );
    }

    AuditEvent parseAndValidate(String message) {
        try {
            AuditEvent event = objectMapper.readValue(message, AuditEvent.class);
            requireValue(event.eventId(), "eventId");
            requireValue(event.eventType(), "eventType");
            requireValue(event.entityId(), "entityId");
            if (event.occurredAt() == null) {
                throw new IllegalArgumentException("occurredAt is required");
            }
            return event;
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Audit queue message is not valid JSON", exception);
        }
    }

    private static void requireValue(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(name + " is required");
        }
    }
}
