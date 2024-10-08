# Preview
![Tickets Preview](https://i.imgur.com/hqMmBbj.png)

#### Knowledgebase Section
![Knowledgebase Preview](https://i.imgur.com/J66X3xE.png)

#### Ticket Details
![Ticket (single) Preview](https://i.imgur.com/qmdL1Bq.png)

# Ticket CRM System

## Description
***
*This project demonstrates the development of a comprehensive Ticket CRM (Customer Relationship Management) System that enables efficient management of customer tickets, knowledge base articles, and user profiles.*

The Ticket CRM System is a modern web application designed to streamline customer support processes by providing an intuitive interface for managing tickets, user details, and a knowledge base. The Front-End is built using React and TypeScript, ensuring a responsive and dynamic user experience across devices. The Back-End, powered by Node.js and Express, manages data processing and integration efficiently, with a MySQL database handling persistent data storage.
***

## Front End
***
- React
- TypeScript
- CSS (optional: TailwindCSS)
***

## Back End
***
- Node.js
- Express
- TypeScript
- MySQL
***

## Features
***
- **User Management:** Create, edit, and manage user profiles, including role assignment and profile pictures.
- **Ticket Management:** Submit, edit, and track customer support tickets with status updates and priority levels.
- **Knowledgebase:** Create and manage knowledge base articles with categories and attachment support.
- **Commenting System:** Add comments to tickets for detailed discussions and tracking.
***

## Getting Started

First, set up a MySQL server and **correctly fill the environment (.env) details** (Frontend + Backend).
* Create a new DB as you nammed it in your .env file.
* Execute the `Populate-SQL.sql` file in this directory.

Second, run the Front-End server:

* In a new terminal, navigate to the frontend folder.
```bash
npm start
```

Third, run the Back-End server:

* In a new terminal, navigate to the backend folder.
``` bash
npm start
```

Open http://localhost:3001 with your browser to see the result.

You can start editing the project by modifying files in the frontend or backend directories. The page auto-updates as you edit the files.

## API Documentation
- **Tickets API:** Handles ticket creation, retrieval, updating, and deletion.
- **Users API:** Manages user profiles, authentication, and authorization.
- **Knowledgebase API:** Supports CRUD operations for knowledge base articles and categories.

## Database Schema
- **Users:** Stores user details including username, email, role, and profile picture.
- **Tickets:** Stores customer tickets with fields for title, description, status, priority, and creation date.
- **Comments:** Stores comments related to tickets, with a reference to the ticket ID.
- **Knowledgebase:** Stores knowledge base articles with categories and attachments.
- **Categories:** Stores categories for organizing knowledge base articles.
