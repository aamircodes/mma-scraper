import { storeData, fetchData } from '../services/eventService.js'
import Event from '../models/Event.js'

jest.mock('../models/Event.js')

describe('Event Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('storeData', () => {
    it('should store data successfully', async () => {
      const mockData = [{ title: 'Event 1' }]
      const mockStoredData = {
        events: mockData,
        updatedAt: new Date(),
      }

      Event.deleteMany.mockResolvedValue()
      Event.create.mockResolvedValue(mockStoredData)

      const result = await storeData(mockData)

      expect(Event.deleteMany).toHaveBeenCalledTimes(1)
      expect(Event.create).toHaveBeenCalledWith({
        events: mockData,
        updatedAt: expect.any(Date),
      })
      expect(result).toEqual(mockStoredData)
    })

    it('should throw an error if storing data fails', async () => {
      const mockData = [{ title: 'Event 1' }]
      Event.deleteMany.mockResolvedValue()
      Event.create.mockRejectedValue(new Error('Database error'))

      await expect(storeData(mockData)).rejects.toThrow(
        'Error storing events: Database error'
      )

      expect(Event.deleteMany).toHaveBeenCalledTimes(1)
      expect(Event.create).toHaveBeenCalledWith({
        events: mockData,
        updatedAt: expect.any(Date),
      })
    })
  })

  describe('fetchData', () => {
    it('should fetch data successfully', async () => {
      const mockEventData = {
        events: [{ title: 'Event 1' }],
        updatedAt: new Date(),
      }

      Event.findOne.mockResolvedValue(mockEventData)

      const result = await fetchData()

      expect(Event.findOne).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockEventData)
    })

    it('should throw an error if no events are found', async () => {
      Event.findOne.mockResolvedValue(null)

      await expect(fetchData()).rejects.toThrow('No events found')

      expect(Event.findOne).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if fetching data fails', async () => {
      Event.findOne.mockRejectedValue(new Error('Database error'))

      await expect(fetchData()).rejects.toThrow(
        'Error fetching events: Database error'
      )

      expect(Event.findOne).toHaveBeenCalledTimes(1)
    })
  })
})
