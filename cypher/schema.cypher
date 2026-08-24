CREATE CONSTRAINT person_name_unique IF NOT EXISTS
FOR (p:Person)
REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT skill_name_unique IF NOT EXISTS
FOR (s:Skill)
REQUIRE s.name IS UNIQUE;

CREATE CONSTRAINT project_name_unique IF NOT EXISTS
FOR (p:Project)
REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT technology_name_unique IF NOT EXISTS
FOR (t:Technology)
REQUIRE t.name IS UNIQUE;

CREATE CONSTRAINT certification_name_unique IF NOT EXISTS
FOR (c:Certification)
REQUIRE c.name IS UNIQUE;