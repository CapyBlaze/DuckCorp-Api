<h1 align="center">DuckCorp API</h1>

<a id="readme-top"></a>

<p align="center">
    <img src="https://img.shields.io/github/license/CapyBlaze/DuckCorp-Api?style=flat-square" alt="LICENSE"/>
    <img src="https://img.shields.io/github/package-json/version/CapyBlaze/DuckCorp-Api?style=flat-square" alt="VERSION"/>
    <img src="https://img.shields.io/github/last-commit/CapyBlaze/DuckCorp-Api?style=flat-square" alt="LAST COMMIT"/>
    <img src="https://img.shields.io/github/issues/CapyBlaze/DuckCorp-Api?style=flat-square" alt="ISSUES"/>
    <img src="https://img.shields.io/github/stars/CapyBlaze/DuckCorp-Api?style=flat-square" alt="STARS"/>
    </br>
    <img src="https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white" alt="NODE"/>
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TYPESCRIPT"/>
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="PRISMA"/>
    <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLITE"/>
    <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="SWAGGER"/>
    <img src="https://img.shields.io/badge/Express.js-Framework-989898?style=flat-square&logo=express&logoColor=white" alt="EXPRESS"/>
</p>

A multiplayer idle game API where players build a rubber duck empire, produce ducks and sell them on the market.
Designed to run on a local network, making it perfect for a Raspberry Pi or a small home server.

<div align="center">
    <h3>
        <a href="" target="_blank">
        👉 Api Documentation 👈
        </a>
    </h3>
</div>

<br />

<details>
    <summary>🗂️ Table of Contents</summary>
    <ol>
        <li>
            <a href="#🔎-features">🔎 Features</a>
        </li>
        <li>
            <a href="#❓-how-it-works">❓ How it works</a>
        </li>
        <li>
            <a href="#🎮-how-to-play">🎮 How to play</a>
        </li>
        <li>
            <a href="#🚀-getting-started">🚀 Getting Started</a>
        </li>
        <li>
            <a href="#🛠️-architecture-and-tech-stack">🛠️ Architecture and Tech Stack</a>
        </li>
        <li>
            <a href="#🤝-contributing">🤝 Contributing</a>
        </li>
        <li>
            <a href="#📝-license">📝 License</a>
        </li>
        <li>
            <a href="#👤-author">👤 Author</a>
        </li>
    </ol>
</details>

---

## 🔎 Features

- Token-based authentication
- Idle/offline production system
- Dynamic duck market
- Buildings and storage upgrades
- Achievements system
- Global leaderboards
- Administration panel
- REST API
- OpenAPI / Swagger documentation

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ❓ How it works

Each player owns a duck production company.

Players can:

- Buy buildings to increase duck production
- Buy storage units to increase capacity
- Produce ducks automatically over time
- Sell ducks on the market
- Unlock achievements
- Compete in leaderboards

The game is fully server-side and all progression is stored by the API.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🎮 How to play

### 1. Create a Player

Register a new player:

```http
POST /auth/register
{
  "name": "string"
}
```

The API returns a unique token:

```json
{
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Store this token carefully. It is your permanent identity and will be required for all future requests.

Use it in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### 2. Buy Your First Building

Retrieve the list of available buildings:

```http
GET /building
```

Purchase a building:

```http
POST /building/buy
{
  "id": "string"
}
```

Buildings automatically produce ducks over time.

### 3. Increase Your Storage

Retrieve the list of available storage units:

```http
GET /storage
```

Purchase storage:

```http
POST /storage/buy
{
  "id": "string"
}
```

Storage increases the maximum number of ducks you can hold.

### 4. Produce Ducks

Duck production is automatic.

To process offline production and update your resources:

```http
POST /player/sync
```

### 5. Sell Ducks

Check the current market price:

```http
GET /market/price
```

Sell all stored ducks:

```http
POST /market/sell
```

The money earned can be used to buy more buildings and storage units.

### 6. Unlock Achievements

View available achievements:

```http
GET /achievement
```

Achievements are unlocked automatically as you progress through the game.

### 7. Compete With Other Players

View the global leaderboard:

```http
GET /leaderboard
```

View your own ranking:

```http
GET /leaderboard/me
```

Produce more ducks, earn more money and climb to the top of the leaderboard.

### 8. Other Routes

To see the rest of the available routes, please refer to the [documentation]()

<p align="right">(<a href="#readme-top">back to top</a>)</p>
  
## 🚀 Getting Started

### Prerequisites

- Node.js (v24 or higher)
- npm, yarn or pnpm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/CapyBlaze/DuckCorp-Api.git
    cd DuckCorp-Api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:8080`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🛠️ Architecture and Tech Stack

### Architecture

- **Data** : [src/data](src/data) - contains a list of construction and storage projects and their completion dates.
- **Config** : [src/config](src/config) - contains configuration files for the application.
- **Controllers** : [src/controllers](src/controllers) - Handle incoming requests and return responses.
- **Services** : [src/services](src/services) - Contain business logic and interact with the database.
- **Middlewares** : [src/middlewares](src/middlewares) - Handle request processing, authentication, and error handling.

### Tech Stack

- **Express** - Web framework
- **TypeScript** - Programming language
- **Prisma** - Database ORM
- **SQLite** - Database
- **Swagger** - API documentation

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 👤 Author

### Code

- GitHub: [@CapyBlaze](https://github.com/CapyBlaze)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

Made with ❤️ by [Capy Blaze](https://github.com/CapyBlaze)
