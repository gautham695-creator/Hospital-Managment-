import mongoose from 'mongoose';

const doctorSchema = mongoose.Schema(
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
    specialization: {
      type: String,
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
    schedule: {
      days: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: [],
      },
      timeSlots: [
        {
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          startTime: {
            type: String,
          },
          endTime: {
            type: String,
          },
        },
      ],
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
