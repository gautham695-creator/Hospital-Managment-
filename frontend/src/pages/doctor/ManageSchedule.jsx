import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { doctorService } from '../../services/doctorService';

const ManageSchedule = () => {
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState({
    days: [],
    timeSlots: [],
  });
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await doctorService.getMyProfile();
      setProfile(data);
      setSchedule(data.schedule || { days: [], timeSlots: [] });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleDayToggle = (day) => {
    const updatedDays = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day];
    
    setSchedule({
      ...schedule,
      days: updatedDays,
    });
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.day || !newTimeSlot.startTime || !newTimeSlot.endTime) {
      setError('Please fill all fields');
      return;
    }

    setSchedule({
      ...schedule,
      timeSlots: [...schedule.timeSlots, { ...newTimeSlot }],
    });

    setNewTimeSlot({
      day: '',
      startTime: '',
      endTime: '',
    });
    setError('');
  };

  const handleRemoveTimeSlot = (index) => {
    setSchedule({
      ...schedule,
      timeSlots: schedule.timeSlots.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await doctorService.updateSchedule(profile._id, schedule);
      setSuccess('Schedule updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Schedule</h1>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Available Days</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.days.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Time Slots</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={newTimeSlot.day}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, day: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day} className="capitalize">{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Start Time"
                />
                <input
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="End Time"
                />
                <button
                  onClick={handleAddTimeSlot}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              {schedule.timeSlots.length > 0 && (
                <div className="space-y-2">
                  {schedule.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-sm">
                        <span className="font-medium capitalize">{slot.day}</span>: {slot.startTime} - {slot.endTime}
                      </span>
                      <button
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ManageSchedule;
