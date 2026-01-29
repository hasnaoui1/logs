FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache python3 py3-paho-mqtt

COPY --from=build /app/target/*.jar app.jar

COPY src/main/resources/scripts/ /app/src/main/resources/scripts/

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
