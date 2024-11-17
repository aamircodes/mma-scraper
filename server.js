import express from 'express'
import dotenv from 'dotenv'
import { connectToDatabase, storeData } from './config/dbConfig.js'
import scrape from './utils/scrape.js'
import mongoose from 'mongoose'

dotenv.config()

const app = express()

app.use(express.json())

connectToDatabase()

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

app.post('/api/events/scrape', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API key' })
  }

  try {
    const data = await scrape()

    await storeData(data)

    res.status(200).json({
      message: 'Scrape completed and data stored successfully',
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'MMA Scraper API!' })
})

app.get('/api/events', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    return res
      .status(403)
      .json({ error: true, message: 'Forbidden: Invalid API key' })
  }

  try {
    const db = mongoose.connection
    const collection = db.collection('major_org_events')
    const data = await collection.findOne({})
    res.status(200).json({
      error: false,
      message: 'Events retrieved successfully',
      updatedAt: data.updatedAt,
      data: data.events,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
