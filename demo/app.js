/* ==========================================================
   EduVexa Premium V5
   Website Application + Supabase Integration
========================================================== */

"use strict";

/* CONFIGURATION */

const SUPABASE_URL =
  "https://cnxtddpqjzawfwakmlxl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF";

const WHATSAPP_NUMBER = "8801811909779";

const $ = (id) => document.getElementById(id);

/* STUDY DESTINATIONS */

const fallbackCountries = [
  { id: 1, name: "Malaysia", code: "MY" },
  { id: 2, name: "Slovakia", code: "SK" },
  { id: 3, name: "Romania", code: "RO" },
  { id: 4, name: "Hungary", code: "HU" },
  { id: 5, name: "Lithuania", code: "LT" },
  { id: 6, name: "China", code: "CN" },
  { id: 7, name: "India", code: "IN" },
  { id: 8, name: "Italy", code: "IT" },
  { id: 9, name: "Turkey", code: "TR" },
  { id: 10, name: "Uzbekistan", code: "UZ" }
];

let countries = [...fallbackCountries];
let universities = [];
let scholarships = [];
let db = null;

/* SAFE HTML HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function safeURL(value) {
  try {
    const url = new URL(String(value || ""));

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch (_) {}

  return "";
}

function countryCode(country) {
  return String(country?.code || "").toLowerCase();
}

function flagURL(country) {
  const code = countryCode(country);

  return /^[a-z]{2}$/.test(code)
    ? `https://flagcdn.com/w160/${code}.png`
    : "";
}

/* COUNTRY MANAGEMENT */

function populateCountryDropdowns() {
  const dropdownIDs = [
    "universityCountry",
    "scholarshipCountry",
    "interestedCountry"
  ];

  dropdownIDs.forEach((id) => {
    const select = $(id);
    if (!select) return;

    const previousValue = select.value;

    select.replaceChildren();

    const placeholder = new Option("Select Country", "");
    select.add(placeholder);

    countries.forEach((country) => {
      select.add(
        new Option(country.name, String(country.id))
      );
    });

    if ([...select.options].some(
      (option) => option.value === previousValue
    )) {
      select.value = previousValue;
    }
  });
}

function renderCountries() {
  const grid = $("countryGrid");
  if (!grid) return;

  grid.innerHTML = countries.map((country) => `
    <article class="country-card"
      data-country-id="${escapeHTML(country.id)}"
      tabindex="0"
      role="button"
      aria-label="Explore universities in ${escapeHTML(country.name)}">

      <img
        class="country-flag"
        src="${flagURL(country)}"
        alt="${escapeHTML(country.name)} flag"
        loading="lazy"
      >

      <h3>${escapeHTML(country.name)}</h3>
      <p>Explore Universities →</p>
    </article>
  `).join("");

  grid.querySelectorAll(".country-card").forEach((card) => {
    const openCountry = () => {
      const select = $("universityCountry");
      if (!select) return;

      select.value = card.dataset.countryId;
      select.dispatchEvent(new Event("change"));

      $("universities")?.scrollIntoView({
        behavior: "smooth"
      });
    };

    card.addEventListener("click", openCountry);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCountry();
      }
    });
  });
}

/* UNIVERSITY EXPLORER */

