
from app.database import driver

JOB_DESCRIPTIONS = [
    {
        "id": "JD001",
        "title": "AI Engineer",
        "company": "Data Systems Inc",
        "description": "Build AI and machine learning applications using Python, RAG and LLM technologies.",
        "skills": ["Python", "Machine Learning", "RAG", "LLMs"],
    },
    {
        "id": "JD002",
        "title": "Backend Developer",
        "company": "AI Solutions Ltd",
        "description": "Build scalable backend APIs using Python, FastAPI, REST APIs and Docker.",
        "skills": ["Python", "FastAPI", "REST API", "Docker"],
    },
    {
        "id": "JD003",
        "title": "Data Analyst",
        "company": "Data Systems Inc",
        "description": "Analyze business data using Python, SQL, Pandas and Power BI.",
        "skills": ["Python", "SQL", "Power BI", "Pandas"],
    },
]

def seed_job_descriptions():
    with driver.session() as session:
        for jd in JOB_DESCRIPTIONS:
            session.run(
                """
                MERGE (c:Company {name: $company})
                MERGE (jd:JobDescription {id: $id})
                SET jd.title = $title,
                    jd.description = $description
                MERGE (jd)-[:POSTED_BY]->(c)
                WITH jd
                UNWIND $skills AS skill_name
                MATCH (s:Skill {name: skill_name})
                MERGE (jd)-[:REQUIRES]->(s)
                """,
                id=jd["id"],
                title=jd["title"],
                company=jd["company"],
                description=jd["description"],
                skills=jd["skills"],
            )

    print("Job descriptions seeded successfully!")

if __name__ == "__main__":
    try:
        seed_job_descriptions()
    except Exception as e:
        print("ERROR:", e)
    finally:
        driver.close()
