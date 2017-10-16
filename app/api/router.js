import express from 'express'
import { ROUTES } from '../constants'
import items from './items'
import users from './users'

const router = express.Router()

router.use(ROUTES.ITEMS.BASE, items)
router.use(ROUTES.USERS.BASE, users)

export default router
