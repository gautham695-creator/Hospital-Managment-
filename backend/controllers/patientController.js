import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin, Doctor)
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'name email phone');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Patients can only view their own profile
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      if (patientProfile._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to view this patient' });
      }
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's patient profile
// @route   GET /api/patients/me
// @access  Private (Patient)
export const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phone');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create patient profile
// @route   POST /api/patients
// @access  Private (Admin, Doctor)
export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, email, address, medicalHistory, allergies } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'temp123', // Should be changed by patient
        role: 'patient',
        phone,
        address,
      });
    }

    const patient = await Patient.create({
      user: user._id,
      name,
      age,
      gender,
      phone,
      email,
      address,
      medicalHistory,
      allergies: allergies || [],
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Patients can only update their own profile
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      if (patientProfile._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this patient' });
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Patient.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(patient.user);

    res.json({ message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
