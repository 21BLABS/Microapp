

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Referral = require('../models/Referral');

// Add direct console logging alongside logger
const testLog = (message) => {
    console.log(message);
    if (logger) logger.info(message);
};

const testError = (message) => {
    console.error(message);
    if (logger) logger.error(message);
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected for Testing...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const testReferralSystem = async () => {
    try {
        console.log('\n=== Starting Referral System Test ===\n');

        // 1. Create test users
        console.log('Step 1: Creating test users...');
        const user1 = await User.create({
            telegramId: "test_user_1",
            username: "testUser1",
            firstName: "Test",
            lastName: "User1",
            xp: 0,
            compute: 0,
            computePower: 1
        });

        const user2 = await User.create({
            telegramId: "test_user_2",
            username: "testUser2",
            firstName: "Test",
            lastName: "User2",
            xp: 0,
            compute: 0,
            computePower: 1
        });

        console.log(`Created users: ${user1.username} and ${user2.username}`);

        // 2. Generate referral code
        console.log('\nStep 2: Generating referral code...');
        user1.referralCode = "TEST123";
        await user1.save();
        console.log(`Generated referral code: ${user1.referralCode}`);

        // 3. Apply referral
        console.log('\nStep 3: Applying referral code...');
        user2.referredBy = user1._id;
        user1.referrals.push(user2._id);
        
        const referral = await Referral.create({
            referrer: user1._id,
            referred: user2._id,
            code: user1.referralCode,
            tier: 1,
            dateReferred: new Date(),
            isActive: true
        });

        await Promise.all([user1.save(), user2.save()]);
        console.log('Referral relationship established');

        // 4. Test XP distribution
        console.log('\nStep 4: Testing XP distribution...');
        const xpGained = 100;
        user2.xp += xpGained;
        await user2.save();
        console.log(`User2 gained ${xpGained} XP`);

        const referralReward = Math.floor(xpGained * 0.1);
        user1.xp += referralReward;
        user1.totalReferralXP = (user1.totalReferralXP || 0) + referralReward;
        
        referral.totalRewardsDistributed += referralReward;
        referral.lastRewardDate = new Date();
        
        await Promise.all([user1.save(), referral.save()]);
        console.log(`Referral reward of ${referralReward} XP distributed to User1`);

        // 5. Verify results
        console.log('\nStep 5: Verifying results...');
        
        const updatedUser1 = await User.findById(user1._id);
        const updatedUser2 = await User.findById(user2._id);
        const updatedReferral = await Referral.findById(referral._id);

        console.log('\nTest Results:');
        console.log('=============');
        console.log('Referrer (User1):');
        console.log(`- Username: ${updatedUser1.username}`);
        console.log(`- Referral Code: ${updatedUser1.referralCode}`);
        console.log(`- Final XP: ${updatedUser1.xp}`);
        console.log(`- Total Referral XP: ${updatedUser1.totalReferralXP}`);
        console.log(`- Number of Referrals: ${updatedUser1.referrals.length}`);
        
        console.log('\nReferred User (User2):');
        console.log(`- Username: ${updatedUser2.username}`);
        console.log(`- XP: ${updatedUser2.xp}`);
        console.log(`- Referred By: ${updatedUser2.referredBy}`);
        
        console.log('\nReferral Record:');
        console.log(`- Code Used: ${updatedReferral.code}`);
        console.log(`- Total Rewards: ${updatedReferral.totalRewardsDistributed}`);
        console.log(`- Is Active: ${updatedReferral.isActive}`);

        // 6. Cleanup
        console.log('\nStep 6: Cleaning up test data...');
        await Promise.all([
            User.deleteMany({ telegramId: { $in: ["test_user_1", "test_user_2"] } }),
            Referral.deleteMany({ _id: referral._id })
        ]);

        console.log('\n=== Referral System Test Completed Successfully! ===\n');
        
    } catch (error) {
        console.error('\nTest failed:', error);
        // Cleanup on error
        await User.deleteMany({ telegramId: { $in: ["test_user_1", "test_user_2"] } });
        throw error;
    }
};

