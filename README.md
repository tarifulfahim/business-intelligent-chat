# Business Intelligence Chat System - Iteration 1

A conversational interface for querying business data using natural language.

## Overview

This is Iteration 1 of the BI Chat System featuring:
- ✅ Chat UI with message history
- ✅ PostgreSQL Northwind database integration
- ✅ Express backend with hardcoded responses
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
- CORS enabled

## Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- Northwind database set up

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

# Edit .env with your database credentials
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=northwind
# DB_PASSWORD=your_password
# DB_PORT=5432

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
3. Click on a sample question or type your own:
   - "Show me top customers"
   - "What's our total revenue?"
   - "Show me top products"
   - "Revenue by category"
   - "Show orders by country"
   - "Employee performance"

## Project Structure

```
bi-chat/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.js          # Chat API endpoint
│   │   ├── services/
│   │   │   ├── database.js      # PostgreSQL connection
│   │   │   └── hardcodedResponses.js  # Predefined Q&A
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

## Iteration 1 Success Criteria

- ✅ Chat interface renders messages
- ✅ Database contains realistic sample data (Northwind DB)
- ✅ Server responds to 6 predefined questions
- ✅ Can display results in tables and metric cards


## Next Steps (Future Iterations)

- Iteration 2: LLM integration for dynamic SQL generation
- Iteration 3: Context management for follow-up questions
- Iteration 4: Advanced visualizations (charts, graphs)

## License

MIT
