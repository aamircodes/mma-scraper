import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = process.env.BASE_URL
const MAJOR_ORGS = ['UFC', 'PFL', 'BELLATOR', 'ONE', 'RIZIN']
const MAX_MAJOR_ORGS = 10

const scrape = async () => {
  console.log('Launching browser...')
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  let events = []
  let filteredEvents = []

  try {
    await page.goto(`${BASE_URL}/fightcenter?group=major&schedule=upcoming`)
    events = await extractEventDetails(page)
    filteredEvents = filterMajorOrgs(events)
  } catch (error) {
    console.error(`Error occurred during scraping: ${error}`)
  } finally {
    console.log('Closing the browser.')
    await browser.close()
  }

  return { filteredEvents }
}

const extractEventDetails = async (page) => {
  const events = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.promotion')).map((el) => {
      // event title
      let titleElement = el.querySelector('a')
      const title = titleElement ? titleElement.innerText.trim() : null

      // event datetime
      let datetimeElement = el.querySelector(
        'span.hidden.md\\:inline:nth-of-type(4)'
      )
      const datetime = datetimeElement ? datetimeElement.innerText.trim() : null

      // event link to see more
      const link = titleElement ? titleElement.href : null

      return { title, datetime, link }
    })
  })

  return events
}

const filterMajorOrgs = (events) => {
  return events
    .filter((event) =>
      MAJOR_ORGS.some((org) => event.title.toUpperCase().includes(org))
    )
    .slice(0, MAX_MAJOR_ORGS)
}

// const extractFightDetails = async (eventPage) => {
// }

export default scrape
