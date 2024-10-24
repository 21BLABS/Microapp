
const crypto = require('crypto');

const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const validateReferralCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return code.length === 8 && /^[0-9A-F]{8}$/i.test(code);
};

const calculateReferralReward = (level, xp) => {
  if (typeof level !== 'number' || typeof xp !== 'number') {
    throw new Error('Invalid parameters for reward calculation');
  }
  if (level < 1 || level > 3) {
    throw new Error('Invalid referral level');
  }
  if (xp < 0) {
    throw new Error('Invalid XP amount');
  }
  
  const percentages = [0.1, 0.05, 0.025];
  return Math.floor(xp * (percentages[level - 1] || 0));
};

module.exports = {
  generateReferralCode,
  validateReferralCode,
  calculateReferralReward
};
