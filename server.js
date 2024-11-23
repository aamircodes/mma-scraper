import express from 'express'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/database.js'
import scrape from './services/scrapeService.js'
import { storeData, fetchData } from './services/eventService.js'

dotenv.config()

const app = express()

app.use(express.json())

connectToDatabase()

app.get('/health', (req, res) =>
  res.status(200).json({
    status: 'OK',
  })
)

app.post('/api/scrapes/', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    return next({ status: 403, message: 'Forbidden: Invalid API key' })
  }

  try {
    const scrapedData = await scrape()
    const storedData = await storeData(scrapedData)

    res.status(201).json({
      id: storedData._id,
      message: 'Scrape completed and data stored successfully',
      updatedAt: storedData.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/events', async (req, res) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.SECRET_KEY) {
    next({ status: 403, message: 'Forbidden: Invalid API key' })
  }

  try {
    const eventData = await fetchData()

    res.status(200).json({
      id: eventData._id,
      updatedAt: eventData.updatedAt,
      events: eventData.events,
    })
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
