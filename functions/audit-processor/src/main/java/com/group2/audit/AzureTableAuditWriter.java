package com.group2.audit;

import com.azure.data.tables.TableClient;
import com.azure.data.tables.TableServiceClient;
import com.azure.data.tables.TableServiceClientBuilder;
import com.azure.data.tables.models.TableEntity;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class AzureTableAuditWriter implements AuditTableWriter {
    private final TableClient tableClient;

    public AzureTableAuditWriter() {
        this(buildTableClient());
    }

    AzureTableAuditWriter(TableClient tableClient) {
        this.tableClient = tableClient;
    }

    private static TableClient buildTableClient() {
        String connectionString = requiredSetting("AzureWebJobsStorage");
        String tableName = settingOrDefault("AUDIT_TABLE_NAME", "auditEvents");

        TableServiceClient serviceClient = new TableServiceClientBuilder()
            .connectionString(connectionString)
            .buildClient();
        serviceClient.createTableIfNotExists(tableName);
        return serviceClient.getTableClient(tableName);
    }

    @Override
    public void upsert(AuditEvent event) {
        TableEntity entity = new TableEntity(event.eventType(), event.eventId())
            .addProperty("ActorAccountId", event.actorAccountId())
            .addProperty("EntityId", event.entityId())
            .addProperty(
                "OccurredAt",
                OffsetDateTime.ofInstant(event.occurredAt(), ZoneOffset.UTC)
            );

        if (event.relatedEntityId() != null && !event.relatedEntityId().isBlank()) {
            entity.addProperty("RelatedEntityId", event.relatedEntityId());
        }

        tableClient.upsertEntity(entity);
    }

    private static String requiredSetting(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required");
        }
        return value;
    }

    private static String settingOrDefault(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
