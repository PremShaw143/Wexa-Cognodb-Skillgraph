const API_BASE = "http://127.0.0.1:8000";


// =========================================================
// HELPERS
// =========================================================

async function fetchAPI(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
}


function setConnection(connected) {
    const text = document.getElementById("connectionText");
    const dot = document.querySelector(".status-dot");

    if (!text || !dot) return;

    if (connected) {
        text.textContent = "Connected";
        dot.style.background = "#62e6b0";
        dot.style.boxShadow = "0 0 12px rgba(98,230,176,.7)";
    } else {
        text.textContent = "Disconnected";
        dot.style.background = "#ff6b6b";
        dot.style.boxShadow = "0 0 12px rgba(255,107,107,.7)";
    }
}


function showError(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}


// =========================================================
// HEALTH CHECK
// =========================================================

async function checkHealth() {
    try {
        const data = await fetchAPI("/health");

        setConnection(
            data.status === "healthy" ||
            data.database === "connected"
        );

    } catch (error) {
        console.error("Health check failed:", error);
        setConnection(false);
    }
}


// =========================================================
// SKILLS
// =========================================================

async function loadSkills() {

    const container = document.getElementById("skillsContainer");

    try {

        const data = await fetchAPI("/skills");

        const skills = data.skills || [];

        document.getElementById("skillCount").textContent =
            skills.length;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    No skills found.
                </div>
            `;
            return;
        }

        container.innerHTML = skills
            .map(skill => `
                <div class="skill-chip">
                    ${escapeHTML(skill)}
                </div>
            `)
            .join("");

    } catch (error) {

        console.error("Skills error:", error);

        showError(
            "skillsContainer",
            "Unable to load skills from CognoDB."
        );
    }
}


// =========================================================
// JOBS
// =========================================================

async function loadJobs() {

    const container = document.getElementById("jobsContainer");

    try {

        const data = await fetchAPI("/jobs");

        const jobs = data.jobs || [];

        document.getElementById("jobCount").textContent =
            jobs.length;

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    No jobs found.
                </div>
            `;
            return;
        }

        container.innerHTML = jobs
            .map(job => `
                <article class="job-card">

                    <h3>
                        ${escapeHTML(job.title)}
                    </h3>

                    <p class="job-company">
                        ${escapeHTML(job.company)}
                    </p>

                </article>
            `)
            .join("");

    } catch (error) {

        console.error("Jobs error:", error);

        showError(
            "jobsContainer",
            "Unable to load jobs from CognoDB."
        );
    }
}


// =========================================================
// PROJECTS
// =========================================================

async function loadProjects() {

    const container = document.getElementById("projectsContainer");

    try {

        const data = await fetchAPI("/projects");

        const projects = data.projects || [];

        document.getElementById("projectCount").textContent =
            projects.length;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    No projects found.
                </div>
            `;
            return;
        }

        container.innerHTML = projects
            .map(project => {

                const skills = project.skills || [];

                return `
                    <article class="project-card">

                        <span class="project-type">
                            ${escapeHTML(project.type || "Project")}
                        </span>

                        <h3>
                            ${escapeHTML(project.name)}
                        </h3>

                        <div class="project-skills">

                            ${
                                skills.length
                                    ? skills.map(skill => `
                                        <span>
                                            ${escapeHTML(skill)}
                                        </span>
                                    `).join("")
                                    : `<span>No linked skills</span>`
                            }

                        </div>

                    </article>
                `;

            })
            .join("");

    } catch (error) {

        console.error("Projects error:", error);

        showError(
            "projectsContainer",
            "Unable to load projects from CognoDB."
        );
    }
}


// =========================================================
// RECOMMENDATIONS
// =========================================================

async function loadRecommendations() {

    const container =
        document.getElementById("recommendationsContainer");

    try {

        const data = await fetchAPI("/recommendations");

        const recommendations =
            data.recommendations || [];

        document.getElementById("matchCount").textContent =
            recommendations.length;

        if (recommendations.length === 0) {

            container.innerHTML = `
                <div class="loading">
                    No recommendations available.
                </div>
            `;

            return;
        }

        container.innerHTML = recommendations
            .map((item, index) => {

                const matchedSkills =
                    item.matched_skills || [];

                const requiredSkills =
                    item.required_skills || [];

                return `
                    <article class="recommendation-card">

                        <div class="recommendation-top">

                            <div>

                                <div class="recommendation-rank">
                                    #${index + 1}
                                </div>

                                <h3>
                                    ${escapeHTML(item.job)}
                                </h3>

                                <p class="recommendation-company">
                                    ${escapeHTML(item.company)}
                                </p>

                            </div>

                            <div class="match-score">
                                ${item.match_score}% Match
                            </div>

                        </div>


                        <div class="recommendation-details">

                            <div class="detail-box">

                                <h4>
                                    Matched Skills
                                </h4>

                                <div class="detail-skills">

                                    ${
                                        matchedSkills.length
                                            ? matchedSkills.map(skill => `
                                                <span>
                                                    ${escapeHTML(skill)}
                                                </span>
                                            `).join("")
                                            : `<span>None</span>`
                                    }

                                </div>

                            </div>


                            <div class="detail-box">

                                <h4>
                                    Required Skills
                                </h4>

                                <div class="detail-skills">

                                    ${
                                        requiredSkills.length
                                            ? requiredSkills.map(skill => `
                                                <span>
                                                    ${escapeHTML(skill)}
                                                </span>
                                            `).join("")
                                            : `<span>None</span>`
                                    }

                                </div>

                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");

    } catch (error) {

        console.error(
            "Recommendations error:",
            error
        );

        showError(
            "recommendationsContainer",
            "Unable to generate recommendations from CognoDB."
        );
    }
}


// =========================================================
// SECURITY
// =========================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// NAVIGATION
// =========================================================

function setupNavigation() {

    const links = document.querySelectorAll(
        'nav a[href^="#"]'
    );

    links.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            const target =
                document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });
}


// =========================================================
// INITIALIZE APPLICATION
// =========================================================

async function initializeApp() {

    setupNavigation();

    await checkHealth();

    await Promise.all([
        loadSkills(),
        loadJobs(),
        loadProjects(),
        loadRecommendations()
    ]);
}


// Start application
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);