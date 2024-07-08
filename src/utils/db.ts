import mongoose from 'mongoose';
import config from '../config';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, 
    //     {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,}
    );
    console.log('MongoDB connected');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

export default connectDB;