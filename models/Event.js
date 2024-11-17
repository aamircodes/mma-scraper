import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
  events: { type: Array, required: true },
  updatedAt: { type: Date, default: Date.now },
})

const Event = mongoose.model('Event', EventSchema)

export default Event
