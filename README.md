# SkillGraph — Graph-Based Career Intelligence

SkillGraph is a graph-based career intelligence application built for the **Wexa AI CognoDB Take-Home Assignment**.

It uses **CognoDB**, **Neo4j Driver**, **OpenCypher**, and **FastAPI** to model relationships between people, skills, projects, technologies, certifications, job descriptions, and jobs.

The application helps users:

* Explore technical skills
* View projects and technologies
* Explore available jobs
* Match candidates against Job Descriptions
* Get career recommendations based on skill compatibility

---

## Tech Stack

* **Backend:** Python, FastAPI
* **Database:** CognoDB Cloud
* **Database Protocol:** Bolt
* **Query Language:** OpenCypher
* **Database Driver:** Official Neo4j Python Driver
* **Frontend:** HTML, CSS, JavaScript
* **Configuration:** Environment variables using `python-dotenv`

---

## Project Structure

```text
Wexa_CognoDB_Assignment/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── test_connection.py
│   └── __init__.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── scripts/
│   ├── seed_database.py
│   └── seed_job_descriptions.py
│
├── cypher/
│   ├── schema.cypher
│   ├── queries.cypher
│   └── job_descriptions.cypher
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

# Use Case

## Career Intelligence and Candidate Matching

SkillGraph represents career-related information as a graph.

For example:

```text
Person
  │
  ├── HAS_SKILL ──> Skill
  │
  ├── WORKED_ON ──> Project
  │                     │
  │                     ├── USES_SKILL ──> Skill
  │                     │
  │                     └── USES_TECH ──> Technology
  │
  └── HAS_CERTIFICATION ──> Certification
```

Job matching is also represented through relationships:

```text
JobDescription
      │
   REQUIRES
      ↓
    Skill

Person
   │
HAS_SKILL
   ↓
 Skill
```

This allows SkillGraph to compare the skills required by a job with the skills owned by a candidate.

---

# Why a Graph Database?

Career data is naturally relationship-driven.

A relational database could store people, skills, projects, and jobs in separate tables, but finding relationships across multiple entities can require several joins.

With a graph database, these relationships can be traversed directly.

For example:

```text
Person
 → Project
 → Skill
```

or:

```text
Person
 → Project
 → Technology
```

This makes multi-hop and relationship-based queries easier to express and understand.

SkillGraph therefore uses CognoDB because the core problem is about **connections between entities**, not only individual records.

---

# Graph Data Model

## Main Nodes

* `Person`
* `Skill`
* `Project`
* `Technology`
* `Certification`
* `Job`
* `Company`
* `JobDescription`

## Main Relationships

```text
Person ──HAS_SKILL────────────> Skill

Person ──WORKED_ON────────────> Project

Project ──USES_SKILL──────────> Skill

Project ──USES_TECH───────────> Technology

Person ──HAS_CERTIFICATION───> Certification

Job ──AT──────────────────────> Company

Job ──REQUIRED_FOR────────────> Skill

JobDescription ──REQUIRES─────> Skill
```

---

# Example Graph

```text
Prem Kumar Shaw
       │
       │ HAS_SKILL
       ↓
    Python
       ↑
       │ REQUIRED_FOR
       │
   AI Engineer
       │
       │ AT
       ↓
   Company
```

Another multi-hop relationship:

```text
Prem Kumar Shaw
       │
   WORKED_ON
       ↓
AI Resume Screening Agent
       │
   USES_SKILL
       ↓
Machine Learning
```

---

# Main Features

## 1. Skills

The application retrieves skills stored in CognoDB and displays them in the frontend.

API:

```text
GET /skills
```

---

## 2. Jobs

The application retrieves jobs and their associated companies.

API:

```text
GET /jobs
```

---

## 3. Projects

Projects are connected with their skills and technologies.

API:

```text
GET /projects
```

---

## 4. Job Description Matching

Recruiters can select a Job Description and find candidates based on required skills.

Example:

```text
POST /match-jd
```

Request:

```json
{
  "jd_id": "JD001"
}
```

The backend calculates:

```text
Match Score =
Matched Skills / Required Skills × 100
```

For example:

```text
Required Skills: 4
Matched Skills: 4

