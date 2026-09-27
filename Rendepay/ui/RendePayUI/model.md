ngrok http 8080

dotnet clean
adb devices
dotnet build -t:Run -f net8.0-android

./mvnw spring-boot:run