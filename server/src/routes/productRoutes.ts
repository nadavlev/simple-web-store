import express, { Request, Response, Router } from 'express';

import { connection } from '../index';
import { Product } from '../model/Product';

const router: Router = express.Router();

// GET all products
router.get('/', async (_req: Request, res: Response) => {
  if (connection.db) {
    const productsCollection = await connection.db.collection('products');
    const products = await productsCollection.find({}).toArray();
    res.status(200).json(products);
  } else {
    res.status(500).json({ message: 'Database connection is not established' });
  }
});

export default router;
