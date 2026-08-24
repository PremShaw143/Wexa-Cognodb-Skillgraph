
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import driver


app = FastAPI(
    title="SkillGraph API",
    description="Graph-based skill and job recommendation system",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# MODELS
# =====================================================

class JDMatchRequest(BaseModel):
    jd_id: str


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return FileResponse("frontend/index.html")

# =====================================================
# HEALTH
# =====================================================

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


# =====================================================
# SKILLS
# =====================================================

@app.get("/skills")
def get_skills():

    try:

        with driver.session() as session:

            result = session.run("""
                MATCH (s:Skill)
                RETURN DISTINCT s.name AS name
                ORDER BY s.name
            """)

            return {
                "skills": [
                    record["name"]
                    for record in result
                    if record["name"]
                ]
            }

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to retrieve skills: {str(e)}"
        )


# =====================================================
# JOBS
# =====================================================

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

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to retrieve jobs: {str(e)}"
        )


# =====================================================
# PROJECTS
# =====================================================

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
                    collect(DISTINCT s.name) AS skills

                ORDER BY p.name
            """)

            return {
                "projects": [
                    {
                        "name": record["name"],
                        "type": record["type"],
                        "skills": [
                            skill
                            for skill in record["skills"]
                            if skill
                        ]
                    }
                    for record in result
                ]
            }

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to retrieve projects: {str(e)}"
        )


# =====================================================
# JOB DESCRIPTIONS
# =====================================================

@app.get("/job-descriptions")
def get_job_descriptions():

    try:

        with driver.session() as session:

            result = session.run("""
                MATCH (jd:JobDescription)

                OPTIONAL MATCH (jd)-[:REQUIRES]->(s:Skill)

                RETURN
                    jd.id AS id,
                    jd.title AS title,
                    jd.company AS company,
                    collect(DISTINCT s.name) AS required_skills

                ORDER BY jd.title
            """)

            job_descriptions = []

            for record in result:

                job_descriptions.append({
                    "id": record["id"],
                    "title": record["title"],
                    "company": record["company"],
                    "required_skills": [
                        skill
                        for skill in record["required_skills"]
                        if skill
                    ]
                })

            return {
                "job_descriptions": job_descriptions
            }

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to retrieve job descriptions: {str(e)}"
        )


# =====================================================
# MATCH JD
# =====================================================

@app.post("/match-jd")
def match_jd(request: JDMatchRequest):

    try:

        with driver.session() as session:

            result = session.run(
                """
                MATCH (jd:JobDescription {id: $jd_id})
                      -[:REQUIRES]->(required:Skill)

                WITH
                    jd,
                    collect(DISTINCT required.name) AS requiredSkills

                MATCH (p:Person)
                      -[:HAS_SKILL]->(owned:Skill)

                WITH
                    jd,
                    requiredSkills,
                    p,
                    collect(DISTINCT owned.name) AS ownedSkills

                WITH
                    jd,
                    requiredSkills,
                    p,
                    [
                        skill IN requiredSkills
                        WHERE skill IN ownedSkills
                    ] AS matchedSkills

                RETURN
                    jd.id AS jd_id,
                    jd.title AS job_title,
                    p.name AS candidate,
                    requiredSkills,
                    matchedSkills,
                    size(requiredSkills) AS totalRequired,
                    size(matchedSkills) AS matchedCount

                ORDER BY matchedCount DESC
                """,
                jd_id=request.jd_id
            )

            matches = []
            job_title = None

            for record in result:

                if job_title is None:
                    job_title = record["job_title"]

                total = record["totalRequired"]
                matched = record["matchedCount"]

                score = (
                    round((matched / total) * 100)
                    if total
                    else 0
                )

                matches.append({
                    "candidate": record["candidate"],
                    "match_score": score,
                    "matched_skills": record["matchedSkills"],
                    "required_skills": record["requiredSkills"]
                })

            if not matches:

                raise HTTPException(
                    status_code=404,
                    detail="JD not found or no candidates available"
                )

            return {
                "jd_id": request.jd_id,
                "job_title": job_title,
                "candidates": matches
            }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to match candidates: {str(e)}"
        )


# =====================================================
# RECOMMENDATIONS
# =====================================================

@app.get("/recommendations")
def get_recommendations():

    try:

        with driver.session() as session:

            result = session.run("""
                MATCH (p:Person {name: "Prem Kumar Shaw"})

                MATCH (j:Job)-[:AT]->(c:Company)

                MATCH (j)<-[:REQUIRED_FOR]-(required:Skill)

                OPTIONAL MATCH
                    (p)-[:HAS_SKILL]->(owned:Skill)

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

                score = (
                    round((matched / total) * 100)
                    if total
                    else 0
                )

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

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Unable to generate recommendations: {str(e)}"
        )
        
# =====================================================
# FRONTEND
# =====================================================

app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend"
)