// ==========================================
// EduVexa V4.2 - Premium Website Application
// ==========================================

const SUPABASE_URL =
  "https://cnxtddpqjzawfwakmlxl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF";

const WHATSAPP_NUMBER = "8801811909779";

const $ = (id) => document.getElementById(id);

// ==========================================
// INITIAL DATA
// ==========================================

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
let databaseConnected = false;

// ==========================================
// UTILITIES
// ==========================================

function createEmpty(message) {
  const element = document.createElement("div");
  element.className = "empty";
  element.textContent = message;
  return element;
}

function showEmpty(containerId, message) {
  const container = $(containerId);
  if (!container) return;

  container.replaceChildren(createEmpty(message));
}

function createParagraph(label, value) {
  const p = document.createElement("p");
  p.textContent = `${label}: ${value || "Not specified"}`;
  return p;
}

function createExternalLink(url, text) {
  const link = document.createElement("a");
  link.href = url;
  link.textContent = text;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

// ==========================================
// COUNTRY DROPDOWNS
// ==========================================

function populateCountryDropdowns() {
  const dropdownIds = [
    "universityCountry",
    "scholarshipCountry"
  ];

  dropdownIds.forEach((id) => {
    const select = $(id);
    if (!select) return;

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Country";
    select.appendChild(placeholder);

    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.id;
      option.textContent = country.name;
      select.appendChild(option);
    });
  });
}

// ==========================================
// COUNTRY CARDS
// ==========================================

function renderCountries() {
  const grid = $("countryGrid");
  if (!grid) return;

  grid.replaceChildren();

  countries.forEach((country) => {
    const card = document.createElement("article");
    card.className = "card";

    const flag = document.createElement("img");
    flag.className = "flag";
    flag.alt = `${country.name} flag`;
    flag.loading = "lazy";

    flag.src =
      country.flag_url ||
      `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`;

    const title = document.createElement("h3");
    title.textContent = country.name;

    const description = document.createElement("p");
    description.textContent =
      country.description ||
      `Explore international education opportunities in ${country.name}.`;

    const link = document.createElement("a");
    link.className = "card-link";
    link.href = "#universities";
    link.textContent = "Explore Universities →";

    link.addEventListener("click", () => {
      const select = $("universityCountry");
      select.value = String(country.id);
      renderUniversities();
    });

    card.append(flag, title, description, link);
    grid.appendChild(card);
  });
}

// ==========================================
// UNIVERSITY EXPLORER
// ==========================================

function renderUniversities() {
  const countryId = Number($("universityCountry").value);
  const search = $("universitySearch").value.trim().toLowerCase();

  const grid = $("universityGrid");
  grid.replaceChildren();

  $("programSection").hidden = true;

  if (!countryId) {
    grid.appendChild(
      createEmpty("Select a country to explore universities.")
    );
    return;
  }

  if (!databaseConnected) {
    grid.appendChild(
      createEmpty(
        "University database is currently unavailable. Please try again later."
      )
    );
    return;
  }

  const filtered = universities.filter((university) => {
    return (
      Number(university.country_id) === countryId &&
      university.name.toLowerCase().includes(search)
    );
  });

  if (filtered.length === 0) {
    grid.appendChild(
      createEmpty(
        "No published universities found for this country."
      )
    );
    return;
  }

  filtered.forEach((university) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("h3");
    title.textContent = university.name;

    card.appendChild(title);

    card.appendChild(
      createParagraph("Location", university.city)
    );

    card.appendChild(
      createParagraph("Type", university.university_type)
    );

    const button = document.createElement("button");
    button.className = "btn dark";
    button.textContent = "View Programs";

    button.addEventListener("click", () => {
      loadPrograms(university);
    });

    card.appendChild(button);

    if (university.official_website) {
      card.appendChild(
        createExternalLink(
          university.official_website,
          "Official University Website ↗"
        )
      );
    }

    grid.appendChild(card);
  });
}

// ==========================================
// UNIVERSITY PROGRAMS
// ==========================================