Match Score: 100%
```

---

## 5. Career Recommendations

The application compares the candidate's skills with job requirements and ranks jobs based on the percentage of required skills matched.

API:

```text
GET /recommendations
```

---

# Graph Queries

The project contains parameterized OpenCypher queries in:

```text
cypher/queries.cypher
```

Examples include:

### Find a person's skills

```cypher
MATCH (p:Person {name: $person_name})
      -[:HAS_SKILL]->(s:Skill)
RETURN p.name AS person,
       s.name AS skill
ORDER BY s.name;
```

### Two-hop traversal

```cypher
MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_SKILL]->(skill:Skill)
RETURN p.name AS person,
       project.name AS project,
       skill.name AS skill;
```

### Three-hop traversal

```cypher
MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_TECH]->(technology:Technology)
RETURN p.name AS person,
       project.name AS project,
       technology.name AS technology;
```

All application queries use parameters rather than string-concatenated Cypher.

---

# Seed Data

Realistic project data is loaded using:

```text
scripts/seed_database.py
```

Job descriptions are loaded using:

```text
scripts/seed_job_descriptions.py
```

Example Job Descriptions:

```text
JD001 → AI Engineer
JD002 → Backend Developer
JD003 → Data Analyst
```

Example AI Engineer skills:

```text
Python
Machine Learning
RAG
LLMs
```

---

# Environment Variables

Database credentials are stored in `.env` and are **not committed to GitHub**.

Required variables:

```env
COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_cognodb_password
```

A safe template is provided in:

```text
.env.example
```

The `.gitignore` file excludes:

```text
.env
venv/
__pycache__/
*.pyc
```

---

# Setup

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Wexa_CognoDB_Assignment
```

## 2. Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\Activate.ps1
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment

Create a `.env` file:

```env
COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_cognodb_password
```

---

# Database Setup

Create a free CognoDB Cloud instance and obtain the Bolt connection URI and password.

Then run the schema and seed scripts.

The schema is available in:

```text
cypher/schema.cypher
```

Seed the main graph:

```bash
python scripts/seed_database.py
```

Seed Job Descriptions:

```bash
python scripts/seed_job_descriptions.py
```

---

# Run the Application

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

Open the frontend:

```text
frontend/index.html
```

The frontend communicates with the FastAPI backend using REST APIs.

---

# Application Flow

```text
Frontend
   │
   │ HTTP / REST API
   ↓
FastAPI Backend
   │
   │ Neo4j Driver
   │ OpenCypher
   ↓
CognoDB
   │
   ↓
Graph Data
```

For candidate matching:

```text
Frontend
   ↓
POST /match-jd
   ↓
FastAPI
   ↓
CognoDB
   ↓
JobDescription → Skill
        +
Person → Skill
   ↓
Skill Matching
   ↓
Match Score
   ↓
Frontend
```

---

# Error Handling

The backend includes error handling for database and API failures.

For example, if CognoDB is unavailable, the API returns an appropriate HTTP error instead of exposing the application failure directly.

The frontend also displays loading, empty, and error states.

Health check:

```text
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

# Security

* Database credentials are stored in environment variables.
* `.env` is excluded from Git.
* Cypher queries use parameters.
* No database password is stored in source code.
* The frontend does not directly connect to CognoDB.
* Database communication is handled by the FastAPI backend.

---

# Future Improvements

Possible production improvements include:

* User authentication and authorization
* Recruiter and candidate accounts
* Resume upload and automatic skill extraction
* AI-powered job description parsing
* More advanced graph-based recommendations
* Skill-gap analysis
* Job application tracking
* Hosted production deployment
* Automated tests and CI/CD

---

# Assignment Deliverables

This repository contains:

* Complete FastAPI backend
* Frontend application
* CognoDB graph database integration
* Seed scripts
* OpenCypher queries
* Graph schema
* Parameterized database queries
* Job Description matching
* Career recommendations
* Environment configuration template
* README documentation

Additional submission requirements:

* **GitHub repository:** Add the final repository URL
* **Hosted demo:** Add the deployed application URL
* **Screen recording:** Add the recording link

---

# Author

## Prem Kumar Shaw

**B.Tech Computer Science — Data Science**

Interested in:

* Artificial Intelligence
* Machine Learning
* Python
* Backend Development
* Generative AI
* Data Analytics

Built as part of the **Wexa AI — CognoDB Take-Home Assignment**.
