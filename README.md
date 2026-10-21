# FestPass

Book seats for college fest events. Each event has limited seats.

- `client/`: React (Vite) with the ChaiUI design system
- `server/`: Express and Mongoose on MongoDB Atlas
- `docs/API.md`: the API the client expects

## Setup

1. In MongoDB Atlas, create a free cluster, a database user, and allow your IP under Network Access.
2. Copy the connection string (Connect > Drivers).

```bash
cd server
cp .env.example .env      # paste the Atlas string into MONGODB_URI
npm install
npm run seed              # 6 events, 24 students
npm run dev               # http://localhost:4000

cd ../client
npm install
npm run dev               # http://localhost:5173
```

Pick a student in the top bar to sign in.

## Status

Browsing events works. Booking and cancelling are not built yet: the routes in `server/src/routes/bookings.js` return 501.
