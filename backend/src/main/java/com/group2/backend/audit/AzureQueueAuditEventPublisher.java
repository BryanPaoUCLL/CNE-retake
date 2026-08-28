package com.group2.backend.audit;

import com.azure.storage.queue.QueueClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.azure.storage.queue.QueueMessageEncoding;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.audit.enabled", havingValue = "true")
public class AzureQueueAuditEventPublisher implements AuditEventPublisher {
    private static final Logger LOGGER = LoggerFactory.getLogger(AzureQueueAuditEventPublisher.class);

    private final ObjectMapper objectMapper;
    private final QueueClient queueClient;

    @Autowired
    public AzureQueueAuditEventPublisher(
        ObjectMapper objectMapper,
        @Value("${app.blob.connection-string}") String connectionString,
        @Value("${app.audit.queue-name}") String queueName
    ) {
        this(
            objectMapper,
            new QueueClientBuilder()
                .connectionString(connectionString)
                .queueName(queueName)
                .messageEncoding(QueueMessageEncoding.BASE64)
                .buildClient()
        );
        try {
            this.queueClient.createIfNotExists();
        } catch (RuntimeException exception) {
            LOGGER.warn("Could not ensure that the audit queue exists during startup", exception);
        }
    }

    AzureQueueAuditEventPublisher(ObjectMapper objectMapper, QueueClient queueClient) {
        this.objectMapper = objectMapper;
        this.queueClient = queueClient;
    }

    @Override
    public void publish(AuditEvent event) {
        try {
            queueClient.sendMessage(objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException | RuntimeException exception) {
            // Audit is secondary: an unavailable queue must never break the user's request.
            LOGGER.warn(
                "Could not enqueue audit event type={} eventId={}",
                event.eventType(),
                event.eventId(),
                exception
            );
        }
    }
}
