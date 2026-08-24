# SkillGraph — Graph-Based Candidate & Job Matching

SkillGraph is a graph database application built with **FastAPI, CognoDB, Neo4j Python Driver, HTML, CSS, and JavaScript**.

It models candidates, skills, projects, technologies, certifications, and job descriptions as connected graph data and uses **Cypher queries** to find relationships and calculate candidate-job matches.

## 🚀 Live Demo

**Hosted Application:** https://wexa-cognodb-skillgraph.onrender.com/

**GitHub Repository:** https://github.com/PremShaw143/Wexa-Cognodb-Skillgraph

## ✨ Features

* Candidate skill exploration
* Project and technology relationships
* Job description management
* Candidate-job skill matching
* Match score calculation
* Skill and project recommendations
* Multi-hop graph traversal
* CognoDB health monitoring
* REST API using FastAPI
* Responsive web interface
* Environment-based database configuration
* Graceful database error handling

## 🧩 Use Case

The application demonstrates how graph databases can be used for **candidate skill analysis and job matching**.

A candidate is connected to their skills, projects, technologies, and certifications. Job descriptions are connected to required skills.

This allows the application to answer questions such as:

* What skills does a candidate have?
* Which projects demonstrate a particular skill?
* Which technologies were used in a project?
* What skills are shared across projects?
* How well does a candidate match a job description?

## 🕸️ Why a Graph Database?

A graph database is useful because the important information is about **relationships**.

For example:

```text
Candidate
   ↓ HAS_SKILL
Skill
   ↑ USES_SKILL
Project
   ↓ USES_TECH
Technology
```

A relational database could store this information using multiple tables and junction tables. However, multi-hop relationship queries become more complex as the number of relationships grows.

CognoDB makes these relationships explicit and allows them to be queried naturally using Cypher.

## 🗂️ Graph Data Model

```text
(Person)
   │
   ├── HAS_SKILL ──> (Skill)
   │
   ├── WORKED_ON ──> (Project)
   │                       │
   │                       ├── USES_SKILL ──> (Skill)
   │                       │
   │                       └── USES_TECH ──> (Technology)
   │
   └── HAS_CERTIFICATION ──> (Certification)

(JobDescription)
   │
   └── REQUIRES ──> (Skill)
```

## 🛠️ Technology Stack

* **Backend:** Python, FastAPI
* **Database:** CognoDB
* **Database Protocol:** Bolt
* **Database Driver:** Official Neo4j Python Driver
* **Query Language:** openCypher
* **Frontend:** HTML, CSS, JavaScript
* **Configuration:** Python dotenv
* **Hosting:** Render
* **Version Control:** Git & GitHub

## 📁 Project Structure

```text
Wexa-Cognodb-Skillgraph/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── test_connection.py
│   └── __init__.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
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

## 🔍 Main Graph Queries

### Find Candidate Skills

```cypher
MATCH (p:Person {name: $person_name})-[:HAS_SKILL]->(s:Skill)
RETURN p.name AS person, s.name AS skill, s.category AS category
ORDER BY s.name;
```

### Multi-Hop Traversal

The application performs a two-hop traversal:

```cypher
MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_SKILL]->(skill:Skill)
RETURN p.name AS person,
       project.name AS project,
       skill.name AS skill;
```

This finds skills associated with projects worked on by a candidate.

### Three-Hop Traversal

```cypher
MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_TECH]->(technology:Technology)
RETURN p.name AS person,
       project.name AS project,
       technology.name AS technology;
```

### Skill-Based Job Matching

The application compares the required skills of a Job Description with the candidate's skills.

The match score is calculated as:

```text
Match Score =
(Matched Skills / Required Skills) × 100
```

For example, if a job requires four skills and the candidate has all four:

```text
4 / 4 × 100 = 100%
```

## 🔐 Environment Variables

Database credentials are never stored in the repository.

Create a `.env` file:

```env
COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_cognodb_password
```

The repository contains `.env.example` for reference.

`.env` is excluded using `.gitignore`.

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/PremShaw143/Wexa-Cognodb-Skillgraph.git
cd Wexa-Cognodb-Skillgraph
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create `.env` using `.env.example` and add your CognoDB credentials.

### 6. Seed the database

```bash
python scripts/seed_database.py
```

Then load the job descriptions:

```bash
python scripts/seed_job_descriptions.py
```

### 7. Start the API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

## 🔌 API Endpoints

| Method | Endpoint            | Purpose                      |
| ------ | ------------------- | ---------------------------- |
| GET    | `/`                 | API status                   |
| GET    | `/health`           | Database health check        |
| GET    | `/skills`           | Retrieve skills              |
| GET    | `/jobs`             | Retrieve jobs                |
| GET    | `/projects`         | Retrieve projects            |
| GET    | `/job-descriptions` | Retrieve job descriptions    |
| POST   | `/match-jd`         | Match candidate with a job   |
| GET    | `/recommendations`  | Generate job recommendations |

### Example

```http
POST /match-jd
```

Request:

```json
{
  "jd_id": "JD001"
}
```

Response contains:

```json
{
  "jd_id": "JD001",
  "job_title": "AI Engineer",
  "candidates": [
    {
      "candidate": "Prem Kumar Shaw",
      "match_score": 100,
      "matched_skills": [
        "Python",
        "Machine Learning",
        "RAG",
        "LLMs"
      ]
    }
  ]
}
```

## ☁️ Deployment

The application is hosted on **Render**.

Render configuration:

```text
Build Command:
pip install -r requirements.txt

Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

CognoDB credentials are configured through Render Environment Variables.

The application reads:

```text
COGNODB_URI
COGNODB_USERNAME
COGNODB_PASSWORD
```

No database credentials are committed to GitHub.

## 🩺 Health Check

The `/health` endpoint verifies the connection between the application and CognoDB.

Example successful response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

If CognoDB is unavailable, the API returns an appropriate `503` response instead of crashing silently.

## 📸 Screenshots

### Dashboard

Add your hosted application screenshot here:

```text
screenshots/dashboard.png
```

### Job Matching

Add your job matching screenshot here:

```text
screenshots/job-matching.png
```

### Recommendations

Add your recommendations screenshot here:

```text
screenshots/recommendations.png
```

## 🎥 Screen Recording

Add your screen recording link here:

```text
PASTE_YOUR_SCREEN_RECORDING_LINK_HERE
```

The recording demonstrates:

1. Opening the hosted application
2. Exploring the application
3. Selecting a Job Description
4. Running candidate matching
5. Viewing the match score
6. Exploring graph-based relationships

## 🔒 Security

* Database credentials are stored in environment variables.
* `.env` is excluded from Git.
* Parameterized Cypher queries are used.
* No database password is included in the source code.
* Database connection failures are handled gracefully.
## 🚀 Live Demo

**Hosted Application:** https://wexa-cognodb-skillgraph.onrender.com/

**GitHub Repository:** https://github.com/PremShaw143/Wexa-Cognodb-Skillgraph

## 👨‍💻 Author

**Prem Kumar Shaw**

B.Tech in Computer Science Engineering — Data Science

Email: [premshaw117@gmail.com](mailto:premshaw117@gmail.com)

GitHub: https://github.com/PremShaw143

---

Built as a take-home assignment for **Wexa AI — CognoDB Graph Database Application**.
