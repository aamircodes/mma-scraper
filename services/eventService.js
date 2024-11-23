import Event from '../models/Event.js'

const storeData = async (data) => {
  try {
    await Event.deleteMany({})
    const storedData = await Event.create({
      events: data,
      updatedAt: new Date(),
    })
    return storedData
  } catch (error) {
    throw new Error(`Error storing events: ${error.message}`)
  }
}

const fetchData = async () => {
  try {
    const eventData = await Event.findOne({})
    if (!eventData) throw new Error('No events found')
    return eventData
  } catch (error) {
    throw new Error(`Error fetching events: ${error.message}`)
  }
}

export { storeData, fetchData }
