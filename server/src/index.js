import { app } from './app.js'
import { connectDb } from './db.js'
import { Booking } from './models/Booking.js'

const port = Number(process.env.PORT) || 4000

await connectDb()
await Booking.syncIndexes()
app.listen(port, () => console.log(`FestPass API on http://localhost:${port}`))
