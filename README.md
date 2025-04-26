# Ecommerce-Servive-API

## Description

The **Ecommerce-Service** API is a powerful application built with Express.js and Node.js, using TypeScript for better code quality and maintainability. It serves three main user roles:

- **Buyers**: Explore and purchase products across various categories, brands, and collections.
- **Sellers/Merchants**: Seamlessly manage their brands, product listings, and inventory to reach a broader audience.
- **Admins**: Oversee the entire ecosystem, ensuring smooth operations, compliance, and platform integrity.

---

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts to Run](#scripts-to-run)
- [Languages & Tools](#languages--tools)

---

## Features

- **Product Management**: Add, update, delete, and view products.
- **Order Processing**: Manage customer orders and track order statuses.
- **User Management**: Handle user authentication and authorization.
- **Inventory Management**: Track stock levels and manage inventory.
- **Reporting**: Generate sales and performance reports.
- **Node.js Backend**: Provides the backend environment for the application.
- **Express Middleware**: Handles requests and routes.
- **Mongoose Schemas**: Models the application data.

---

## Architecture

The application follows a **Layered Monolithic Architecture** with the following layers:

1. **Presentation Layer**: Handles HTTP requests and responses, including user interfaces and API endpoints.
2. **Business Logic Layer**: Contains business logic and orchestrates interactions between the presentation and data layers.
3. **Data Access Layer**: Manages database interactions and data persistence.

This architecture ensures a clear separation of concerns, making the application easier to maintain and extend.

---

## Installation

Run the following commands to set up the project:

1. Clone the repository:
    ```bash
    git clone https://github.com/human-coder-mj/E-Commerce-Service.git
    ```
2. Navigate to the project directory:
    ```bash
    cd E-Commerce-Service
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

---

## Environment Variables

Create a `.env` file environment variables. Refer to the example file:
[Backend ENV](.env.example)

---

## Scripts to Run

- `npm run dev` → Runs the project in development mode with live reloading.
- `npm run build` → Compiles TypeScript to JavaScript.
- `npm start` → Runs the compiled (production) code from the `dist/` directory.

---

## Languages & Tools
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)

---