import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from './addresses.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createAddressSchema, updateAddressSchema } from './addresses.validator';

const router = Router();

router.use(authenticate);

router.get('/', getAddresses);
router.post('/', validate({ body: createAddressSchema }), createAddress);
router.put('/:id', validate({ body: updateAddressSchema }), updateAddress);
router.delete('/:id', deleteAddress);

export default router;
export { router as addressesRouter };
