# Airtime Pay

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## API Routes

### GET /api/airtime

Fetches available networks for airtime purchases.

#### Response

- Success: Returns list of available networks
- Error: Returns error message with appropriate status code

### POST /api/airtime

Purchases airtime for a specified phone number.

#### Request Body

```json
{
  "phone": "11-digit phone number",
  "firstLevel": "network provider",
  "amount": "positive number"
}
```

#### Response

- Success: Returns transaction details
- Error: Returns error message with validation failures or API errors

#### Validation

- Phone number must be 11 digits
- Amount must be positive
- All fields are required

#### Database

Successful transactions are stored in the database
