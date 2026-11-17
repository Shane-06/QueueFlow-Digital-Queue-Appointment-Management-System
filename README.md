# QueueFlow

College appointment and digital queue management in Java. The final application uses Spring Boot MVC, Thymeleaf and PostgreSQL. The existing React prototype in frontend/ is preserved as a design reference.

- [Requirements and acceptance checks](docs/requirements.md)
- [Implementation plan](docs/implementation-plan.md)
- [Phase validation record](docs/progress.md)

Credentials, .env files, local database storage, installed tools, node_modules and build output are excluded from Git.

## Run on this Windows computer

From D:\Project_Planning\Java_Project in PowerShell:

```powershell
./scripts/local-db.ps1
./scripts/build.ps1
./scripts/run.ps1
```

Open http://localhost:8080. The local script creates an isolated PostgreSQL cluster on port 55432. It does not change the existing PostgreSQL server on port 5432. Set PG_BIN if PostgreSQL binaries are installed elsewhere. Set JAVA_HOME to Java 21 if the ignored project-local JDK is unavailable.

Demo accounts: student@queueflow.local, staff@queueflow.local, admin@queueflow.local. Their generated initial password is stored only in .local/demo-password. Read that file locally to sign in; do not upload it. Change individual account passwords through admin account management. Changing the seed environment variable does not overwrite existing accounts.

## Run from a fresh clone

Install Java 21 and PostgreSQL 17. Create separate queueflow and queueflow_test databases, with credentials appropriate to your machine. Set DB_URL, DB_USERNAME and DB_PASSWORD in the shell. No .env loader is required or used. Set DEMO_PASSWORD to a new password of at least 12 characters and SPRING_PROFILES_ACTIVE=demo only for first demo setup. From app/, run ./mvnw.cmd verify on Windows or bash mvnw verify on Linux, then java -jar app/target/queueflow-1.0.0.jar. Run tests against queueflow_test, never a database containing real data. Integration tests seed disposable accounts and exercise schema constraints. See docs/demo-guide.md.

The scripts/build.ps1 helper selects queueflow_test when the isolated local password exists. The scripts/run.ps1 helper selects queueflow. GitHub Actions verifies the build using an ephemeral PostgreSQL service; its database password is a test-only value, not a credential for this machine.

## Scope

The final UI lives in app/src/main/resources/templates and runs inside the Java application. frontend/ preserves the earlier React prototype as a reference. V1 uses refresh-based queue updates, in-app notifications, admin-provisioned accounts and one FIFO queue per service/day. Appointment slots reserve arrival windows, not exact service start times. Report export, SMS/email, QR, WebSockets and public registration are deferred.

For a public deployment, configure an external PostgreSQL database, distinct migration/application database roles, HTTPS, secure session cookies and protected secret injection. The scripts are local demonstration helpers; they are not a production deployment recipe.
