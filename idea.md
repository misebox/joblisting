# 📄 **Specification Document:jobparser and Viewer Web Application**

## 1. Overview

This system ingests text-based案件情報 (project listings), parses them into structured records, stores them in a database, and provides a lightweight web interface for viewing, flagging, and annotating each entry.
Stack: Node.js (Hono), SQLite/PostgreSQL, Docker Compose

---

## 2. Parser Specification

### 2.1 Input Format

* Input is a plain text file containing multiple案件 blocks separated by `**************************************`.
* Each案件 block contains labeled fields such as:

  * `案件X：<title>`
  * `会社：`, `商流：`, `単価：`, `期間：`, etc.
  * Multiline fields: `＜概要＞`, `＜必須スキル＞`, `＜尚可スキル＞`, `＜開発環境＞` (optional)

### 2.2 Field Extraction Rules

| Field        | Type   | Notes                              |
| ------------ | ------ | ---------------------------------- |
| title        | string | Required, extracted from `案件X：...` |
| company      | string | Optional                           |
| distribution | string | Optional, from `商流：...`            |
| price        | string | Optional                           |
| period       | string | Optional                           |
| location     | string | Optional                           |
| billing      | string | Optional (`精算：...`)                |
| interview    | string | Optional (`面談：...`)                |
| time         | string | Optional (`時間：...`)                |
| notes        | text   | Optional (`備考：...`)                |
| description  | text   | Optional (`＜概要＞...`)               |
| requirements | text   | Optional (`＜必須スキル＞...`)            |
| preferences  | text   | Optional (`＜尚可スキル＞...`)            |
| tech\_stack  | text   | Optional (`＜開発環境＞...`)             |

Fields are parsed using regex patterns with fallback to manual trimming heuristics in case of irregularity.

---

## 3. Parse Failure Handling

### 3.1 Error Types

* `MissingTitleError`: No `案件X：` found
* `CorruptBlockError`: Block starts with malformed or missing separator
* `UnexpectedFieldFormatError`: Known field label is present but malformed
* `UnterminatedMultilineFieldError`: A multiline field block does not terminate properly

### 3.2 Error Reporting Format

* File: `<original_filename>`
* Block index: `案件X`
* Error: `error_code`
* Detail: `regex failed to match expected format near line X`
* Raw snippet (first 300 chars)

Errors are returned as structured JSON logs and optionally stored into an `parse_failures` table.

---

## 4. Database Schema

```sql
Table: entries
- id INTEGER PRIMARY KEY
- title TEXT NOT NULL
- company TEXT
- distribution TEXT
- price TEXT
- period TEXT
- location TEXT
- billing TEXT
- interview TEXT
- time TEXT
- notes TEXT
- description TEXT
- requirements TEXT
- preferences TEXT
- tech_stack TEXT
- status TEXT DEFAULT 'new'  -- enum: new, reviewed, rejected
- comment TEXT
- starred BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 5. Web Application (Hono)

### 5.1 Pages

#### `/` — List View

* Shows all entries in table form
* Columns: `title`, `company`, `status`, `starred`, `updated_at`
* Sort and filter by:

  * status
  * starred
  * free-text search

#### `/entry/:id` — Detail View

* Displays full entry with all fields
* Editable fields:

  * `status`: dropdown (`new`, `reviewed`, `rejected`)
  * `comment`: text box
  * `starred`: toggle button

---

## 6. compose.yaml

```yaml
services:
  app:
    build: .
    ports:
      - "8787:8787"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/dbname
    depends_on:
      - db

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: dbname
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 7. Optional Enhancements

* Markdown rendering in `description` and `requirements`
* Upload form for `.txt` files → parse and insert into DB
* Background job for parsing + retry on error
* CSV export for filtered entries

---

Let me know if you’d like this turned into a Git repo scaffold or want the `app.ts` and SQL schema written next.

