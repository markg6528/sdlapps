const Loan = require('../models/Loan');

const getLoans = async (req,res) => {
    try {
        const loans = await Loan.find({ userId: req.user.id });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message}) 
    }
};

const addLoan = async (req,res) => {
    const { loanee, book, dueDate } = req.body;
    try {
        const loan = await Loan.create({ userId: req.user.id, loanee, book, dueDate });
        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLoan = async (req,res) => {
    const { loanee, book, dueDate } = req.body;
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        loan.book = book || loan.book;
        loan.loanee = loanee || loan.loanee;
        loan.dueDate = dueDate || loan.dueDate;
        const updateLoan = await loan.save();
        res.json(updateLoan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLoan = async (req,res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        await loan.remove();
        res.json({ message: 'Loan deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLoans, addLoan, updateLoan, deleteLoan };

