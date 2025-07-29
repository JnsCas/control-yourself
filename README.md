# Control Yourself - Credit Card Tracker

Control Yourself is an open-source application designed to help you track your credit card expenses effectively. It provides a backend API for managing expenses and includes a Telegram bot as a client interface.

## Features

### Server Features (API)

- **Manual Expense Tracking:** Endpoints for adding expenses manually, assigning them to specific merchants and dates.
- **Automatic Expense Sync (Visa Alerts):**
  - The core feature automatically syncs with a designated **Gmail** account to read Visa purchase alert emails.
  - Expenses detected in these emails are automatically added to your tracker via the API.
  - **Cross-Bank:** Tracks expenses regardless of which bank issued the Visa card.
  - **Prerequisites:**
    - Visa Purchase Alerts must be enabled for the user's card(s). Setup can usually be done via the bank's website or directly at: [https://purchasealerts.visa.com/](https://purchasealerts.visa.com/)
    - The email account designated to receive these alerts **must be a Gmail account** and configured via Google OAuth.
- **Installment Support:** Endpoints to manage expenses made in installments.

### Bot Features (Telegram Client [@Control_Yourself_bot](https://t.me/Control_Yourself_bot))

- `/start`: Initiates interaction with the bot and displays a welcome message.
- `/login`: Handles user authentication to enable the Automatic Expense Sync feature.
- `/new-expense`: Allows users to manually add a new expense entry.
- `/update-expense`: Enables users to modify existing expense entries. Used to manage installments.
- `/summary`: Provides a detailed breakdown of expenses by merchant, including monthly totals and percentages.
- `/help`: Displays help information about available commands.

## Getting Started

This project uses Docker Compose to manage its services (backend server, Telegram bot, and database).

### Prerequisites

- Docker and Docker Compose installed.

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:JnsCas/control-yourself.git
    cd control-yourself
    ```
2.  **Set up environment variables:**
    - Create the `.env` file at the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    - Populate `.env` with the necessary environment variables (refer to `.env.example` or `docker-compose.yml`).
3.  **Build the Docker images:**
    ```bash
    docker compose build
    ```
    Or using the npm script:
    ```bash
    npm run build
    ```
4.  **Start the services using Docker Compose:**
    ```bash
    docker compose up -d
    ```
    Alternatively, if you have Node.js and npm installed locally, you can use the shortcut script (this assumes images are already built or up-to-date):
    ```bash
    npm start
    ```

This command will start all services defined in `docker-compose.yml` in detached mode, using the previously built images.

The server API will be available at `http://localhost:3000` (or the port specified by `SERVER_PORT`) and the bot will connect to Telegram.

## Project Structure

- `/server`: Contains the backend NestJS application handling API requests, database interactions, and email syncing.
- `/bot`: Contains the Telegram bot application that interacts with users and the backend API.

## License

[MIT](LICENSE)

---

_This project is open source. Contributions are welcome!_
