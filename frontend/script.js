const API_BASE = "";

const state = {
    skills: [],
    jobs: [],
    projects: [],
    recommendations: [],
    jobDescriptions: []
};


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    checkBackend();

    loadSkills();
    loadJobs();
    loadProjects();
    loadJobDescriptions();
    loadRecommendations();

    setupJDMatching();

});


// =====================================================
// API HELPER
// =====================================================

async function apiFetch(endpoint, options = {}) {

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {

        let message =
            `Request failed: ${response.status}`;

        try {

            const error =
                await response.json();

            message =
                error.detail || message;

        } catch (_) {}

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// BACKEND CONNECTION
// =====================================================

async function checkBackend() {

    const text =
        document.getElementById("connectionText");

    const dot =
        document.querySelector(".status-dot");

    try {

        await apiFetch("/health");

        if (text) {
            text.textContent = "Connected";
        }

        if (dot) {
            dot.classList.add("connected");
        }

    } catch (error) {

        if (text) {
            text.textContent = "Backend Offline";
        }

        if (dot) {
            dot.classList.remove("connected");
        }

        console.error(
            "Backend connection failed:",
            error
        );
    }
}


// =====================================================
// SKILLS
// =====================================================

async function loadSkills() {

    const container =
        document.getElementById("skillsContainer");

    try {

        const data =
            await apiFetch("/skills");

        state.skills =
            Array.isArray(data.skills)
                ? data.skills
                : [];

        updateCount(
            "skillCount",
            state.skills.length
        );

        renderSkills(state.skills);

    } catch (error) {

        console.error(
            "Skills error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="error-message">
                    Unable to load skills.
                </div>
            `;
        }
    }
}


function renderSkills(skills) {

    const container =
        document.getElementById(
            "skillsContainer"
        );

    if (!container) return;

    if (!skills.length) {

        container.innerHTML = `
            <div class="empty-message">
                No skills found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        skills.map(skill => {

            const name =
                typeof skill === "string"
                    ? skill
                    : skill.name || "Skill";

            return `
                <div class="skill-card">
                    <span class="skill-dot"></span>
                    <span>
                        ${escapeHTML(name)}
                    </span>
                </div>
            `;

        }).join("");
}


// =====================================================
// JOBS
// =====================================================

async function loadJobs() {

    const container =
        document.getElementById(
            "jobsContainer"
        );

    try {

        const data =
            await apiFetch("/jobs");

        state.jobs =
            Array.isArray(data.jobs)
                ? data.jobs
                : [];

        updateCount(
            "jobCount",
            state.jobs.length
        );

        renderJobs(state.jobs);

    } catch (error) {

        console.error(
            "Jobs error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="error-message">
                    Unable to load jobs.
                </div>
            `;
        }
    }
}


function renderJobs(jobs) {

    const container =
        document.getElementById(
            "jobsContainer"
        );

    if (!container) return;

    if (!jobs.length) {

        container.innerHTML = `
            <div class="empty-message">
                No jobs found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        jobs.map((job, index) => {

            return `
                <article class="job-card">

                    <div class="job-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                    <div class="job-content">

                        <h3>
                            ${escapeHTML(
                                job.title || "Job"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                job.company || "Company"
                            )}
                        </p>

                    </div>

                    <div class="job-arrow">
                        →
                    </div>

                </article>
            `;

        }).join("");
}


// =====================================================
// PROJECTS
// =====================================================

async function loadProjects() {

    const container =
        document.getElementById(
            "projectsContainer"
        );

    try {

        const data =
            await apiFetch("/projects");

        state.projects =
            Array.isArray(data.projects)
                ? data.projects
                : [];

        updateCount(
            "projectCount",
            state.projects.length
        );

        renderProjects(state.projects);

    } catch (error) {

        console.error(
            "Projects error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="error-message">
                    Unable to load projects.
                </div>
            `;
        }
    }
}


function renderProjects(projects) {

    const container =
        document.getElementById(
            "projectsContainer"
        );

    if (!container) return;

    if (!projects.length) {

        container.innerHTML = `
            <div class="empty-message">
                No projects found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        projects.map((project, index) => {

            const name =
                project.name || "Project";

            const type =
                project.type || "PROJECT";

            const skills =
                Array.isArray(project.skills)
                    ? project.skills
                    : [];

            return `
                <article class="project-card">

                    <div class="project-top">

                        <span class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <span class="project-category">
                            ${escapeHTML(type)}
                        </span>

                    </div>

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    ${
                        skills.length
                            ? `
                                <div class="project-skills">

                                    ${skills.map(skill => `
                                        <span class="skill-tag">
                                            ${escapeHTML(skill)}
                                        </span>
                                    `).join("")}

                                </div>
                            `
                            : `
                                <p class="no-skills">
                                    No skills linked to this project.
                                </p>
                            `
                    }

                    <div class="project-footer">

                        <span>
                            Graph Project
                        </span>

                        <span class="project-arrow">
                            →
                        </span>

                    </div>

                </article>
            `;

        }).join("");
}


// =====================================================
// JOB DESCRIPTIONS
// =====================================================

async function loadJobDescriptions() {

    const select =
        document.getElementById("jdSelect");

    if (!select) return;

    try {

        const data =
            await apiFetch(
                "/job-descriptions"
            );

        state.jobDescriptions =
            Array.isArray(
                data.job_descriptions
            )
                ? data.job_descriptions
                : [];

        populateJDSelect(
            state.jobDescriptions
        );

    } catch (error) {

        console.error(
            "Job descriptions error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load job descriptions
            </option>
        `;
    }
}


function populateJDSelect(jds) {

    const select =
        document.getElementById("jdSelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select a job description
        </option>
    `;

    jds.forEach(jd => {

        const option =
            document.createElement("option");

        option.value =
            jd.id || "";

        option.textContent =
            `${jd.title || "Job Description"} — ${jd.company || "Company"}`;

        select.appendChild(option);
    });
}


// =====================================================
// JD MATCHING BUTTON
// =====================================================

function setupJDMatching() {

    const button =
        document.getElementById(
            "matchJdButton"
        );

    const select =
        document.getElementById(
            "jdSelect"
        );

    if (!button || !select) {

        console.error(
            "JD select or match button not found."
        );

        return;
    }

    button.addEventListener(
        "click",
        async () => {

            const jdId =
                select.value.trim();

            if (!jdId) {

                showJDMessage(
                    "Please select a job description."
                );

                return;
            }

            await matchJobDescription(jdId);
        }
    );
}


// =====================================================
// MATCH JOB DESCRIPTION
// =====================================================

async function matchJobDescription(jdId) {

    const output =
        document.getElementById(
            "jdResults"
        );

    if (!output) return;

    output.innerHTML = `
        <div class="loading">
            Matching candidates...
        </div>
    `;

    try {

        const data =
            await apiFetch(
                "/match-jd",
                {
                    method: "POST",

                    body: JSON.stringify({
                        jd_id: jdId
                    })
                }
            );

        renderCandidateMatches(data);

    } catch (error) {

        console.error(
            "JD matching error:",
            error
        );

        output.innerHTML = `
            <div class="error-message">

                <strong>
                    Unable to match candidates.
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}


// =====================================================
// CANDIDATE RESULTS
// =====================================================

function renderCandidateMatches(data) {

    const container =
        document.getElementById(
            "jdResults"
        );

    if (!container) return;

    const candidates =
        Array.isArray(data.candidates)
            ? data.candidates
            : [];

    if (!candidates.length) {

        container.innerHTML = `
            <div class="empty-message">
                No candidates found.
            </div>
        `;

        return;
    }

    container.innerHTML = `

        <div class="candidate-header">

            <div>

                <span class="section-label">
                    MATCH RESULTS
                </span>

                <h2>
                    ${escapeHTML(
                        data.job_title ||
                        "Job Description"
                    )}
                </h2>

            </div>

            <span class="candidate-count">
                ${candidates.length}
                candidates
            </span>

        </div>


        <div class="candidate-grid">

            ${
                candidates.map(
                    (candidate, index) => {

                        const score =
                            Number(
                                candidate.match_score || 0
                            );

                        const matched =
                            Array.isArray(
                                candidate.matched_skills
                            )
                                ? candidate.matched_skills
                                : [];

                        const required =
                            Array.isArray(
                                candidate.required_skills
                            )
                                ? candidate.required_skills
                                : [];

                        return `

                            <article class="candidate-card">

                                <div class="candidate-rank">
                                    #${index + 1}
                                </div>

                                <div class="candidate-main">

                                    <div class="candidate-title-row">

                                        <div>

                                            <h3>
                                                ${escapeHTML(
                                                    candidate.candidate ||
                                                    "Candidate"
                                                )}
                                            </h3>

                                            <span>
                                                Candidate
                                            </span>

                                        </div>

                                        <div class="candidate-score">

                                            <strong>
                                                ${score}%
                                            </strong>

                                            <span>
                                                Skill Match
                                            </span>

                                        </div>

                                    </div>


                                    <div class="score-bar">

                                        <div
                                            style="
                                                width:${Math.min(score, 100)}%;
                                            "
                                        ></div>

                                    </div>


                                    <div class="candidate-skills">

                                        <div>

                                            <span class="skill-label">
                                                MATCHED SKILLS
                                            </span>

                                            <div class="skill-tags">

                                                ${
                                                    matched.length
                                                        ? matched.map(
                                                            skill => `
                                                                <span class="skill-tag matched">
                                                                    ${escapeHTML(skill)}
                                                                </span>
                                                            `
                                                        ).join("")
                                                        : `<span class="no-skills">None</span>`
                                                }

                                            </div>

                                        </div>


                                        <div>

                                            <span class="skill-label">
                                                REQUIRED SKILLS
                                            </span>

                                            <div class="skill-tags">

                                                ${
                                                    required.length
                                                        ? required.map(
                                                            skill => `
                                                                <span class="skill-tag required">
                                                                    ${escapeHTML(skill)}
                                                                </span>
                                                            `
                                                        ).join("")
                                                        : `<span class="no-skills">None</span>`
                                                }

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </article>
                        `;
                    }
                ).join("")
            }

        </div>
    `;
}


// =====================================================
// RECOMMENDATIONS
// =====================================================

async function loadRecommendations() {

    const container =
        document.getElementById(
            "recommendationsContainer"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            Finding recommendations...
        </div>
    `;

    try {

        const data =
            await apiFetch(
                "/recommendations"
            );

        state.recommendations =
            Array.isArray(
                data.recommendations
            )
                ? data.recommendations
                : [];

        updateCount(
            "matchCount",
            state.recommendations.length
        );

        renderRecommendations(
            state.recommendations
        );

    } catch (error) {

        console.error(
            "Recommendation error:",
            error
        );

        container.innerHTML = `
            <div class="error-message">

                <strong>
                    Unable to load recommendations.
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}


function renderRecommendations(
    recommendations
) {

    const container =
        document.getElementById(
            "recommendationsContainer"
        );

    if (!container) return;

    if (!recommendations.length) {

        container.innerHTML = `
            <div class="empty-message">
                No recommendations found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        recommendations.map(
            (job, index) => {

                const matchedSkills =
                    Array.isArray(
                        job.matched_skills
                    )
                        ? job.matched_skills
                        : [];

                const requiredSkills =
                    Array.isArray(
                        job.required_skills
                    )
                        ? job.required_skills
                        : [];

                const score =
                    Number(
                        job.match_score || 0
                    );

                return `

                    <article class="recommendation-card">

                        <div class="recommendation-number">
                            #${index + 1}
                        </div>


                        <div class="recommendation-main">

                            <div class="recommendation-header">

                                <div>

                                    <h3>
                                        ${escapeHTML(
                                            job.job || "Job"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            job.company || "Company"
                                        )}
                                    </p>

                                </div>


                                <div class="match-score">

                                    <strong>
                                        ${score}%
                                    </strong>

                                    <span>
                                        Match
                                    </span>

                                </div>

                            </div>


                            <div class="recommendation-skills">

                                <div class="skill-group">

                                    <span class="skill-label">
                                        MATCHED SKILLS
                                    </span>

                                    <div class="skill-tags">

                                        ${
                                            matchedSkills.length
                                                ? matchedSkills.map(
                                                    skill => `
                                                        <span class="skill-tag matched">
                                                            ${escapeHTML(skill)}
                                                        </span>
                                                    `
                                                ).join("")
                                                : `<span class="no-skills">None</span>`
                                        }

                                    </div>

                                </div>


                                <div class="skill-group">

                                    <span class="skill-label">
                                        REQUIRED SKILLS
                                    </span>

                                    <div class="skill-tags">

                                        ${
                                            requiredSkills.length
                                                ? requiredSkills.map(
                                                    skill => `
                                                        <span class="skill-tag required">
                                                            ${escapeHTML(skill)}
                                                        </span>
                                                    `
                                                ).join("")
                                                : `<span class="no-skills">None</span>`
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>

                    </article>
                `;
            }
        ).join("");
}


// =====================================================
// JD MESSAGE
// =====================================================

function showJDMessage(message) {

    const container =
        document.getElementById(
            "jdResults"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="error-message">
            ${escapeHTML(message)}
        </div>
    `;
}


// =====================================================
// COUNTER
// =====================================================

function updateCount(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// SMOOTH SCROLL
// =====================================================

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                'a[href^="#"]'
            );

        if (!link) return;

        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            targetId === "#"
        ) {
            return;
        }

        const target =
            document.querySelector(
                targetId
            );

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }
);


// =====================================================
// CONSOLE
// =====================================================

console.log(
    "%cSkillGraph",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Graph-based career intelligence system"
);

console.log(
    "Frontend → FastAPI → CognoDB/Neo4j"
);