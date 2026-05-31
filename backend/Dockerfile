FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 7070
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod -Dserver.port=${PORT:-7070} -jar app.jar"]
