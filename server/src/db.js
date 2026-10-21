import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and paste your Atlas connection string.')
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'festpass' })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}
