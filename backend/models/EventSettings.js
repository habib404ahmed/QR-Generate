const mongoose = require('mongoose');

const eventSettingsSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: 'Freshers Orientation 2026',
      trim: true,
    },
    collegeName: {
      type: String,
      default: 'Your College',
      trim: true,
    },
    collegeLogo: {
      type: String,
      default: '',
      trim: true,
    },
    totalStudents: {
      type: Number,
      default: 80,
      min: 1,
    },
    studentsPerGroup: {
      type: Number,
      default: 5,
      min: 1,
    },
    totalGroups: {
      type: Number,
      default: 16,
      min: 1,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    departments: {
      type: [String],
      default: ['BCA', 'B.Tech'],
    },
    networkMode: {
      type: String,
      enum: ['local', 'public'],
      default: 'local',
    },
    publicDomain: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Singleton helper to get or create settings
eventSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      eventName: 'Freshers Orientation 2026',
      collegeName: 'Your College',
      totalStudents: 80,
      studentsPerGroup: 5,
      totalGroups: 16,
      registrationOpen: true,
      departments: ['BCA', 'B.Tech'],
      networkMode: 'local',
      publicDomain: '',
    });
  }
  return settings;
};

module.exports = mongoose.model('EventSettings', eventSettingsSchema);
