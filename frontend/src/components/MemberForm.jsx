import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const MemberForm = ({ members, setMembers, editingMember, setEditingMember }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', gender: '', dateOfBirth: '' });

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        gender: editingMember.gender,
        dateOfBirth: editingMember.dateOfBirth,
      });
    } else {
      setFormData({ name: '', gender: '', dateOfBirth: '' });
    }
  }, [editingMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const response = await axiosInstance.put(`/api/members/${editingMember._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMembers(members.map((member) => (member._id === response.data._id ? response.data : member)));
      } else {
        const response = await axiosInstance.post('/api/members', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMembers([...members, response.data]);
      }
      setEditingMember(null);
      setFormData({ name: '', gender: '', dateOfBirth: '' });
    } catch (error) {
      alert('Failed to save member.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingMember ? 'Edit Member' : 'Register Member'}</h1>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Gender"
        value={formData.gender}
        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingMember ? 'Update Button' : 'Create Button'}
      </button>
    </form>
  );
};

export default MemberForm;
