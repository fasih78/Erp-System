const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    id: { type: Number, default: 0 },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now() },
}, { timestamps: true });

const DepartmentModel = mongoose.model('Department', departmentSchema);

module.exports = DepartmentModel;
