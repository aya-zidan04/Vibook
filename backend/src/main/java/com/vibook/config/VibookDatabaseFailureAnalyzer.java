package com.vibook.config;

import org.flywaydb.core.internal.exception.FlywaySqlException;
import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;
import org.springframework.dao.DataAccessResourceFailureException;

import java.net.ConnectException;
import java.util.Locale;

/**
 * Turns low-level JDBC / Flyway failures into actionable messages for developers.
 */
public class VibookDatabaseFailureAnalyzer extends AbstractFailureAnalyzer<Throwable> {

    @Override
    protected FailureAnalysis analyze(Throwable rootFailure, Throwable cause) {
        Throwable t = deepest(cause != null ? cause : rootFailure);
        if (t == null) {
            return null;
        }
        String msg = t.getMessage() != null ? t.getMessage() : "";

        if (t instanceof ConnectException || msg.toLowerCase(Locale.ROOT).contains("connection refused")) {
            return new FailureAnalysis(
                    "Could not connect to PostgreSQL (connection refused). The database server is not reachable at the configured host/port.",
                    """
                            1) Start PostgreSQL locally, for example:
                                 cd backend && docker compose up -d
                            2) Or point the app at a running instance with env vars, e.g.:
                                 export DB_URL='jdbc:postgresql://localhost:5432/vibook?sslmode=disable'
                                 export DB_USERNAME=vibook
                                 export DB_PASSWORD=vibook
                            3) Create the database if needed: createdb vibook (or use POSTGRES_DB in Docker).
                            Supported property names: DB_URL or DATABASE_URL, DB_USERNAME or DATABASE_USERNAME, DB_PASSWORD or DATABASE_PASSWORD.
                            """,
                    cause
            );
        }

        if (msg.contains("password authentication failed") || msg.contains("FATAL: password")) {
            return new FailureAnalysis(
                    "PostgreSQL rejected the username/password.",
                    """
                            Check DB_USERNAME / DATABASE_USERNAME and DB_PASSWORD / DATABASE_PASSWORD.
                            Default local Docker Compose user/password/database: vibook / vibook / vibook
                            """,
                    cause
            );
        }

        if (msg.contains("does not exist") && (msg.contains("database") || msg.toLowerCase(Locale.ROOT).contains("database"))) {
            return new FailureAnalysis(
                    "The PostgreSQL database name in the JDBC URL does not exist on the server.",
                    """
                            Create the database (example): createdb vibook
                            Or set POSTGRES_DB=vibook when starting Postgres in Docker.
                            """,
                    cause
            );
        }

        if (t instanceof FlywaySqlException || msg.contains("Flyway") || rootFailure.getMessage() != null
                && rootFailure.getMessage().contains("flywayInitializer")) {
            return new FailureAnalysis(
                    "Flyway could not run database migrations (usually because the database is unreachable or credentials are wrong).",
                    """
                            Fix the database connection first (see connection refused / auth messages above), then restart.
                            Migrations live under src/main/resources/db/migration/
                            """,
                    cause
            );
        }

        if (t instanceof DataAccessResourceFailureException || msg.contains("Unable to obtain connection")) {
            return new FailureAnalysis(
                    "Spring could not open a JDBC connection to PostgreSQL.",
                    """
                            Verify PostgreSQL is running, JDBC URL is correct, and firewall allows the port.
                            Example JDBC URL: jdbc:postgresql://localhost:5432/vibook?sslmode=disable
                            """,
                    cause
            );
        }

        return null;
    }

    private static Throwable deepest(Throwable t) {
        if (t == null) {
            return null;
        }
        Throwable c = t;
        while (c.getCause() != null && c.getCause() != c) {
            c = c.getCause();
        }
        return c;
    }
}
