from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from app.database import driver

app = FastAPI(
    title="SkillGraph API",
    description="Graph-based skill and job recommendation system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "SkillGraph API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    try:
        driver.verify_connectivity()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="CognoDB is unavailable"
        )


@app.get("/skills")
def get_skills():
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (s:Skill)
                RETURN s.name AS name
                ORDER BY s.name
            """)

            return {
                "skills": [record["name"] for record in result]
            }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve skills"
        )


@app.get("/jobs")
def get_jobs():
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (j:Job)-[:AT]->(c:Company)
                RETURN
                    j.title AS title,
                    c.name AS company
                ORDER BY j.title
            """)

            return {
                "jobs": [
                    {
                        "title": record["title"],
                        "company": record["company"]
                    }
                    for record in result
                ]
            }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve jobs"
        )


@app.get("/projects")
def get_projects():
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (p:Project)
                OPTIONAL MATCH (p)-[:USES]->(s:Skill)
                RETURN
                    p.name AS name,
                    p.type AS type,
                    collect(s.name) AS skills
                ORDER BY p.name
            """)

            return {
                "projects": [
                    {
                        "name": record["name"],
                        "type": record["type"],
                        "skills": record["skills"]
                    }
                    for record in result
                ]
            }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve projects"
        )


@app.get("/recommendations")
def get_recommendations():
    try:
        with driver.session() as session:

            result = session.run("""
                MATCH (p:Person {name: "Prem Kumar Shaw"})
                MATCH (j:Job)-[:AT]->(c:Company)
                MATCH (j)<-[:REQUIRED_FOR]-(required:Skill)

                OPTIONAL MATCH (p)-[:HAS_SKILL]->(owned:Skill)

                WITH
                    j,
                    c,
                    collect(DISTINCT required.name) AS requiredSkills,
                    collect(DISTINCT owned.name) AS ownedSkills

                WITH
                    j,
                    c,
                    requiredSkills,
                    [
                        skill IN requiredSkills
                        WHERE skill IN ownedSkills
                    ] AS matchedSkills

                RETURN
                    j.title AS job,
                    c.name AS company,
                    requiredSkills,
                    matchedSkills,
                    size(matchedSkills) AS matchedCount,
                    size(requiredSkills) AS totalRequired

                ORDER BY matchedCount DESC
            """)

            recommendations = []

            for record in result:
                total = record["totalRequired"]
                matched = record["matchedCount"]

                score = round(
                    (matched / total) * 100
                ) if total else 0

                recommendations.append({
                    "job": record["job"],
                    "company": record["company"],
                    "match_score": score,
                    "matched_skills": record["matchedSkills"],
                    "required_skills": record["requiredSkills"]
                })

            return {
                "person": "Prem Kumar Shaw",
                "recommendations": recommendations
            }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate recommendations"
        )