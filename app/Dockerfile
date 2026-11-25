FROM maven:3.10.2-eclipse-temurin-21-noble AS build
WORKDIR /build
COPY pom.xml ./
COPY src/ src/
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21-jre-noble
WORKDIR /app
COPY --from=build /build/target/queueflow-1.0.0.jar queueflow.jar
ENV PORT=10000
EXPOSE 10000
USER 10001:10001
ENTRYPOINT ["java", "-jar", "queueflow.jar"]
