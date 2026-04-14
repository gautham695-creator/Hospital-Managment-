import express from 'express';
import {
  getPatients,
  getPatientById,
  getMyProfile,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, authorize('patient'), getMyProfile);
router.get('/', protect, authorize('admin', 'doctor'), getPatients);
router.get('/:id', protect, getPatientById);
router.post('/', protect, authorize('admin', 'doctor'), createPatient);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, authorize('admin'), deletePatient);

export default router;
