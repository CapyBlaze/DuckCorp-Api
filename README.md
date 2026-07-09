# DuckCorp API

A multiplayer idle game API where players build a rubber duck empire, produce ducks and sell them on the market.

- [Swagger Documentation](https://duckcorp.capyblaze.hackclub.app/docs)
- [Postman Collection](https://raw.githubusercontent.com/CapyBlaze/DuckCorp-Api/refs/heads/main/docs/postman/Duck%20API.postman_collection.json)
- [API Endpoint](https://duckcorp.capyblaze.hackclub.app/)

## How to play

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

To see the rest of the available routes, please refer to the [documentation](https://duckcorp.capyblaze.hackclub.app/docs/)

## Environment Variables

```env
SERVER_PORT=8085
TRUST_PROXY=true
API_VERSION=v1

DATABASE_URL="file:./dev.db"

ADMIN_USERNAME=admin
ADMIN_PASSWORD=xxxxxxxxxxxxxxxx
```
