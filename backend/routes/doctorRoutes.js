import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getMyProfile,
  createDoctor,
  updateDoctor,
  updateSchedule,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/me', protect, authorize('doctor'), getMyProfile);
router.get('/:id', getDoctorById);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, updateDoctor);
router.put('/:id/schedule', protect, authorize('doctor', 'admin'), updateSchedule);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
