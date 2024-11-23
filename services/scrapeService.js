import puppeteer from 'puppeteer'
import {
  BASE_URL,
  MAJOR_PROMOTIONS,
  MAX_PROMOTIONS,
} from '../utils/constants.js'

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Step 1: Fetch the initial list of events
    const allEvents = await fetchInitialEventList(page)
    // Step 2: Filter the list to only include relevant events
    const filteredEvents = filterMajorPromotions(allEvents)
    // Step 3: Enrich only the filtered events with fight card details
    const enrichedEvents = await populateEventDetails(filteredEvents, page)

    return enrichedEvents
  } catch (error) {
    throw new Error(`Error occurred during scraping: ${error.message}`)
  } finally {
    await page.close()
    await browser.close()
  }
}

// Fetch the initial list of events from the main page
const fetchInitialEventList = async (page) => {
  try {
    console.log(`Navigating to ${BASE_URL}...`)
    await page.goto(`${BASE_URL}/fightcenter?group=major&schedule=upcoming`)

    const events = await extractEventDetails(page)
    console.log(`${events.length} events fetched from the page.`)
    return events
  } catch (error) {
    throw new Error(`Error fetching initial event list: ${error.message}`)
  }
}

// Filter events to include only major promotions
const filterMajorPromotions = (events) => {
  const filtered = events
    .filter((event) =>
      MAJOR_PROMOTIONS.some((org) => event.title?.toUpperCase().includes(org))
    )
    .slice(0, MAX_PROMOTIONS)

  console.log(`${filtered.length} events filtered by major promotions.`)
  return filtered
}

// Enrich each event with fight card details
const populateEventDetails = async (events, page) => {
  for (const event of events) {
    if (!event.link) continue

    try {
      console.log(`Fetching details for event: ${event.title}...`)
      await page.goto(event.link)
      event.fights = await extractFightCardDetails(page)
    } catch (error) {
      console.warn(
        `Failed to fetch details for event: ${event.title} (${event.link})`
      )
    }
  }
  return events
}

// Get the list of events from the main page
const extractEventDetails = async (page) => {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.promotion')).map(
      (element) => ({
        eventId:
          element
            .querySelector('a')
            ?.innerText.toLowerCase()
            .replace(/\s+/g, '-') || null,
        title: element.querySelector('a')?.innerText.trim() || null,
        datetime: element.querySelectorAll('span')[3]?.innerText.trim() || null,
        link: element.querySelector('a')?.href || null,
      })
    )
  })
}

// Get the fight card details for a specific event
const extractFightCardDetails = async (page) => {
  return await page.evaluate(() => {
    // get details for an individual fighter
    const getFighterDetails = (fightEl, position) => {
      const fighter = fightEl.querySelector(
        `div.w-\\[37\\%\\]:nth-of-type(${position})`
      )
      if (!fighter)
        return {
          name: null,
          profileUrl: null,
          record: null,
          rank: null,
          imageUrl: null,
          countryFlagUrl: null,
        }

      const name =
        fighter.querySelector('a.link-primary-red')?.innerText.trim() || null
      const profileUrl =
        fighter.querySelector('a.link-primary-red')?.href || null
      const record =
        fighter
          .querySelector('span.text-\\[15px\\].md\\:text-xs')
          ?.innerText.trim() || null
      const rank =
        fighter
          .querySelector('div.bg-tap_darkred span.text-sm.md\\:text-xs11')
          ?.innerText.trim() || null
      const imageUrl = fighter.querySelector('img')?.src || null
      const countryFlagUrl =
        fighter.querySelector('img.opacity-70')?.src || null

      return { name, profileUrl, record, rank, imageUrl, countryFlagUrl }
    }

    return Array.from(
      document.querySelectorAll('li[data-controller="table-row-background"]')
    ).map((fightElement) => ({
      weight:
        fightElement.querySelector('span.bg-tap_darkgold')?.innerText || null,
      mainCard: fightElement.innerText.toLowerCase().includes('main'),
      fighterA: getFighterDetails(fightElement, 1),
      fighterB: getFighterDetails(fightElement, 3),
    }))
  })
}

export default scrape