function renderUniversities() {
  const grid = $("universityGrid");
  const selectedCountry = $("universityCountry")?.value || "";
  const search = ($("universitySearch")?.value || "")
    .trim()
    .toLowerCase();

  if (!grid) return;

  const programSection = $("programSection");
  if (programSection) programSection.hidden = true;

  if (!selectedCountry) {
    grid.innerHTML = `
      <div class="empty-state">
        Select a country to explore universities.
      </div>
    `;
    return;
  }

  const filtered = universities.filter((university) => {
    const matchesCountry =
      String(university.country_id) === selectedCountry;

    const matchesSearch =
      String(university.name || "")
        .toLowerCase()
        .includes(search) ||
      String(university.city || "")
        .toLowerCase()
        .includes(search);

    return matchesCountry && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        No published universities are currently listed
        for this selection.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((university) => {
    const website = safeURL(university.official_website);

    return `
      <article class="university-card">
        <h3>${escapeHTML(university.name)}</h3>

        <p>
          📍 ${escapeHTML(university.city || "Location not listed")}
        </p>

        <p>
          ${escapeHTML(university.university_type || "University")}
        </p>

        ${
          university.description
            ? `<p>${escapeHTML(university.description)}</p>`
            : ""
        }

        ${
          website
            ? `<a class="card-link"
                 href="${escapeHTML(website)}"
                 target="_blank"
                 rel="noopener noreferrer">
                 Official University Website ↗
               </a>`
            : ""
        }

        <div>
          <button
            type="button"
            class="btn btn-gold view-programs"
            data-university-id="${escapeHTML(university.id)}"
            style="margin-top:15px">
            View Programs →
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".view-programs").forEach((button) => {
    button.addEventListener("click", () => {
      loadPrograms(button.dataset.universityId);
    });
  });
}

/* PROGRAM EXPLORER */

async function loadPrograms(universityID) {
  const section = $("programSection");
  const grid = $("programGrid");
  const title = $("programTitle");

  if (!section || !grid) return;

  const university = universities.find(
    (item) => String(item.id) === String(universityID)
  );

  section.hidden = false;

  if (title) {
    title.textContent =
      `${university?.name || "University"} — Programs`;
  }

  grid.innerHTML = `
    <div class="empty-state">Loading programs...</div>
  `;

  section.scrollIntoView({ behavior: "smooth" });

  if (!db) {
    grid.innerHTML = `
      <div class="empty-state">
        Programs are temporarily unavailable.
      </div>
    `;
    return;
  }

  try {
    const { data, error } = await db
      .from("programs")
      .select("*")
      .eq("university_id", universityID)
      .eq("is_published", true)
      .order("name");

    if (error) throw error;

    if (!data?.length) {
      grid.innerHTML = `
        <div class="empty-state">
          No published programs are currently listed
          for this university.
        </div>
      `;
      return;
    }

    grid.innerHTML = data.map((program) => {
      const officialURL = safeURL(
        program.official_program_url
      );

      return `
        <article class="program-card">
          <h3>${escapeHTML(program.name)}</h3>

          <p>
            <strong>Degree:</strong>
            ${escapeHTML(program.degree_level || "Not specified")}
          </p>

          <p>
            <strong>Duration:</strong>
            ${escapeHTML(program.duration || "Not specified")}
          </p>

          <p>
            <strong>Tuition:</strong>
            ${escapeHTML(program.tuition_fee || "Check official source")}
          </p>

          <p>
            <strong>Admission Requirements:</strong>
            ${escapeHTML(
              program.admission_requirements ||
              "Check official university requirements"
            )}
          </p>

          ${
            officialURL
              ? `<a class="card-link"
                   href="${escapeHTML(officialURL)}"
                   target="_blank"
                   rel="noopener noreferrer">
                   Official Program Details ↗
                 </a>`
              : ""
          }
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Program loading error:", error);

    grid.innerHTML = `
      <div class="empty-state">
        Unable to load programs right now.
      </div>
    `;
  }
}

/* SCHOLARSHIP FINDER */

function renderScholarships() {
  const grid = $("scholarshipGrid");
  if (!grid) return;

  const selectedCountry =
    $("scholarshipCountry")?.value || "";

  const search = ($("scholarshipSearch")?.value || "")
    .trim()
    .toLowerCase();

  if (!selectedCountry) {
    grid.innerHTML = `
      <div class="empty-state">
        Select a country to explore scholarships.
      </div>
    `;
    return;
  }

  const filtered = scholarships.filter((scholarship) => {
    const matchesCountry =
      String(scholarship.country_id) === selectedCountry;

    const matchesSearch = [
      scholarship.name,
      scholarship.provider,
      scholarship.degree_level
    ].some((value) =>
      String(value || "").toLowerCase().includes(search)
    );

    return matchesCountry && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        No published scholarships are currently listed
        for this selection.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((scholarship) => {
    const officialURL = safeURL(scholarship.official_url);

    const deadline = scholarship.application_deadline
      ? escapeHTML(scholarship.application_deadline)
      : "Check official source";

    return `
      <article class="scholarship-card">
        <h3>${escapeHTML(scholarship.name)}</h3>

        <p>
          <strong>Provider:</strong>
          ${escapeHTML(scholarship.provider || "Not specified")}
        </p>

        <p>
          <strong>Degree:</strong>
          ${escapeHTML(scholarship.degree_level || "Not specified")}
        </p>

        <p>
          <strong>Coverage:</strong>
          ${escapeHTML(scholarship.coverage || "Not specified")}
        </p>

        <p>
          <strong>Eligibility:</strong>
          ${escapeHTML(scholarship.eligibility || "Check official source")}
        </p>

        <p>
          <strong>Deadline:</strong> ${deadline}
        </p>

        <p>
          <strong>Status:</strong>
          ${escapeHTML(scholarship.status || "Verification Pending")}
        </p>

        <p>
          <strong>Last Verified:</strong>
          ${escapeHTML(
            scholarship.last_verified_at || "Not verified"
          )}
        </p>

        ${
          officialURL
            ? `<a class="card-link"
                 href="${escapeHTML(officialURL)}"
                 target="_blank"
                 rel="noopener noreferrer">
                 Official Scholarship Link ↗
               </a>`
            : ""
        }
      </article>
    `;
  }).join("");
}

/* MOBILE NAVIGATION */

function setupMobileMenu() {
  const toggle = $("menuToggle");
  const nav = $("mainNav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* DYNAMIC EDUCATION FIELDS */

function setupEducationForm() {
  const qualification = $("qualification");
  const fields = $("educationFields");

  if (!qualification || !fields) return;

  qualification.addEventListener("change", () => {
    const selected = qualification.value;

    fields.replaceChildren();

    if (!selected) return;

    const groupQualifications = [
      "SSC", "HSC", "Alim", "Dakhil"
    ];

    const subjectQualifications = [
      "Diploma", "Bachelor's", "Master's"
    ];

    const wrapper = document.createElement("div");
    wrapper.className = "form-row";

    if (groupQualifications.includes(selected)) {
      wrapper.appendChild(
        createFormInput(
          "educationGroup",
          selected === "Alim"
            ? "Group / Subject *"
            : "Group *",
          "text",
          true
        )
      );
    }

    if (subjectQualifications.includes(selected)) {
      wrapper.appendChild(
        createFormInput(
          "educationSubject",
          selected === "Diploma"
            ? "Subject / Technology *"
            : "Department / Subject *",
          "text",
          true
        )
      );
    }

    wrapper.appendChild(
      createFormInput(
        "educationResult",
        "Result / GPA / CGPA *",
        "text",
        true
      )
    );

    fields.appendChild(wrapper);
  });
}

function createFormInput(id, label, type, required) {
  const group = document.createElement("div");
  group.className = "form-group";

  const labelElement = document.createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = required;

  group.append(labelElement, input);

  return group;
}

/* WHATSAPP APPLICATION */

function setupApplicationForm() {
  const form = $("applicationForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const countryID = $("interestedCountry")?.value;

    const country = countries.find(
      (item) => String(item.id) === String(countryID)
    );

    const message = [
      "EduVexa - New Student Inquiry",
      "",
      `Name: ${$("studentName")?.value.trim() || ""}`,
      `WhatsApp: ${$("studentWhatsapp")?.value.trim() || ""}`,
      `Email: ${$("studentEmail")?.value.trim() || "Not provided"}`,
      `Interested Country: ${country?.name || "Not selected"}`,
      `Qualification: ${$("qualification")?.value || ""}`,
      `Group: ${$("educationGroup")?.value.trim() || "N/A"}`,
      `Subject / Department: ${$("educationSubject")?.value.trim() || "N/A"}`,
      `Result: ${$("educationResult")?.value.trim() || "N/A"}`,
      "",
      `Additional Message: ${$("studentMessage")?.value.trim() || "None"}`
    ].join("\n");

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.location.href = url;
  });
}

/* SUPABASE DATABASE */

async function initializeDatabase() {
  // Country dropdowns must work independently of Supabase.
  populateCountryDropdowns();
  renderCountries();
  renderUniversities();
  renderScholarships();

  try {
    const module = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );

    db = module.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.info("EduVexa: Supabase client initialized.");

  } catch (error) {
    console.error(
      "EduVexa: Supabase client initialization failed.",
      error
    );

    return;
  }

  // Each query is independent: one failure will not stop the others.
  await Promise.allSettled([
    loadCountries(),
    loadUniversities(),
    loadScholarships()
  ]);

  console.info("EduVexa: Database loading completed.");
}

async function loadCountries() {
  try {
    const { data, error } = await db
      .from("countries")
      .select("*");

    if (error) throw error;

    if (Array.isArray(data) && data.length) {
      const countryOrder = fallbackCountries.map(
        (country) => country.name.toLowerCase()
      );

      countries = [...data].sort((a, b) => {
        const aIndex = countryOrder.indexOf(
          String(a.name).toLowerCase()
        );

        const bIndex = countryOrder.indexOf(
          String(b.name).toLowerCase()
        );

        return (
          (aIndex === -1 ? 999 : aIndex) -
          (bIndex === -1 ? 999 : bIndex)
        );
      });

      populateCountryDropdowns();
      renderCountries();
    }

  } catch (error) {
    console.error("Countries loading error:", error);
  }
}

async function loadUniversities() {
  try {
    const { data, error } = await db
      .from("universities")
      .select("*")
      .eq("is_published", true)
      .order("name");

    if (error) throw error;

    universities = data || [];

    const count = $("universityCount");
    if (count) count.textContent = universities.length;

    renderUniversities();

  } catch (error) {
    console.error("Universities loading error:", error);

    const count = $("universityCount");
    if (count) count.textContent = "—";
  }
}

async function loadScholarships() {
  try {
    const { data, error } = await db
      .from("scholarships")
      .select("*")
      .eq("is_published", true)
      .order("name");

    if (error) throw error;

    scholarships = data || [];
    renderScholarships();

  } catch (error) {
    console.error("Scholarships loading error:", error);
  }
}

/* EVENT LISTENERS */

function setupExplorerEvents() {
  $("universityCountry")?.addEventListener(
    "change",
    renderUniversities
  );

  $("universitySearch")?.addEventListener(
    "input",
    renderUniversities
  );

  $("scholarshipCountry")?.addEventListener(
    "change",
    renderScholarships
  );

  $("scholarshipSearch")?.addEventListener(
    "input",
    renderScholarships
  );
}

/* WEBSITE INITIALIZATION */

function initializeWebsite() {
  console.info("EduVexa Premium V5 starting...");

  const year = $("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  setupMobileMenu();
  setupExplorerEvents();
  setupEducationForm();
  setupApplicationForm();

  initializeDatabase();
}

// Works even if this script executes after DOMContentLoaded.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeWebsite,
    { once: true }
  );
} else {
  initializeWebsite();
}
