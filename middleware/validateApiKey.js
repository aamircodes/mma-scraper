const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.SECRET_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API key' })
  }
  next()
}

export default validateApiKey
