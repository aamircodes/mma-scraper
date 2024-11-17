import mongoose from 'mongoose'
import Event from '../models/Event.js'

const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

const storeData = async (data) => {
  try {
    await Event.deleteMany({})
    await Event.create({ events: data, updatedAt: new Date() })
    console.log('events stored successfully in the database')
  } catch (error) {
    console.error(`Error storing events: ${error.message}`)
  }
}

export { connectToDatabase, storeData }
