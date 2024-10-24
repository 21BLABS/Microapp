

const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  referred: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'active'
  },
  tier: { 
    type: Number, 
    required: true,
    min: 1,
    max: 3 
  },
  totalRewardsDistributed: { 
    type: Number, 
    default: 0 
  },
  dateReferred: { 
    type: Date, 
    default: Date.now 
  },
  lastRewardDate: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
referralSchema.index({ referrer: 1, dateReferred: -1 });
referralSchema.index({ code: 1, status: 1 });
referralSchema.index({ referred: 1, tier: 1 });

const Referral = mongoose.model('Referral', referralSchema);
