
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Book = require('../models/Book');
const { updateBook,getBooks,addBook,deleteBook } = require('../controllers/bookController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;


describe('AddBook Function Test', () => {

  it('should create a new book successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "Test Book", author: "Test Author", genre: "Test Genre", isbn: "Test ISBN", dateOfPublication: "2000-01-01", copies: 1 }
    };

    // Mock book that would be created
    const createdBook = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub Book.create to return the createdTask
    const createStub = sinon.stub(Book, 'create').resolves(createdBook);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addBook(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdBook)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Book.create to throw an error
    const createStub = sinon.stub(Book, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Book", author: "New Author", genre: "New Genre", isbn: "New ISBN", dateOfPublication: "2000-12-25", copies: 2 }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addBook(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});


describe('Update Function Test', () => {

  it('should update book successfully', async () => {
    // Mock book data
    const bookId = new mongoose.Types.ObjectId();
    const existingBook = {
      _id: bookId,
      title: "Old Book",
      author: "Old Author",
      genre: "Old Genre",
      isbn: "Old ISBN",
      dateOfPublication: new Date(),
      copies: 7,
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Book.findById to return mock task
    const findByIdStub = sinon.stub(Book, 'findById').resolves(existingBook);

    // Mock request & response
    const req = {
      params: { id: bookId },
      body: { title: "New Title", author: "New Author", copies: 9 }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateBook(req, res);

    // Assertions
    expect(existingBook.title).to.equal("New Title");
    expect(existingBook.author).to.equal("New Author");
    expect(existingBook.copies).to.equal(9);
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if book is not found', async () => {
    const findByIdStub = sinon.stub(Book, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateBook(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Book not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Book, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateBook(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});



describe('GetBook Function Test', () => {

  it('should return books for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock book data
    const books = [
      { _id: new mongoose.Types.ObjectId(), title: "Book 1", author: "Author 1", copies: 1, userId },
      { _id: new mongoose.Types.ObjectId(), title: "Book 2", author: "Author 2", copies: 2, userId }
    ];

    // Stub Book.find to return mock books
    const findStub = sinon.stub(Book, 'find').resolves(books);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getBooks(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(books)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Book.find to throw an error
    const findStub = sinon.stub(Book, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getBooks(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});



describe('DeleteBook Function Test', () => {

  it('should delete a book successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock book found in the database
    const book = { remove: sinon.stub().resolves() };

    // Stub Book.findById to return the mock book
    const findByIdStub = sinon.stub(Book, 'findById').resolves(book);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteBook(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(book.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Book deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if book is not found', async () => {
    // Stub Book.findById to return null
    const findByIdStub = sinon.stub(Book, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteBook(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Book not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Book.findById to throw an error
    const findByIdStub = sinon.stub(Book, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteBook(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});