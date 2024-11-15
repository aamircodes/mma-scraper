import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = process.env.BASE_URL
const MAJOR_PROMOTIONS = ['UFC', 'PFL', 'BELLATOR', 'RIZIN']
const MAX_PROMOTIONS = 10

// Main function to scrape event data
const scrape = async () => {
  console.log('Launching browser...')
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  let events = []

  try {
    // Navigate to main events page and extract initial event details
    await page.goto(`${BASE_URL}/fightcenter?group=major&schedule=upcoming`)
    const allEvents = await getEventDetails(page)

    // Filter events
    events = filterByMajorPromotions(allEvents)

    // Loop through events, populate the fights array for each event
    for (let event of events) {
      if (event.link) {
        try {
          await page.goto(event.link)

          const fights = await getFightCardDetails(page)
          event.fights = fights
        } catch (error) {
          console.error(`Error navigating to event: ${event.link} - ${error}`)
        }
      }
    }
  } catch (error) {
    console.error(`Error occurred during scraping: ${error}`)
  } finally {
    console.log('Closing the browser.')
    await browser.close()
  }

  return { events }
}

// get list of events from main page and populate each event with id, title, datetime and link
const getEventDetails = async (page) => {
  const events = await page.evaluate(() => {
    const formatEventId = (eventName) => {
      return eventName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
    }

    return Array.from(document.querySelectorAll('.promotion')).map((el) => {
      const title = el.querySelector('a')?.innerText.trim() || null
      const eventId = title ? formatEventId(title) : null
      const datetime =
        el
          .querySelector('span.hidden.md\\:inline:nth-of-type(4)')
          ?.innerText.trim() || null
      const link = el.querySelector('a')?.href || null

      return { eventId, title, datetime, link }
    })
  })

  return events
}

// filter events by major organisations
const filterByMajorPromotions = (events) => {
  return events
    .filter((event) =>
      MAJOR_PROMOTIONS.some((org) => event.title.toUpperCase().includes(org))
    )
    .slice(0, MAX_PROMOTIONS)
}

// extract fight details for each event page, return the name, profileUrl, record and rank for each fight
const getFightCardDetails = async (page) => {
  return await page.evaluate(() => {
    // helper function to get data for each fighter
    const extractFighterData = (fightEl, position) => {
      const fighterElement = fightEl.querySelector(
        `div.w-\\[37\\%\\]:nth-of-type(${position})`
      )

      if (!fighterElement)
        return { name: null, profileUrl: null, record: null, rank: null }

      const name =
        fighterElement.querySelector('a.link-primary-red')?.innerText.trim() ||
        null
      const profileUrl =
        fighterElement.querySelector('a.link-primary-red')?.href || null
      const record =
        fighterElement
          .querySelector('span.text-\\[15px\\].md\\:text-xs')
          ?.innerText.trim() || null
      const rank =
        fighterElement
          .querySelector('div.bg-tap_darkred span.text-sm.md\\:text-xs11')
          ?.innerText.trim() || null

      return { name, profileUrl, record, rank }
    }

    const fightCardSection = document.querySelector('#sectionFightCard')
    if (!fightCardSection) return []

    const fightElements = Array.from(
      fightCardSection.querySelectorAll(
        'li[data-controller="table-row-background"]'
      )
    )

    return fightElements.map((fightEl) => {
      // fight weight class
      const weight =
        fightEl.querySelector('span.bg-tap_darkgold')?.innerText.trim() || null

      const fighterA = extractFighterData(fightEl, 1)
      const fighterB = extractFighterData(fightEl, 3)

      return { weight, fighterA, fighterB }
    })
  })
}

export default scrape
