import scrape from '../services/scrapeService'
import puppeteer from 'puppeteer'

jest.mock('puppeteer')

jest.mock('../utils/constants', () => ({
  BASE_URL: 'http://mock-base-url.com',
  MAJOR_PROMOTIONS: ['UFC', 'BELLATOR'],
  MAX_PROMOTIONS: 2,
}))

describe('Scrape Service', () => {
  let mockBrowser
  let mockPage

  beforeEach(() => {
    mockPage = {
      close: jest.fn(),
      goto: jest.fn(),
      evaluate: jest.fn(),
    }

    mockBrowser = {
      newPage: jest.fn(() => mockPage),
      close: jest.fn(),
    }

    puppeteer.launch.mockResolvedValue(mockBrowser)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should scrape and return enrichedEvents successfully', async () => {
    const mockEvents = [
      { title: 'UFC 1', link: 'http://event1.com' },
      { title: 'Bellator 2', link: 'http://event2.com' },
      { title: 'XFC 3', link: 'http://event3.com' },
    ]

    const mockFightCardDetails = [
      {
        weight: 'Featherweight',
        mainCard: true,
        fighterA: { name: 'Fighter 1' },
        fighterB: { name: 'Fighter 2' },
      },
    ]

    mockPage.evaluate
      .mockResolvedValueOnce(mockEvents)
      .mockResolvedValueOnce(mockFightCardDetails)
      .mockResolvedValueOnce([])

    const result = await scrape()

    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1)
    expect(mockPage.goto).toHaveBeenCalledTimes(3)
    expect(mockPage.evaluate).toHaveBeenCalledTimes(3)

    expect(result).toEqual([
      {
        title: 'UFC 1',
        link: 'http://event1.com',
        fights: mockFightCardDetails,
      },
      {
        title: 'Bellator 2',
        link: 'http://event2.com',
        fights: [],
      },
    ])
  })
  it('should return empty array when no events fetched', async () => {
    mockPage.evaluate.mockResolvedValueOnce([])
    const result = await scrape()
    expect(result).toEqual([])
    expect(mockPage.goto).toHaveBeenCalledTimes(1)
  })
})
