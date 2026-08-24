import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

COGNODB_URI = os.getenv("COGNODB_URI")
COGNODB_USERNAME = os.getenv("COGNODB_USERNAME", "cognodb")
COGNODB_PASSWORD = os.getenv("COGNODB_PASSWORD")

if not COGNODB_URI:
    raise ValueError("COGNODB_URI is missing in .env")

if not COGNODB_PASSWORD:
    raise ValueError("COGNODB_PASSWORD is missing in .env")


driver = GraphDatabase.driver(
    COGNODB_URI,
    auth=(COGNODB_USERNAME, COGNODB_PASSWORD)
)


def verify_connection():
    driver.verify_connectivity()
    return True


def close_driver():
    driver.close()


def test_connection():
    with driver.session() as session:
        result = session.run("RETURN 1 AS number")
        return result.single()["number"]