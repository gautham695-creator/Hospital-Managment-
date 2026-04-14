import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService } from '../../services/patientService';

const AddPrescription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointment');
  const patientId = searchParams.get('patient');

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    appointmentId: appointmentId || '',
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!patientId) {
      fetchPatients();
    }
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData({
      ...formData,
      medicines: updatedMedicines,
    });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '' }],
    });
  };

  const removeMedicine = (index) => {
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Filter out empty medicines
    const validMedicines = formData.medicines.filter(
      med => med.name && med.dosage && med.frequency && med.duration
    );

    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      setLoading(false);
      return;
    }

    try {
      await prescriptionService.createPrescription({
        patientId: formData.patientId,
        appointmentId: formData.appointmentId || null,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        medicines: validMedicines,
      });
      setSuccess('Prescription added successfully!');
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Prescription</h1>

        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!patientId && (
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                id="diagnosis"
                name="diagnosis"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medicines</label>
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg)"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Frequency (e.g., Twice daily)"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Duration (e.g., 7 days)"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMedicine}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Medicine
              </button>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Prescription'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddPrescription;
