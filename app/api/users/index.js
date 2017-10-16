import express from 'express'
import { ROUTES } from '../../constants'
import * as get from './get'
import * as post from './post'
import * as put from './put'
import { deleteAllItemsFromUser, deleteItemFromUser, deleteUser } from './delete'

const router = express.Router()

router.get(ROUTES.USERS.GET_ALL, get.getAllUsers)
router.get(ROUTES.USERS.GET, get.getUserById)
router.get(ROUTES.USERS.GET_ITEMS, get.getAllItemsOfUser)

router.post(ROUTES.USERS.ADD, post.addUser)
router.post(ROUTES.USERS.ADD_ITEMS, post.addItemsToUser)

router.put(ROUTES.USERS.UPDATE, put.updateUser)

router.delete(ROUTES.USERS.DELETE, deleteUser)
router.delete(ROUTES.USERS.DELETE_ITEM, deleteItemFromUser)
router.delete(ROUTES.USERS.DELETE_ALL_ITEMS, deleteAllItemsFromUser)

export default router
