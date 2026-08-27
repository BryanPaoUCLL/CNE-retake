FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-jammy AS runtime
LABEL org.opencontainers.image.source=https://github.com/BryanPaoUCLL/CNE-retake

RUN groupadd --system spring && useradd --system --gid spring spring
WORKDIR /app
COPY --from=build --chown=spring:spring /workspace/target/*.jar app.jar

USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
