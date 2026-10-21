# Build de producao — contexto: gesint-admin-backend/
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cap heap: Coolify/VPS/notebook costuma OOM com Maven+Next em paralelo
ENV MAVEN_OPTS="-Xmx768m -XX:MaxMetaspaceSize=256m"

COPY pom.xml ./
RUN mvn -q -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup -S gesint && adduser -S gesint -G gesint

COPY --from=build /app/target/*.jar /app/app.jar
RUN chown gesint:gesint /app/app.jar

USER gesint

ENV SPRING_PROFILES_ACTIVE=prod
ENV ADMIN_SERVER_PORT=8082
EXPOSE 8082

HEALTHCHECK --interval=15s --timeout=5s --start-period=300s --retries=10 \
  CMD curl -fsS "http://127.0.0.1:${ADMIN_SERVER_PORT}/actuator/health" || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "/app/app.jar"]
