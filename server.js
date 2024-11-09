import express from 'express'
import dotenv from 'dotenv'
import { connectToDB } from './config/dbConfig.js'
import scrape from './utils/scrape.js'

dotenv.config()

const app = express()

connectToDB()

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'MMA Scraper API!' })
})

app.get('/scrape', async (req, res) => {
  try {
    const scrapeResult = await scrape()
    res
      .status(200)
      .json({ message: 'Scrape completed successfully', data: scrapeResult })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
