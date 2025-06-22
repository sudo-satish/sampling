import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  customerCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
campaignSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Campaign =
  mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
