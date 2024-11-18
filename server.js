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
  res.status(200).json({
    status: 'OK',
  })
})

app.post('/api/scraping-jobs/', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    return res.status(403).json({
      error: 'Forbidden: Invalid API key',
    })
  }

  try {
    const data = await scrape()
    const storedData = await storeData(data)

    res.status(201).json({
      message: 'Scrape completed and data stored successfully',
    })
    console.log(storedData)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

app.get('/api/events', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    return res.status(403).json({
      error: 'Forbidden: Invalid API key',
    })
  }

  try {
    const db = mongoose.connection
    const collection = db.collection('events')
    const data = await collection.findOne({})

    if (!data) {
      return res.status(404).json({
        error: 'No events found',
      })
    }

    res.status(200).json({
      id: data._id,
      updatedAt: data.updatedAt,
      events: data.events,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the MMA Scraper API!',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
