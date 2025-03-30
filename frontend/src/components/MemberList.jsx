import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const MemberList = ({ members, setMembers, setEditingMember }) => {
    const { user } = useAuth();

    const handleDelete = async (memberId) => {
        try {
            await axiosInstance.delete(`/api/members/${memberId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setMembers(members.filter((member) => member._id !== memberId));
        } catch (error) {
            alert('Failed to delete member.');
        }
    };

    return (
        <div>
            {members.map((member) => (
                <div key={member._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
                    <h2 className="font-bold">{member.name}</h2>
                    <p>{member.gender}</p>
                    <p className="text-sm text-gray-500">Date of Birth: {new Date(member.dateOfBirth).toLocaleDateString()}</p>
                    <div className="mt-2">
                        <button
                            onClick={() => setEditingMember(member)}
                            className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(member._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MemberList;
