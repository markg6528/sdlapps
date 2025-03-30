import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const LoanForm = ({ loans, setLoans, editingLoan, setEditingLoan }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ book: '', loanee: '', dueDate: '' });

  useEffect(() => {
    if (editingLoan) {
      setFormData({
        book: editingLoan.book,
        loanee: editingLoan.loanee,
        dueDate: editingLoan.dueDate,
      });
    } else {
      setFormData({ book: '', loan: '', dueDate: '' });
    }
  }, [editingLoan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoan) {
        const response = await axiosInstance.put(`/api/loans/${editingLoan._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLoans(loans.map((loan) => (loan._id === response.data._id ? response.data : loan)));
      } else {
        const response = await axiosInstance.post('/api/loans', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLoans([...loans, response.data]);
      }
      setEditingLoan(null);
      setFormData({ book: '', loanee: '', dueDate: '' });
    } catch (error) {
      alert('Failed to save loan.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingLoan ? 'Edit Loan' : 'Register Loan'}</h1>
      <input
        type="text"
        placeholder="Book"
        value={formData.book}
        onChange={(e) => setFormData({ ...formData, book: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Loanee"
        value={formData.loanee}
        onChange={(e) => setFormData({ ...formData, loanee: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingLoan ? 'Update Button' : 'Create Button'}
      </button>
    </form>
  );
};

export default LoanForm;
