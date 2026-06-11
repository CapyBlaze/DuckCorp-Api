# 🦆 DuckCorp API

DuckCorp API is an idle incremental game API where players build a global rubber duck empire, manage production, trade on a dynamic market, complete contracts, research technologies, and compete on global leaderboards.

All gameplay is accessible via REST API.

---

## API Endpoints

### 🔐 Authentication

- `POST /auth/register`  
  Create a new player account and receive an API token.

- `GET /me`  
  Get current player state (requires token).

- `GET /player/{id}`  
  Public profile of a player.

- `DELETE /me`  
  Delete account (optional).

---

### 🦆 Core Gameplay (Idle System)

- `GET /state`  
  Retrieve full player state (resources, production, buildings).

- `POST /tick`  
  Manually trigger production update (optional).

- `POST /collect`  
  Collect generated resources (if separated system is used).

---

### 🏭 Buildings System

- `GET /buildings`  
  List all available buildings and levels.

- `GET /buildings/{type}`  
  Get details of a specific building.

- `POST /build/buy`  
  Buy a building or increase its level.

- `POST /build/upgrade`  
  Upgrade existing buildings.

---

### 💰 Economy & Market

- `GET /market/price`  
  Get current global duck price.

- `GET /market/history`  
  View price history.

- `POST /market/sell`  
  Sell ducks at current market price.

- `POST /market/buy`  
  Buy special resources (optional extension).

---

### 🔬 Research System

- `GET /research`  
  List all available technologies.

- `GET /research/active`  
  View ongoing research.

- `POST /research/start`  
  Start a new research project.

- `POST /research/complete`  
  Complete research (if applicable).

---

### 🌍 World & Leaderboards

- `GET /world`  
  Global game statistics (total ducks, players, market state).

- `GET /leaderboard`  
  Global leaderboard.

- `GET /leaderboard/{type}`  
  Filtered leaderboard (money, ducks, influence, production).

- `GET /leaderboard/top`  
  Top players only.

---

### 📦 Contracts System

- `GET /contracts`  
  List available contracts (missions).

- `GET /contracts/active`  
  Active player contracts.

- `POST /contracts/accept`  
  Accept a contract.

- `POST /contracts/complete`  
  Complete a contract and receive rewards.

---

### 🏆 Achievements

- `GET /achievements`  
  List all achievements.

- `GET /me/achievements`  
  Player achievements progress.

---

### 🎲 Events System

- `GET /event/current`  
  Current global event.

- `GET /event/history`  
  Past events.

- `POST /event/trigger` *(admin/debug)*  
  Trigger an event manually.

---

### 🌍 Influence & Endgame

- `POST /influence/lobby`  
  Convert money into influence.

- `GET /influence`  
  View player influence progress.

- `POST /world/expand`  
  Expand global DuckCorp control.

---

### 🛒 Shop

- `GET /shop`  
  View available upgrades and items.

- `POST /shop/buy`  
  Purchase upgrades.

---

### ⚙️ System

- `GET /health`  
  API health check.

- `GET /version`  
  API version.

- `POST /reset` *(debug only)*  
  Reset player data.
