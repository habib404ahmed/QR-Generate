const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
      index: true,
    },
    groupNumber: {
      type: Number,
      required: [true, 'Assigned group number is required'],
      index: true,
    },
    registeredDate: {
      type: String, // YYYY-MM-DD
    },
    registeredTime: {
      type: String, // HH:MM:SS
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast searching and group queries
studentSchema.index({ groupNumber: 1, department: 1 });

module.exports = mongoose.model('Student', studentSchema);
