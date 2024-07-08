import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import connectDB from './utils/db';
import schema from './schema';
import { websiteResolver } from './resolvers/websiteResolver';
import routes from './routes';

const app = express();

app.use(express.json());
// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/api', routes);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: websiteResolver,
  graphiql: true,
}));

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Unexpected error occurred' });
  }
});

connectDB().catch((error) => {
  if (error instanceof Error) {
    console.error('MongoDB connection error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});