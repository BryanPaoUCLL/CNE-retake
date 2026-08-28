package com.group2.backend.audit;

import com.azure.storage.queue.QueueClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AzureQueueAuditEventPublisherTest {
    private static final String AZURITE_CONNECTION_STRING =
        "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;" +
        "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/" +
        "K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;";

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final QueueClient queueClient = mock(QueueClient.class);
    private final AzureQueueAuditEventPublisher publisher =
        new AzureQueueAuditEventPublisher(objectMapper, queueClient);

    @Test
    void publishesJsonToTheQueue() {
        AuditEvent event = AuditEvent.create(
            AuditEventType.ARTWORK_CREATED,
            "account-1",
            "artwork-1",
            null
        );

        publisher.publish(event);

        verify(queueClient).sendMessage(contains("\"eventType\":\"ARTWORK_CREATED\""));
    }

    @Test
    void queueFailureDoesNotFailTheUserRequest() {
        doThrow(new RuntimeException("queue unavailable"))
            .when(queueClient)
            .sendMessage(org.mockito.ArgumentMatchers.anyString());

        assertDoesNotThrow(() -> publisher.publish(AuditEvent.create(
            AuditEventType.PURCHASE_CREATED,
            "account-1",
            "purchase-1",
            "artwork-1"
        )));
    }

    @Test
    void blobAndQueueSdkVersionsAreBinaryCompatible() {
        assertDoesNotThrow(() -> new QueueClientBuilder()
            .connectionString(AZURITE_CONNECTION_STRING)
            .queueName("audit-events")
            .buildClient());
    }
}
