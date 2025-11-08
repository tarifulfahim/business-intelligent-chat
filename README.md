# Business Intelligence Chat System - Iteration 3

A conversational interface for querying business data using natural language, powered by Google Gemini AI with context-aware follow-up conversations.

## Overview

This is Iteration 3 of the BI Chat System featuring:
- ✅ Chat UI with message history
- ✅ PostgreSQL Northwind database integration
- ✅ **LLM-powered SQL generation using Google Gemini**
- ✅ **Dynamic query understanding for any business question**
- ✅ **Context Management with LangChain Memory**
- ✅ **Follow-up questions with pronoun resolution (they, them, those)**
- ✅ **Multi-turn conversations with entity tracking**
- ✅ Data visualization (tables and metric cards)

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Axios

**Backend:**
- Node.js + Express
- PostgreSQL (Northwind database)
- Google Gemini API (gemini-2.5-flash)
- LangChain (BufferWindowMemory for conversation context)
- SQL validation & security
- CORS enabled

## Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- Northwind database set up
- **Google Gemini API key** ([Get it here](https://aistudio.google.com/app/apikey))

## Setup Instructions

### 1. Database Setup

First, ensure PostgreSQL is running and create the Northwind database:

```bash
# Create database
createdb northwind

# Import the schema and data
psql northwind < northwind_psql/northwind.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials AND Gemini API key
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=northwind
# DB_PASSWORD=your_password
# DB_PORT=5432
# GEMINI_API_KEY=your_gemini_api_key_here

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:3001` (or 3000 if backend uses different port)

## Usage

Once both servers are running:

1. Open your browser to `http://localhost:3001`
2. You'll see the chat interface with sample questions
3. Ask **any** business question in natural language!

### Single Questions
   - "Show me top customers by revenue"
   - "What's our total revenue?"
   - "Show me top selling products"
   - "Revenue by product category"
   - "Which customers are from Germany?"
   - "What's the average order value?"
   - "List all products in the Beverages category"
   - "Show employee sales performance"

### Multi-Turn Conversations (NEW in Iteration 3!)
The system now understands context and can handle follow-up questions:

**Example 1: Pronoun Resolution**
- You: "Show me top 5 customers by revenue"
- AI: [Returns top 5 customers]
- You: "What products are they buying?"
- AI: [Returns products for those 5 customers]

**Example 2: Product Investigation**
- You: "Show products in the Beverages category"
- AI: [Returns beverages]
- You: "Which customers buy them?"
- AI: [Returns customers who buy those products]

**Example 3: Filtering**
- You: "Show all orders"
- AI: [Returns orders]
- You: "Filter to just Germany"
- AI: [Returns orders from Germany]

**Start New Conversation:**
Click the "New Chat" button to clear context and start fresh!

## Project Structure

```
bi-chat/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.js          # Chat API endpoint
│   │   ├── services/
│   │   │   ├── database.js      # PostgreSQL connection
│   │   │   ├── llm.js           # Gemini AI integration
│   │   │   ├── promptBuilder.js # Prompt construction
│   │   │   └── chatResponse.js  # Main chat handler
│   │   ├── utils/
│   │   │   └── sqlValidator.js  # SQL security validation
│   │   └── server.js            # Express app
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx    # Main chat component
│   │   ├── DataTable.tsx        # Table visualization
│   │   ├── MetricCard.tsx       # Metric display
│   │   └── ui/                  # shadcn components
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   └── package.json
│
├── northwind_psql/
│   └── northwind.sql            # Database schema & data
│
└── README.md
```

## API Endpoints

### POST /api/chat
Send a chat message and get a response with data.

**Request:**
```json
{
  "message": "Show me top customers"
}
```

**Response:**
```json
{
  "answer": "Here are the top 10 customers by total revenue",
  "data": [...],
  "visualization": "table",
  "sql": "SELECT ..."
}
```

### GET /api/chat/sample-questions
Get list of available sample questions.

**Response:**
```json
{
  "questions": ["Show me top customers", ...]
}
```

### GET /api/schema
Get database schema (for debugging).

## Success Criteria

### Iteration 1 (Completed)
- ✅ Chat interface renders messages
- ✅ Database contains realistic sample data (Northwind DB)
- ✅ Server responds to predefined questions
- ✅ Can display results in tables and metric cards

### Iteration 2 (Completed)
- ✅ LLM generates valid SQL from natural language
- ✅ System handles unlimited question types (not limited to predefined)
- ✅ SQL validation and security (blocks dangerous queries)
- ✅ Response time < 5 seconds
- ✅ Handles both business and non-business questions gracefully
- ✅ Auto-detection of visualization type (table vs metric)

### Iteration 3 (Current)
- ✅ Conversation context management with LangChain
- ✅ Pronoun resolution (they, them, those)
- ✅ Entity extraction from query results
- ✅ Multi-turn conversations (5 message history)
- ✅ Context-aware SQL generation
- ✅ New conversation button to clear context
- ✅ Conversation ID tracking across messages

## Features

### 🤖 AI-Powered Query Generation
- Uses Google Gemini to understand natural language questions
- Automatically generates optimized PostgreSQL queries
- Intelligent visualization selection (table vs metrics)

### 🔒 Security
- SQL injection prevention with keyword blocking
- Whitelist-based table validation
- Automatic LIMIT clause enforcement (max 100 rows)
- Read-only queries (SELECT only)

### 💬 Context-Aware Conversations (NEW!)
- **LangChain BufferWindowMemory** for conversation history (last 5 exchanges)
- **Pronoun resolution**: Understands "they", "them", "those" references
- **Entity extraction**: Tracks customer IDs, product IDs, categories, etc.
- **Follow-up questions**: Build on previous queries naturally
- **Session management**: Isolated conversations with conversation_id
- **New chat button**: Start fresh conversations anytime

### 🎯 Flexible Conversation
- Handles business questions with SQL generation
- Gracefully responds to non-business questions
- Clear error messages and suggestions

## Next Steps (Future Iterations)

- Iteration 4: Advanced visualizations (charts, graphs)
- Iteration 5: Query caching and performance optimization
- Iteration 6: Export results to CSV/Excel

## License

MIT
