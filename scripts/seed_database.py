import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

URI = os.getenv("COGNODB_URI")
USERNAME = os.getenv("COGNODB_USERNAME", "cognodb")
PASSWORD = os.getenv("COGNODB_PASSWORD")

if not URI or not PASSWORD:
    raise ValueError("CognoDB credentials are missing from .env")


driver = GraphDatabase.driver(
    URI,
    auth=(USERNAME, PASSWORD)
)


def seed_database():
    with driver.session() as session:

        # -----------------------------
        # Person
        # -----------------------------
        session.run(
            """
            MERGE (p:Person {name: $name})
            SET p.role = $role,
                p.location = $location
            """,
            name="Prem Kumar Shaw",
            role="AI/ML Engineer",
            location="Kolkata, India"
        )

        # -----------------------------
        # Skills
        # -----------------------------
        skills = [
            ("Python", "Programming"),
            ("SQL", "Database"),
            ("Machine Learning", "AI"),
            ("FastAPI", "Backend"),
            ("RAG", "Generative AI"),
            ("LLM", "Generative AI"),
            ("Power BI", "Data Analytics"),
            ("Pandas", "Data Science"),
            ("Scikit-learn", "Machine Learning"),
            ("Docker", "DevOps")
        ]

        for name, category in skills:
            session.run(
                """
                MERGE (s:Skill {name: $name})
                SET s.category = $category
                """,
                name=name,
                category=category
            )

        # -----------------------------
        # Technologies
        # -----------------------------
        technologies = [
            ("Python", "Programming Language"),
            ("FastAPI", "Backend Framework"),
            ("Streamlit", "Application Framework"),
            ("MySQL", "Database"),
            ("MongoDB", "Database"),
            ("Docker", "Containerization"),
            ("GitHub", "Version Control")
        ]

        for name, category in technologies:
            session.run(
                """
                MERGE (t:Technology {name: $name})
                SET t.category = $category
                """,
                name=name,
                category=category
            )

        # -----------------------------
        # Projects
        # -----------------------------
        projects = [
            (
                "AI Resume Screening Agent",
                "AI/NLP",
                "AI-powered resume screening and candidate ranking system"
            ),
            (
                "Smart Restaurant Management System",
                "Full Stack",
                "Restaurant ordering and sales management application"
            ),
            (
                "Smart Expense Tracker API",
                "Backend",
                "REST API for managing personal expenses"
            ),
            (
                "Gemstone Price Prediction",
                "Machine Learning",
                "Machine learning model for gemstone price prediction"
            ),
            (
                "Food Order Analysis Dashboard",
                "Data Analytics",
                "Power BI dashboard for food order analysis"
            )
        ]

        for name, category, description in projects:
            session.run(
                """
                MERGE (p:Project {name: $name})
                SET p.category = $category,
                    p.description = $description
                """,
                name=name,
                category=category,
                description=description
            )

        # -----------------------------
        # Certifications
        # -----------------------------
        certifications = [
            ("Artificial Intelligence", "IBM SkillsBuild"),
            ("SQL Basic", "HackerRank"),
            ("SQL Intermediate", "HackerRank"),
            ("Python Certificate", "Udemy")
        ]

        for name, issuer in certifications:
            session.run(
                """
                MERGE (c:Certification {name: $name})
                SET c.issuer = $issuer
                """,
                name=name,
                issuer=issuer
            )

        # -----------------------------
        # Person -> Skills
        # -----------------------------
        person_skills = [
            "Python",
            "SQL",
            "Machine Learning",
            "FastAPI",
            "RAG",
            "LLM",
            "Power BI",
            "Pandas",
            "Scikit-learn",
            "Docker"
        ]

        for skill in person_skills:
            session.run(
                """
                MATCH (p:Person {name: $person})
                MATCH (s:Skill {name: $skill})
                MERGE (p)-[:HAS_SKILL]->(s)
                """,
                person="Prem Kumar Shaw",
                skill=skill
            )

        # -----------------------------
        # Person -> Projects
        # -----------------------------
        person_projects = [
            "AI Resume Screening Agent",
            "Smart Restaurant Management System",
            "Smart Expense Tracker API",
            "Gemstone Price Prediction",
            "Food Order Analysis Dashboard"
        ]

        for project in person_projects:
            session.run(
                """
                MATCH (p:Person {name: $person})
                MATCH (pr:Project {name: $project})
                MERGE (p)-[:WORKED_ON]->(pr)
                """,
                person="Prem Kumar Shaw",
                project=project
            )

        # -----------------------------
        # Project -> Skills
        # -----------------------------
        project_skills = {
            "AI Resume Screening Agent": [
                "Python",
                "Machine Learning",
                "RAG",
                "LLM",
                "Scikit-learn"
            ],
            "Smart Restaurant Management System": [
                "Python",
                "FastAPI",
                "SQL"
            ],
            "Smart Expense Tracker API": [
                "Python",
                "FastAPI",
                "SQL"
            ],
            "Gemstone Price Prediction": [
                "Python",
                "Machine Learning",
                "Pandas",
                "Scikit-learn"
            ],
            "Food Order Analysis Dashboard": [
                "SQL",
                "Power BI"
            ]
        }

        for project, project_skill_list in project_skills.items():
            for skill in project_skill_list:
                session.run(
                    """
                    MATCH (p:Project {name: $project})
                    MATCH (s:Skill {name: $skill})
                    MERGE (p)-[:USES_SKILL]->(s)
                    """,
                    project=project,
                    skill=skill
                )

        # -----------------------------
        # Project -> Technologies
        # -----------------------------
        project_technologies = {
            "AI Resume Screening Agent": [
                "Python",
                "Streamlit",
                "GitHub"
            ],
            "Smart Restaurant Management System": [
                "Python",
                "FastAPI",
                "Streamlit",
                "MySQL"
            ],
            "Smart Expense Tracker API": [
                "Python",
                "FastAPI",
                "MySQL"
            ],
            "Gemstone Price Prediction": [
                "Python",
                "Streamlit",
                "GitHub"
            ],
            "Food Order Analysis Dashboard": [
                "MySQL",
                "GitHub"
            ]
        }

        for project, technology_list in project_technologies.items():
            for technology in technology_list:
                session.run(
                    """
                    MATCH (p:Project {name: $project})
                    MATCH (t:Technology {name: $technology})
                    MERGE (p)-[:USES_TECH]->(t)
                    """,
                    project=project,
                    technology=technology
                )

        # -----------------------------
        # Person -> Certifications
        # -----------------------------
        person_certifications = [
            "Artificial Intelligence",
            "SQL Basic",
            "SQL Intermediate",
            "Python Certificate"
        ]

        for certification in person_certifications:
            session.run(
                """
                MATCH (p:Person {name: $person})
                MATCH (c:Certification {name: $certification})
                MERGE (p)-[:HAS_CERTIFICATION]->(c)
                """,
                person="Prem Kumar Shaw",
                certification=certification
            )

    print("✅ Graph data seeded successfully!")


if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print("❌ Seeding failed:")
        print(e)
    finally:
        driver.close()