Project Summary
E-Commerce Backend API
E-Commerce Backend is a robust and scalable RESTful API designed for managing an e-commerce platform. This backend application provides essential features for user management, product catalog, shopping cart, and order processing. Built with Node.js, TypeScript, Prisma, and MySQL, this project emphasizes security, performance, and ease of use.

Key Features
User Authentication: Secure registration, login, and JWT-based authentication.
Product Management: Create, read, update, and delete products with role-based access control.
Cart Operations: Manage items in the shopping cart, including adding, updating, and removing items.
Order Management: Process orders with status updates and role-based access for order management.
Address Management: CRUD operations for managing user addresses.
Technologies
Node.js: Server-side JavaScript runtime.
TypeScript: Typed JavaScript for enhanced code reliability.
Prisma: ORM for database interaction.
MySQL: Relational database management system.
JWT: JSON Web Tokens for secure user authentication.
Express.js: Web framework for building APIs.
Jest & Supertest: Testing frameworks for ensuring code quality.
Getting Started
Clone the Repository

bash
Copy code
git clone https://github.com/yourusername/ecommerce-backend.git
Install Dependencies

bash
Copy code
cd ecommerce-backend
npm install
Configure Environment Variables

Create a .env file and provide necessary configuration settings.

Run Migrations
npx prisma migrate dev

Start the Server
npm start

Run Tests

npm test
