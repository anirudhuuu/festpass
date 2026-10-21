import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
})

studentSchema.methods.toPublic = function () {
  return { id: this._id.toString(), name: this.name, rollNo: this.rollNo }
}

export const Student = mongoose.model('Student', studentSchema)
