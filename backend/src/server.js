import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import chatRouter from './routes/chat.js';
import { getSchema } from './services/database.js';

// Load environment variables
dotenv.config();

const app = express();

console.log('PORT:', process.env.PORT);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', chatRouter);

// Schema endpoint (for debugging)
app.get('/api/schema', async (req, res) => {
  try {
    const schema = await getSchema();
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schema' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
// Bind to 0.0.0.0 to accept connections from outside the container (required for Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Chat API available at http://0.0.0.0:${PORT}/api/chat`);
});
