import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BookForm = ({ books, setBooks, editingBook, setEditingBook }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ title: '', author: '', genre: '', isbn: '', dateOfPublication: '', copies: '' });

    useEffect(() => {
        if (editingBook) {
            setFormData({
                title: editingBook.title,
                author: editingBook.author,
                genre: editingBook.genre,
                isbn: editingBook.isbn,
                dateOfPublication: editingBook.dateOfPublication,
                copies: editingBook.copies,
            });
        } else {
            setFormData({ title: '', author: '', genre: '', isbn: '', dateOfPublication: '', copies: '' });
        }
    }, [editingBook]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                const response = await axiosInstance.put(`/api/books/${editingBook._id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBooks(books.map((book) => (book._id === response.data._id ? response.data : book)));
            } else {
                const response = await axiosInstance.post('/api/books', formData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBooks([...books, response.data]);
            }
            setEditingBook(null);
            setFormData({ title: '', author: '', genre: '', isbn: '', dateOfPublication: '', copies: '' });
        } catch (error) {
            alert('Failed to save book.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
            <h1 className="text-2xl font-bold mb-4">{editingBook ? 'Edit Book' : 'Register Book'}</h1>
            <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <input
                type="text"
                placeholder="Author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <input
                type="text"
                placeholder="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <input
                type="text"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <input
                type="date"
                value={formData.dateOfPublication}
                onChange={(e) => setFormData({ ...formData, dateOfPublication: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <input
                type="text"
                placeholder="Copies"
                value={formData.copies}
                onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                {editingBook ? 'Update Button' : 'Create Button'}
            </button>
        </form>
    );
};

export default BookForm;
