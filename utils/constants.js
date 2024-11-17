import dotenv from 'dotenv'

dotenv.config()

export const BASE_URL = process.env.BASE_URL
export const MAJOR_PROMOTIONS = ['UFC', 'PFL', 'BELLATOR', 'RIZIN']
export const MAX_PROMOTIONS = 10
