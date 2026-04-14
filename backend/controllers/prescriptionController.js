import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      prescriptions = await Prescription.find({ patient: patient._id })
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .populate('appointment')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      prescriptions = await Prescription.find({ doctor: doctor._id })
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .populate('appointment')
        .sort({ createdAt: -1 });
    } else {
      // Admin can see all prescriptions
      prescriptions = await Prescription.find()
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .populate('appointment')
        .sort({ createdAt: -1 });
    }

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (prescription.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (prescription.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
export const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes, diagnosis } = req.body;

    // Find doctor
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      if (appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized for this appointment' });
      }
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      medicines: medicines || [],
      notes,
      diagnosis,
    });

    const createdPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization')
      .populate('appointment');

    res.status(201).json(createdPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor, Admin)
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Doctors can only update their own prescriptions
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (prescription.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this prescription' });
      }
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization')
      .populate('appointment');

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Admin)
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({ message: 'Prescription removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
