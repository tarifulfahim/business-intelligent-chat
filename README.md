# Business Intelligence Chat System - Iteration 3

A conversational interface for querying business data using natural language, powered by Google Gemini AI with context-aware follow-up conversations.

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

Use the provided sql file `nortwhind.sql` in order to populate your database.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
yarn

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
yarn dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
yarn

# Create .env.local file
cp .env.local.example .env.local

# Start the frontend
yarn dev
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


## Next Steps (Future Iterations)

- Iteration 4: Advanced visualizations (charts, graphs)
- Iteration 5: Query caching and performance optimization
- Iteration 6: Export results to CSV/Excel

## License

MIT
