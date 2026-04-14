import mongoose from 'mongoose';

const patientSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    medicalHistory: {
      type: String,
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
    },
    previousVisits: [
      {
        date: {
          type: Date,
        },
        doctor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        reason: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
patientSchema.index({ user: 1 });
patientSchema.index({ email: 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
