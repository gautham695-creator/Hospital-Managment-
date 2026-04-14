import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    medicines: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
      },
    ],
    notes: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ appointment: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
