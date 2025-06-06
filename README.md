
# Email Dataset Processor

## Description

This Node.js backend allows users to upload a bulk dataset of email addresses (via CSV), and processes them in the background to categorize them as **work** or **personal** emails based on domain.

Users can:
- Upload a file via `/upload`
- Track processing status using `/status/{request_id}`

A background worker:
- Processes emails in batches of 100
- Waits ~2 seconds per email to simulate real-world processing
- Updates status and counts in Supabase

---

## Technologies Used

- Node.js (ES6 modules)
- Express.js
- Supabase (PostgreSQL + REST API)
- Joi (validation)
- Multer + CSV Parser (file handling)

---

## Supabase Table Setup

Run these SQL commands in the **Supabase SQL Editor** to set up required tables:

### 1. `requests` Table

```sql
CREATE TABLE upload_requests (
  id UUID PRIMARY KEY,
  status TEXT,
  total_entries INT,
  processed_entries INT DEFAULT 0,
  personal_count INT DEFAULT 0,
  work_count INT DEFAULT 0
);
```

### 2. `emails` Table

```sql
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  request_id UUID REFERENCES upload_requests(id),
  email TEXT,
  category TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing BOOLEAN DEFAULT FALSE
);
```


## Endpoints

- `POST /upload` – Upload a CSV file with emails
- `GET /status/:request_id` – Check processing status
