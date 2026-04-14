import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.post('/', protect, authorize('patient'), createAppointment);
router.put('/:id', protect, authorize('doctor', 'admin'), updateAppointment);
router.delete('/:id', protect, deleteAppointment);

export default router;
