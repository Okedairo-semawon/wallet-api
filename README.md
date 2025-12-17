# Wallet API – README

## Overview

This is a simple **Wallet API** built with **NestJS**. It supports:

* Creating wallets
* Funding wallets with **idempotency**
* Getting wallet details
* Transferring funds between wallets with **idempotency**

All monetary operations are in **USD**.

---

## Prerequisites

* Node.js **>= 20**
* npm **>= 10**
* Postman (for API testing)

---

## Installation & Running Locally

1. Clone the repository:

```bash
git clone <your-repo-url>
cd wallet-api
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run start:dev
```

The API will run at: `http://localhost:5000`

---

## Postman Collection

A Postman collection is included for easy testing:

* File: `NovaCrust.postman_collection.json`


### Import Steps

1. Open Postman → click **Import** → choose the collection JSON file.
2. (Optional) Import environment JSON if provided.
3. Select the environment in Postman.
4. All endpoints are ready to use with `{{baseUrl}}` pointing to `http://localhost:5000`.

---

## Endpoints

### 1. Create Wallet

**POST** `/wallet`
Response:

```json
{
  "id": "wallet-id",
  "balance": 0,
  "currency": "USD",
  "transactions": []
}
```

* Save the returned `id` as `senderId` or `receiverId` for future operations.

---

### 2. Fund Wallet

**POST** `/wallet/fund`
Headers:

```
idempotency-key: <unique-key>
Content-Type: application/json
```

Body:

```json
{
  "walletId": "SENDER_WALLET_ID",
  "amount": 5000
}
```

* The `idempotency-key` ensures repeated requests with the same key do **not duplicate transactions**.

---

### 3. Get Wallet Details

**GET** `/wallet/:walletId`
Response:

```json
{
  "id": "wallet-id",
  "balance": 5000,
  "currency": "USD",
  "transactions": [
    {
      "id": "transaction-id",
      "type": "credit",
      "amount": 5000,
      "createdAt": "2025-12-16T18:55:22.358Z"
    }
  ]
}
```

---

### 4. Transfer Funds

**POST** `/wallet/transfer`
Headers:

```
idempotency-key: <unique-key>
Content-Type: application/json
```

Body:

```json
{
  "senderId": "SENDER_WALLET_ID",
  "receiverId": "RECEIVER_WALLET_ID",
  "amount": 1000
}
```

* Also supports **idempotency**.

---

## Idempotency Notes

* **Idempotency Key Header**: `idempotency-key`
* Any repeat request with the same key **returns the same result** without creating a duplicate transaction.

---

## Testing

* **Unit & E2E Tests** included:

```bash
npm run test
```

* All core endpoints are covered.
* Test results ensure proper wallet creation, funding, transfers, and idempotency.

---

## Tips

* Use Postman **environment variables** for `senderId` and `receiverId` to simplify testing.
* Always include a unique `idempotency-key` when funding or transferring to avoid duplicate actions.

---

## Author

**Semawon Okedairo** – Backend Developer
Email: [okedairosemawon@gmail.com](mailto:okedairosemawon@gmail.com)
LinkedIn: [https://bit.ly/4byCJ1n](https://bit.ly/4byCJ1n)
