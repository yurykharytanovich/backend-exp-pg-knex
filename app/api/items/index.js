import express from 'express';
import { ROUTES } from '../../constants';
import * as get from './get';
import * as post from './post';
import * as put from './put';
import { deleteItem } from './delete';

const router = express.Router();

router.get(ROUTES.ITEMS.GET_ALL, get.getAllItems);
router.get(ROUTES.ITEMS.GET, get.getItemById);

router.post(ROUTES.ITEMS.ADD, post.addItem);

router.put(ROUTES.ITEMS.UPDATE, put.updateItem);

router.delete(ROUTES.ITEMS.DELETE, deleteItem);

export default router;
