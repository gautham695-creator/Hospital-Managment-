import express from 'express';
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPrescriptions);
router.get('/:id', protect, getPrescriptionById);
router.post('/', protect, authorize('doctor'), createPrescription);
router.put('/:id', protect, authorize('doctor', 'admin'), updatePrescription);
router.delete('/:id', protect, authorize('admin'), deletePrescription);

export default router;
