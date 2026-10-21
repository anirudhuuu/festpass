import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['tech', 'cultural', 'sports', 'workshop'], required: true },
    venue: { type: String, required: true },
    startsAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    seatsBooked: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['open', 'cancelled'], default: 'open' },
  },
  { timestamps: true },
)

eventSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    category: this.category,
    venue: this.venue,
    startsAt: this.startsAt,
    capacity: this.capacity,
    seatsBooked: this.seatsBooked,
    seatsLeft: Math.max(0, this.capacity - this.seatsBooked),
    status: this.status,
  }
}

export const Event = mongoose.model('Event', eventSchema)
