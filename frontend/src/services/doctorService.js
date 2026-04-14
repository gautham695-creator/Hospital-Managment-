import api from './api';

export const doctorService = {
  getDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/doctors/me');
    return response.data;
  },

  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`/doctors/${id}/schedule`, scheduleData);
    return response.data;
  },
};
