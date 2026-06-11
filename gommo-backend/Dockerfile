# Build de producao — contexto: gommo-backend/
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests package

# Dev local (docker compose): JDK + Maven + Tesseract para OCR de holerites escaneados
FROM eclipse-temurin:21-jdk-alpine AS dev
RUN apk add --no-cache \
    maven \
    curl \
    tesseract-ocr \
    tesseract-ocr-data-por \
    fontconfig \
    ttf-dejavu
WORKDIR /app

FROM eclipse-temurin:21-jre-alpine AS prod
WORKDIR /app

RUN apk add --no-cache \
    curl \
    tesseract-ocr \
    tesseract-ocr-data-por \
    fontconfig \
    ttf-dejavu \
    && addgroup -S gommo && adduser -S gommo -G gommo \
    && mkdir -p /data/storage && chown -R gommo:gommo /data/storage

COPY --from=build /app/target/*.jar /app/app.jar
RUN chown gommo:gommo /app/app.jar

USER gommo

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8081
EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${SERVER_PORT}/actuator/health" || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "/app/app.jar"]
