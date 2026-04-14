import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (for appointment booking)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phone');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current doctor's profile
// @route   GET /api/doctors/me
// @access  Private (Doctor)
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email, experience, qualifications } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'temp123', // Should be changed by doctor
        role: 'doctor',
        phone,
      });
    }

    const doctor = await Doctor.create({
      user: user._id,
      name,
      specialization,
      phone,
      email,
      experience: experience || 0,
      qualifications: qualifications || [],
      schedule: {
        days: [],
        timeSlots: [],
      },
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Doctors can only update their own profile
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this doctor' });
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor schedule
// @route   PUT /api/doctors/:id/schedule
// @access  Private (Doctor, Admin)
export const updateSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Doctors can only update their own schedule
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this schedule' });
      }
    }

    const { days, timeSlots } = req.body;

    doctor.schedule = {
      days: days || doctor.schedule.days,
      timeSlots: timeSlots || doctor.schedule.timeSlots,
    };

    const updatedDoctor = await doctor.save();

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(doctor.user);

    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
