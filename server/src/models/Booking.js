import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  { timestamps: true },
)

bookingSchema.index(
  { studentId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
)

bookingSchema.methods.toPublic = function () {
  const eventId = this.eventId?._id ?? this.eventId
  const studentId = this.studentId?._id ?? this.studentId
  return {
    id: this._id.toString(),
    eventId: eventId.toString(),
    studentId: studentId.toString(),
    status: this.status,
    createdAt: this.createdAt,
  }
}

export const Booking = mongoose.model('Booking', bookingSchema)
