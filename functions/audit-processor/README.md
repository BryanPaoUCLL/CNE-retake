# Audit event processor

This Java 21 Azure Function consumes `audit-events` from Azure Queue Storage and upserts each event into the `auditEvents` Azure Table. The same storage account can host the artwork blobs, queue, and table.

Queue delivery is at least once. The backend gives every event a UUID and the Function uses `eventType` as the Table `PartitionKey` and `eventId` as the `RowKey`, so retrying the same message overwrites the same row instead of creating a duplicate. After five failed deliveries, the Functions queue extension moves a message to `audit-events-poison`.

To test and package it:

```powershell
mvn test package
```

For local execution, copy `local.settings.example.json` to the ignored `local.settings.json`, run Azurite, and use Azure Functions Core Tools:

```powershell
mvn azure-functions:run
```

Production application settings:

- `AzureWebJobsStorage`: the storage connection string, stored as a Function App setting
- `AUDIT_QUEUE_NAME`: `audit-events`
- `AUDIT_TABLE_NAME`: `auditEvents`
