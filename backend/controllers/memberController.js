const Member = require('../models/Member');

const getMembers = async (req,res) => {
    try {
        const members = await Member.find({ userId: req.user.id });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message}) 
    }
};

const addMember = async (req,res) => {
    const { name, dateOfBirth, gender } = req.body;
    try {
        const member = await Member.create({ userId: req.user.id, name, gender, dateOfBirth });
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMember = async (req,res) => {
    const { name, dateOfBirth, gender } = req.body;
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        member.name = name || member.name;
        member.gender = gender || member.gender;
        member.dateOfBirth = dateOfBirth || member.dateOfBirth;
        const updatedMember = await member.save();
        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMember = async (req,res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        await member.remove();
        res.json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMembers, addMember, updateMember, deleteMember };

