FROM maven:3.9-eclipse-temurin-21
WORKDIR /app
COPY . .
RUN mvn package
EXPOSE 8080
CMD ["sh", "-c", "java -jar target/*.jar"]