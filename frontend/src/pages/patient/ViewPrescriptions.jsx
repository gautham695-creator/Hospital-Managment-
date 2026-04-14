import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { prescriptionService } from '../../services/prescriptionService';

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionService.getPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Prescriptions</h1>

        {prescriptions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {prescription.doctor?.name}
                    </h3>
                    <p className="text-sm text-gray-600">{prescription.doctor?.specialization}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {prescription.diagnosis && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-1">Diagnosis:</h4>
                    <p className="text-gray-900">{prescription.diagnosis}</p>
                  </div>
                )}

                {prescription.medicines && prescription.medicines.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Medicines:</h4>
                    <div className="space-y-2">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium text-gray-900">{medicine.name}</p>
                          <p className="text-sm text-gray-600">
                            Dosage: {medicine.dosage} | Frequency: {medicine.frequency} | Duration: {medicine.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prescription.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
                    <p className="text-gray-900">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewPrescriptions;
