FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Unset any SPRING_PROFILES_ACTIVE so default (MySQL) config is used
ENV SPRING_PROFILES_ACTIVE=""
EXPOSE 7070
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default} -Dserver.port=${PORT:-7070} -jar app.jar"]
