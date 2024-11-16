import mongoose from 'mongoose'

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
    const db = mongoose.connection
    const collection = db.collection('major_org_events')
    await collection.deleteMany({})
    await collection.insertOne(data)
    console.log('Data stored successfully in the database')
  } catch (error) {
    console.error(`Error storing data: ${error.message}`)
  }
}

export { connectToDatabase, storeData }
