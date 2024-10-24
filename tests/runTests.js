
const runTests = async () => {
    try {
        await connectDB();
        await testReferralSystem();
        console.log('All tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Tests failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};