async function loadPrograms(university) {
  const section = $("programSection");
  const grid = $("programGrid");

  section.hidden = false;

  $("programTitle").textContent =
    `Programs at ${university.name}`;

  grid.replaceChildren(
    createEmpty("Loading university programs...")
  );

  try {
    if (!db) {
      throw new Error("Database connection unavailable.");
    }

    const { data, error } = await db
      .from("programs")
      .select("*")
      .eq("university_id", university.id)
      .eq("is_published", true)
      .order("name");

    if (error) throw error;

    grid.replaceChildren();

    if (!data || data.length === 0) {
      grid.appendChild(
        createEmpty(
          "No verified programs have been published for this university yet."
        )
      );
      return;
    }

    data.forEach((program) => {
      const card = document.createElement("article");
      card.className = "result-card";

      const title = document.createElement("h3");
      title.textContent = program.name;

      card.appendChild(title);

      if (program.degree_level) {
        card.appendChild(
          createParagraph("Degree", program.degree_level)
        );
      }

      if (program.duration) {
        card.appendChild(
          createParagraph("Duration", program.duration)
        );
      }

      if (program.tuition_fee) {
        card.appendChild(
          createParagraph("Tuition Fee", program.tuition_fee)
        );
      }

      if (program.admission_requirements) {
        card.appendChild(
          createParagraph(
            "Admission Requirements",
            program.admission_requirements
          )
        );
      }

      if (program.official_program_url) {
        card.appendChild(
          createExternalLink(
            program.official_program_url,
            "Official Program Details ↗"
          )
        );
      }

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Program loading failed:", error);

    showEmpty(
      "programGrid",
      "Unable to load programs. Please try again later."
    );
  }

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// ==========================================
// SCHOLARSHIP FINDER
// ==========================================

function renderScholarships() {
  const countryId = Number($("scholarshipCountry").value);
  const search = $("scholarshipSearch").value
    .trim()
    .toLowerCase();

  const grid = $("scholarshipGrid");
  grid.replaceChildren();

  if (!countryId) {
    grid.appendChild(
      createEmpty("Select a country to explore scholarships.")
    );
    return;
  }

  if (!databaseConnected) {
    grid.appendChild(
      createEmpty(
        "Scholarship database is currently unavailable."
      )
    );
    return;
  }

  const filtered = scholarships.filter((scholarship) => {
    return (
      Number(scholarship.country_id) === countryId &&
      scholarship.name.toLowerCase().includes(search)
    );
  });

  if (filtered.length === 0) {
    grid.appendChild(
      createEmpty(
        "No published scholarships available for this selection."
      )
    );
    return;
  }

  filtered.forEach((scholarship) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("h3");
    title.textContent = scholarship.name;
    card.appendChild(title);

    const details = [
      ["Provider", scholarship.provider],
      ["Degree Level", scholarship.degree_level],
      ["Coverage", scholarship.coverage],
      ["Eligibility", scholarship.eligibility],
      ["Deadline", scholarship.application_deadline],
      ["Status", scholarship.status]
    ];

    details.forEach(([label, value]) => {
      if (value) {
        card.appendChild(
          createParagraph(label, value)
        );
      }
    });

    if (scholarship.official_url) {
      card.appendChild(
        createExternalLink(
          scholarship.official_url,
          "Official Scholarship Website ↗"
        )
      );
    }

    const whatsappMessage =
      `Hello EduVexa! I want information about ${scholarship.name}.`;

    card.appendChild(
      createExternalLink(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`,
        "Get Scholarship Guidance →"
      )
    );

    grid.appendChild(card);
  });
}

// ==========================================
// EDUCATION QUALIFICATION
// ==========================================

function setupEducationForm() {
  const qualification = $("qualification");
  const fields = $("educationFields");
  const subject = $("subject");
  const result = $("result");
  const label = $("subjectLabel");

  qualification.addEventListener("change", () => {
    const level = qualification.value;
    const active = Boolean(level);

    fields.hidden = !active;

    subject.required = active;
    result.required = active;

    subject.value = "";
    result.value = "";

    if (["SSC", "HSC", "Dakhil"].includes(level)) {
      label.textContent = "Group *";
      subject.placeholder =
        "Science / Business Studies / Humanities";
    } else if (level === "Diploma") {
      label.textContent =
        "Diploma Subject / Technology *";
      subject.placeholder =
        "Example: Computer Technology";
    } else if (level === "Alim") {
      label.textContent = "Group / Subject *";
      subject.placeholder =
        "Enter your group or subject";
    } else {
      label.textContent =
        "Department / Subject *";
      subject.placeholder =
        "Enter your department or subject";
    }
  });
}

// ==========================================
// WHATSAPP APPLICATION
// ==========================================

function setupApplicationForm() {
  $("applicationForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("studentName").value.trim();
    const phone = $("studentPhone").value.trim();
    const email = $("studentEmail").value.trim();

    const country = $("interestedCountry").value;
    const qualification = $("qualification").value;

    const subject = $("subject").value.trim();
    const result = $("result").value.trim();
    const message = $("studentMessage").value.trim();

    if (
      !name ||
      !phone ||
      !country ||
      !qualification ||
      !subject ||
      !result
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const text = [
      "NEW STUDENT INQUIRY - EduVexa",
      "",
      `Full Name: ${name}`,
      `WhatsApp: ${phone}`,
      `Email: ${email || "Not provided"}`,
      `Interested Country: ${country}`,
      `Qualification: ${qualification}`,
      `Group / Subject: ${subject}`,
      `Result: ${result}`,
      `Message: ${message || "Not provided"}`
    ].join("\n");

    window.location.href =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  });
}

// ==========================================
// MOBILE NAVIGATION
// ==========================================

function setupMobileMenu() {
  const button = $("menuBtn");
  const nav = $("nav");

  button.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");

    button.setAttribute(
      "aria-expanded",
      String(opened)
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

// ==========================================
// LOAD SUPABASE DATABASE
// ==========================================

async function initializeDatabase() {
  populateCountryDropdowns();

  try {
    const module = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );

    db = module.createClient(
      const SUPABASE_URL =
"https://cnxtddpqjzawfwakmlxl.supabase.co";
      SUPABASE_KEY
    );

    const [
      countriesResponse,
      universitiesResponse,
      scholarshipsResponse
    ] = await Promise.all([
      db.from("countries")
        .select("*")
        .order("id"),

      db.from("universities")
        .select("*")
        .eq("is_published", true)
        .order("name"),

      db.from("scholarships")
        .select("*")
        .eq("is_published", true)
        .order("name")
    ]);

    if (countriesResponse.error) {
      throw countriesResponse.error;
    }

    if (universitiesResponse.error) {
      throw universitiesResponse.error;
    }

    if (scholarshipsResponse.error) {
      throw scholarshipsResponse.error;
    }

    countries = countriesResponse.data || [];

    universities = universitiesResponse.data || [];

    scholarships = scholarshipsResponse.data || [];

    databaseConnected = true;

    populateCountryDropdowns();
    renderCountries();

    $("universityCount").textContent =
      universities.length;

    console.info(
      "EduVexa Supabase connection successful."
    );
  } catch (error) {
    console.error(
      "EduVexa Database Connection Error:",
      error
    );

    databaseConnected = false;

    $("universityCount").textContent = "—";

    // Keep initial country information available.
    populateCountryDropdowns();
  }

  renderUniversities();
  renderScholarships();
}

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();

  setupEducationForm();

  setupApplicationForm();

  $("universityCountry").addEventListener(
    "change",
    renderUniversities
  );

  $("universitySearch").addEventListener(
    "input",
    renderUniversities
  );

  $("scholarshipCountry").addEventListener(
    "change",
    renderScholarships
  );

  $("scholarshipSearch").addEventListener(
    "input",
    renderScholarships
  );

  $("year").textContent =
    new Date().getFullYear();

  initializeDatabase();
});
