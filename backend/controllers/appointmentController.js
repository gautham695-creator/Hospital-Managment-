import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      appointments = await Appointment.find({ patient: patient._id })
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .sort({ appointmentDate: -1 });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .sort({ appointmentDate: -1 });
    } else {
      // Admin can see all appointments
      appointments = await Appointment.find()
        .populate('patient', 'name age gender')
        .populate('doctor', 'name specialization')
        .sort({ appointmentDate: -1 });
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (appointment.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (appointment.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // Find patient
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment slot is already taken
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      status: 'pending',
    });

    const createdAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization');

    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctor, Admin)
export const updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Doctors can only update their own appointments
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
    }

    appointment.status = status || appointment.status;
    appointment.notes = notes !== undefined ? notes : appointment.notes;

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization');

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Patients can delete their own appointments, doctors and admins can delete any
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (appointment.patient.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
