# Build de producao — contexto: gesint-backend/
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cap heap: Coolify/VPS/notebook costuma OOM com Maven+Next em paralelo
ENV MAVEN_OPTS="-Xmx768m -XX:MaxMetaspaceSize=256m"

COPY pom.xml ./
RUN mvn -q -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -B -DskipTests package

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
    su-exec \
    tesseract-ocr \
    tesseract-ocr-data-por \
    fontconfig \
    ttf-dejavu \
    && addgroup -S gesint && adduser -S gesint -G gesint \
    && mkdir -p /data/storage

COPY --from=build /app/target/*.jar /app/app.jar
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown gesint:gesint /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8081
EXPOSE 8081

HEALTHCHECK --interval=15s --timeout=5s --start-period=300s --retries=10 \
  CMD curl -fsS "http://127.0.0.1:${SERVER_PORT}/actuator/health" || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
