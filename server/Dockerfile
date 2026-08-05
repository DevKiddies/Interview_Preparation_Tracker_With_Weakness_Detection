# ---------- Stage 1 : Build ----------
FROM maven:3.9.11-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven wrapper and project configuration first
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline

# Copy application source
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests


# ---------- Stage 2 : Runtime ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create a non-root user
RUN useradd --create-home --shell /bin/bash spring

# Copy the packaged JAR and set ownership
COPY --from=builder --chown=spring:spring /app/target/server-0.0.1-SNAPSHOT.jar app.jar

# Switch to the non-root user
USER spring

# Spring Boot port
EXPOSE 8080

# Health check (requires spring-boot-starter-actuator)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM options optimized for containers
ENTRYPOINT ["java","-XX:+UseContainerSupport","-jar","app.jar"]