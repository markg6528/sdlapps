import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import BookForm from '../components/BookForm';
import BookList from '../components/BookList';
import { useAuth } from '../context/AuthContext';

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/books', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBooks(response.data);
      } catch (error) {
        alert('Failed to fetch books.');
      }
    };

    fetchBooks();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <BookForm
        books={books}
        setBooks={setBooks}
        editingBook={editingBook}
        setEditingBook={setEditingBook}
      />
      <BookList books={books} setBooks={setBooks} setEditingBook={setEditingBook} />
    </div>
  );
};

export default Books;
