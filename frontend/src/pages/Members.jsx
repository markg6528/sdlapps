import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import MemberForm from '../components/MemberForm';
import MemberList from '../components/MemberList';
import { useAuth } from '../context/AuthContext';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axiosInstance.get('/api/members', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMembers(response.data);
      } catch (error) {
        alert('Failed to fetch members.');
      }
    };

    fetchMembers();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <MemberForm
        members={members}
        setMembers={setMembers}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
      />
      <MemberList members={members} setMembers={setMembers} setEditingMember={setEditingMember} />
    </div>
  );
};

export default Members;
