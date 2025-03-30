
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Loan = require('../models/Loan');
const { updateLoan,getLoans,addLoan,deleteLoan } = require('../controllers/loanController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;


describe('AddLoan Function Test', () => {

  it('should create a new loan successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { book: "New Book", loanee: "New Loanee", dueDate: "2025-05-01" }
    };

    // Mock loan that would be created
    const createdLoan = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub Loan.create to return the createdTask
    const createStub = sinon.stub(Loan, 'create').resolves(createdLoan);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addLoan(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdLoan)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Loan.create to throw an error
    const createStub = sinon.stub(Loan, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { book: "New Book", loanee: "New Loanee", dueDate: "2025-09-10" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addLoan(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});


describe('Update Function Test', () => {

  it('should update loan successfully', async () => {
    // Mock loan data
    const loanId = new mongoose.Types.ObjectId();
    const existingLoan = {
      _id: loanId,
      book: "Old Book",
      loanee: "Old Loanee",
      dueDate: new Date(),
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Loan.findById to return mock task
    const findByIdStub = sinon.stub(Loan, 'findById').resolves(existingLoan);

    // Mock request & response
    const req = {
      params: { id: loanId },
      body: { book: "New Book", loanee: "New Loanee", dueDate: "2025-09-21" }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateLoan(req, res);

    // Assertions
    expect(existingLoan.book).to.equal("New Book");
    expect(existingLoan.loanee).to.equal("New Loanee");
    expect(existingLoan.dueDate).to.equal("2025-09-21");
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if loan is not found', async () => {
    const findByIdStub = sinon.stub(Loan, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateLoan(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Loan not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Loan, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateLoan(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});



describe('GetLoan Function Test', () => {

  it('should return loans for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock loan data
    const loans = [
      { _id: new mongoose.Types.ObjectId(), book: "Book 1", loanee: "Loanee 1", dueDate: "2025-10-31", userId },
      { _id: new mongoose.Types.ObjectId(), book: "Book 2", loanee: "Loanee 2", dueDate: "2025-11-01", userId }
    ];

    // Stub Loan.find to return mock loans
    const findStub = sinon.stub(Loan, 'find').resolves(loans);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getLoans(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(loans)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Loan.find to throw an error
    const findStub = sinon.stub(Loan, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getLoans(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});



describe('DeleteLoan Function Test', () => {

  it('should delete a loan successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock loan found in the database
    const loan = { remove: sinon.stub().resolves() };

    // Stub Loan.findById to return the mock loan
    const findByIdStub = sinon.stub(Loan, 'findById').resolves(loan);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteLoan(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(loan.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Loan deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if loan is not found', async () => {
    // Stub Loan.findById to return null
    const findByIdStub = sinon.stub(Loan, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteLoan(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Loan not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Loan.findById to throw an error
    const findByIdStub = sinon.stub(Loan, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteLoan(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});