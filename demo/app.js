/* ==========================================================
   EduVexa V5 - Studyportals Style Search Engine Logic
   Website Application + Supabase Integration
========================================================== */

"use strict";

/* CONFIGURATION */
const SUPABASE_URL = "https://cnxtddpqjzawfwakmlxl.supabase.co";
const SUPABASE_KEY = "sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF";
const WHATSAPP_NUMBER = "8801811909779";

const $ = (id) => document.getElementById(id);

/* DATA STORAGE */
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
let programs = [];
let scholarships = [];
let db = null;

/* UTILS */
function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function flagURL(code) {
  const c = String(code || "").toLowerCase();
  return /^[a-z]{2}$/.test(c) ? `https://flagcdn.com/w80/${c}.png` : "";
}

/* INITIALIZATION */
async function initializeDatabase() {
  populateDropdowns();
  renderCountries();

  try {
    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    db = module.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.info("Supabase connected.");
    
    await fetchAllData();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

async function fetchAllData() {
  const [resC, resU, resP, resS] = await Promise.allSettled([
    db.from("countries").select("*").order("name"),
    db.from("universities").select("*").eq("is_published", true).order("name"),
    db.from("programs").select("*, universities(name, country_id)").eq("is_published", true),
    db.from("scholarships").select("*").eq("is_published", true).order("name")
  ]);

  if (resC.status === 'fulfilled' && resC.value.data) countries = resC.value.data;
  if (resU.status === 'fulfilled' && resU.value.data) universities = resU.value.data;
  if (resP.status === 'fulfilled' && resP.value.data) programs = resP.value.data;
  if (resS.status === 'fulfilled' && resS.value.data) scholarships = resS.value.data;

  updateStats();
  populateDropdowns();
  renderCountries();
  renderUniversities();
  renderScholarships();
  filterPrograms(); // Initial Directory load
}

function updateStats() {
  if ($('statCountries')) $('statCountries').textContent = countries.length;
  if ($('statUniversities')) $('statUniversities').textContent = universities.length;
  if ($('statPrograms')) $('statPrograms').textContent = programs.length;
}

function populateDropdowns() {
  const selects = ["heroCountry", "filterCountry", "universityCountry", "scholarshipCountry", "interestedCountry"];
  selects.forEach(id => {
    const el = $(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="">${id.includes('hero') || id.includes('filter') ? 'All Destinations' : 'Select Country'}</option>`;
    countries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      el.appendChild(opt);
    });
    el.value = current;
  });
}

/* PROGRAM DIRECTORY SEARCH & FILTER */
function filterPrograms() {
  const grid = $("programResultsGrid");
  if (!grid) return;

  // Get Search Inputs
  const keyword = ($("heroKeyword")?.value || $("filterKeyword")?.value || "").toLowerCase().trim();
  const countryId = $("heroCountry")?.value || $("filterCountry")?.value || "";
  const degree = $("heroDegree")?.value || $("filterDegree")?.value || "";
  const sort = $("filterSort")?.value || "name_asc";

  let filtered = programs.filter(p => {
    const univ = p.universities || {};
    const matchesKeyword = !keyword || 
      p.name.toLowerCase().includes(keyword) || 
      (p.description || "").toLowerCase().includes(keyword);
    const matchesCountry = !countryId || String(univ.country_id) === String(countryId);
    const matchesDegree = !degree || p.degree_level === degree;
    
    return matchesKeyword && matchesCountry && matchesDegree;
  });

  // Sorting
  if (sort === "name_asc") filtered.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === "university_asc") filtered.sort((a,b) => (a.universities?.name || "").localeCompare(b.universities?.name || ""));

  $("resultsCount").textContent = `Found ${filtered.length} study programs for you`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No programs found matching your criteria. Try adjusting filters.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const univ = p.universities || {};
    const country = countries.find(c => String(c.id) === String(univ.country_id)) || {};
    
    return `
      <article class="program-card-portal">
        <div class="portal-card-header">
          <div class="portal-title-group">
            <h3>${escapeHTML(p.name)}</h3>
            <div class="portal-univ-info">
              <img src="${flagURL(country.code)}" class="portal-univ-flag" alt="Flag">
              <span>${escapeHTML(univ.name)} • ${escapeHTML(country.name)}</span>
            </div>
          </div>
          <div class="portal-badges">
            <span class="badge-degree">${escapeHTML(p.degree_level)}</span>
            <span class="badge-country">${escapeHTML(country.name)}</span>
          </div>
        </div>

        <div class="portal-details-grid">
          <div class="detail-box">
            <span>Duration</span>
            <strong>${escapeHTML(p.duration || "N/A")}</strong>
          </div>
          <div class="detail-box">
            <span>Tuition Fee</span>
            <strong>${escapeHTML(p.tuition_fee || "Check Website")}</strong>
          </div>
          <div class="detail-box">
            <span>Requirements</span>
            <strong>${escapeHTML(p.admission_requirements || "Standard")}</strong>
          </div>
        </div>

        <div class="portal-actions-row">
          <a href="${escapeHTML(p.official_program_url)}" target="_blank" class="official-link">View Official Page ↗</a>
          <button class="btn btn-gold" onclick="inquireProgram('${escapeHTML(p.name)}', '${escapeHTML(univ.name)}')">
            Inquire via WhatsApp
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function inquireProgram(prog, univ) {
  const msg = `Hello EduVexa, I am interested in the program: ${prog} at ${univ}. Can you please provide more information about the admission process?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* UI RENDERERS */
function renderCountries() {
  const grid = $("countryGrid");
  if (!grid) return;
  grid.innerHTML = countries.map(c => `
    <div class="country-card" onclick="setCountryFilter(${c.id})">
      <img src="${flagURL(c.code)}" class="country-flag" alt="${c.name}">
      <h3>${escapeHTML(c.name)}</h3>
      <p>View Universities →</p>
    </div>
  `).join("");
}

function setCountryFilter(id) {
  if ($("heroCountry")) $("heroCountry").value = id;
  if ($("filterCountry")) $("filterCountry").value = id;
  filterPrograms();
  $("programs").scrollIntoView({ behavior: 'smooth' });
}

function renderUniversities() {
  const grid = $("universityGrid");
  const countryId = $("universityCountry")?.value;
  const search = ($("universitySearch")?.value || "").toLowerCase();
  
  if (!grid) return;
  if (!countryId) {
    grid.innerHTML = `<div class="empty-state">Select a country to view universities.</div>`;
    return;
  }

  const filtered = universities.filter(u => 
    String(u.country_id) === String(countryId) && 
    (u.name.toLowerCase().includes(search) || (u.city || "").toLowerCase().includes(search))
  );

  grid.innerHTML = filtered.length ? filtered.map(u => `
    <div class="university-card">
      <h3>${escapeHTML(u.name)}</h3>
      <p>📍 ${escapeHTML(u.city || "Various Locations")}</p>
      <p>🏢 ${escapeHTML(u.university_type || "Institution")}</p>
      <a href="${u.official_website}" target="_blank" class="card-link">Official Website ↗</a>
    </div>
  `).join("") : `<div class="empty-state">No universities found for this search.</div>`;
}

function renderScholarships() {
  const grid = $("scholarshipGrid");
  const countryId = $("scholarshipCountry")?.value;
  if (!grid) return;
  if (!countryId) {
    grid.innerHTML = `<div class="empty-state">Select a country to find scholarships.</div>`;
    return;
  }

  const filtered = scholarships.filter(s => String(s.country_id) === String(countryId));
  grid.innerHTML = filtered.length ? filtered.map(s => `
    <div class="scholarship-card">
      <h3>${escapeHTML(s.name)}</h3>
      <p><strong>Provider:</strong> ${escapeHTML(s.provider)}</p>
      <p><strong>Coverage:</strong> ${escapeHTML(s.coverage)}</p>
      <p><strong>Status:</strong> ${escapeHTML(s.status)}</p>
      <a href="${s.official_url}" target="_blank" class="card-link">More Details ↗</a>
    </div>
  `).join("") : `<div class="empty-state">No scholarships currently listed for this country.</div>`;
}

/* EVENT LISTENERS */
function setupEvents() {
  $("menuToggle")?.addEventListener("click", () => $("mainNav").classList.toggle("active"));
  
  // Hero Search
  $("heroSearchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    filterPrograms();
    $("programs").scrollIntoView({ behavior: 'smooth' });
  });

  // Directory Filters
  $("filterKeyword")?.addEventListener("input", filterPrograms);
  $("filterCountry")?.addEventListener("change", filterPrograms);
  $("filterDegree")?.addEventListener("change", filterPrograms);
  $("filterSort")?.addEventListener("change", filterPrograms);
  $("resetFilters")?.addEventListener("click", () => {
    $("filterKeyword").value = "";
    $("filterCountry").value = "";
    $("filterDegree").value = "";
    filterPrograms();
  });

  // Quick Tags
  document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $("heroKeyword").value = btn.dataset.tag;
      filterPrograms();
      $("programs").scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Explorer Selects
  $("universityCountry")?.addEventListener("change", renderUniversities);
  $("universitySearch")?.addEventListener("input", renderUniversities);
  $("scholarshipCountry")?.addEventListener("change", renderScholarships);
  
  // Form handling
  $("qualification")?.addEventListener("change", setupEducationFields);
  $("applicationForm")?.addEventListener("submit", handleApplication);
}

/* FORM HELPERS */
function setupEducationFields() {
  const q = $("qualification").value;
  const container = $("educationFields");
  container.innerHTML = "";
  if (!q) return;
  
  const html = `
    <div class="form-row">
      <div class="form-group">
        <label>Major / Subject *</label>
        <input type="text" id="eduSubject" required>
      </div>
      <div class="form-group">
        <label>Result / GPA *</label>
        <input type="text" id="eduResult" required>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function handleApplication(e) {
  e.preventDefault();
  const name = $("studentName").value;
  const country = $("interestedCountry").options[$("interestedCountry").selectedIndex].text;
  const qual = $("qualification").value;
  const sub = $("eduSubject")?.value || "N/A";
  const res = $("eduResult")?.value || "N/A";
  
  const msg = `New Inquiry from EduVexa Website:\nName: ${name}\nCountry: ${country}\nQualification: ${qual}\nSubject: ${sub}\nResult: ${res}\nMessage: ${$("studentMessage").value}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  initializeDatabase();
  if ($("currentYear")) $("currentYear").textContent = new Date().getFullYear();
});
