import dotenv from 'dotenv';
dotenv.config();

const config = {
  mongoUri: process.env.MONGO_URI || '',
};

export default config;