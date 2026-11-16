# domain/

Spring Boot 3 + Java 21 + Lombok domain service for the catalogue.  
Express (`server/`) stays the BFF.

## Local

From this directory:

```bash
mvn spring-boot:run
```

Health: http://localhost:8080/health

## Render

Point the service at this subdirectory (`domain/`).  
Runtime: Docker. Health check: `/health`.  
The Dockerfile expects the build context to be `domain/`.

No database yet — deployable skeleton only.
