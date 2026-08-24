// ==========================================
// 1. Find all skills of a person
// ==========================================

MATCH (p:Person {name: $person_name})-[:HAS_SKILL]->(s:Skill)
RETURN p.name AS person, s.name AS skill, s.category AS category
ORDER BY s.name;


// ==========================================
// 2. Find projects worked on by a person
// ==========================================

MATCH (p:Person {name: $person_name})-[:WORKED_ON]->(project:Project)
RETURN project.name AS project,
       project.category AS category,
       project.description AS description
ORDER BY project.name;


// ==========================================
// 3. TWO-HOP TRAVERSAL
// Person -> Project -> Skill
// ==========================================

MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_SKILL]->(skill:Skill)
RETURN p.name AS person,
       project.name AS project,
       skill.name AS skill
ORDER BY project.name, skill.name;


// ==========================================
// 4. THREE-HOP TRAVERSAL
// Person -> Project -> Technology
// ==========================================

MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_TECH]->(technology:Technology)
RETURN p.name AS person,
       project.name AS project,
       technology.name AS technology
ORDER BY project.name, technology.name;


// ==========================================
// 5. GRAPH-SPECIFIC QUERY
// Find technologies used by projects that
// use Machine Learning
// ==========================================

MATCH (p:Person {name: $person_name})
      -[:WORKED_ON]->(project:Project)
      -[:USES_SKILL]->(skill:Skill {name: $skill_name}),
      (project)-[:USES_TECH]->(technology:Technology)
RETURN DISTINCT
       project.name AS project,
       skill.name AS skill,
       technology.name AS technology
ORDER BY project.name, technology.name;


// ==========================================
// 6. Find skills shared across multiple projects
// ==========================================

MATCH (project:Project)-[:USES_SKILL]->(skill:Skill)
WITH skill, collect(project.name) AS projects
WHERE size(projects) > 1
RETURN skill.name AS skill,
       projects,
       size(projects) AS project_count
ORDER BY project_count DESC;


// ==========================================
// 7. Find certifications of a person
// ==========================================

MATCH (p:Person {name: $person_name})
      -[:HAS_CERTIFICATION]->(cert:Certification)
RETURN p.name AS person,
       cert.name AS certification,
       cert.issuer AS issuer
ORDER BY cert.name;