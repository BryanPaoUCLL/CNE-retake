
# Resource Group maken
Azure Portal → **Resource Groups**

Maak:
```
Cloud-Native-Project
```

Region:
```
North Europe
```

---

# PostgreSQL server maken

## 1. aanmaken

Azure Portal → **Create Resource**

Zoek:
```
Azure Database for PostgreSQL Flexible Server
```

Klik **`Create`**

## 2. Basics instellingen

**Subscription**
```
Azure for Students
```

**Resource group**
```
Cloud-Native-Project
```

**Server name**
```
pgsql-cloudnative-project
```

**Region**
```
North Europe (west europa gaat niet)
```

**PostgreSQL version**
```
17
```

**Workload type**
```
Dev/Test
```

### Compute + Storage

Klik **`Configure server`**

**Selecteer:**
Compute tier: **`Burstable`**  
```
Instance: B1ms  
vCPU: 1  
RAM: 2GB  
```

storage:
```
32GiB
```

**prijs:**
**`± $17 / maand`**


## 3. Authentication

**Selecteer:**
```
PostgreSQL authentication only
```

**Administrator login**
```
galerique_admin
```

**Password**
```
BlueRiver!92Forest
```

# 4. Networking

**Kies:**
```
Public access
```

**Daarna:**
```
Allow Azure services
```

**En klik:**
```
Add current client IP
```
zodat je lokaal kan verbinden.

# 5. Server aanmaken

**Klik:**

``Review + Create``

**Daarna:**

``Create``

**Deployment duurt meestal 2 – 5 minuten**

## 6. even checken
![[Pasted image 20260311123337.png]]
er moet een database postgress by default staan, die gaan we gebruiken.


--- 
# blobsss

![[Pasted image 20260311125118.png]]
![[Pasted image 20260311125134.png]]
![[Pasted image 20260311125145.png]]
![[Pasted image 20260311125155.png]]
![[Pasted image 20260311125200.png]]
