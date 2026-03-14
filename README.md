# Schedulix - Smart Scheduling For Campus

This repository contains the complete codebase for the Schedulix Smart Scheduling system, divided into a React frontend and a Spring Boot backend.

## Project Structure

- **`/schedulix`**: The Frontend application (built with React/Vite/Tailwind).
- **`/faculty-coordination`**: The Backend application (built with Java Spring Boot).

---

## 🚀 How to Run the Project

### 1. Frontend (`/schedulix`)
To start the React frontend:

```bash
cd schedulix
npm install
npm run dev
```
The application will usually be available at `http://localhost:5173`.

### 2. Backend (`/faculty-coordination`)
To start the Spring Boot backend:

```bash
cd faculty-coordination
./mvnw spring-boot:run
```
The backend API will run on the port specified in your `application.properties` (typically `http://localhost:8080`).

---

## Contributing
When making changes, please ensure you are committing from the root directory of the project so that changes to both the frontend and backend can be tracked together.
