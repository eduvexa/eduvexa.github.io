const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allCountries = [];
let allCourses = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initPortal();
    setupSearch();
});

async function initPortal() {
    // Fetch Countries
    const { data: countries } = await supabase.from('countries').select('*').order('name');
    allCountries = countries || [];

    // Fetch Programs with Joins
    const { data: courses } = await supabase.from('programs').select('*, universities(*, countries(*))');
    allCourses = courses || [];

    renderDestinations();
    renderCourses(allCourses);
    populateDropdown();
}

function renderDestinations() {
    const grid = document.getElementById('country-grid');
    if (allCountries.length === 0) {
        grid.innerHTML = "<p>Connecting to database...</p>";
        return;
    }
    grid.innerHTML = allCountries.map(c => `
        <div class="country-card" onclick="filterByCountry('${c.name}')">
            <div class="flag-wrapper">
                <img src="https://flagcdn.com/w160/${c.code.toLowerCase()}.png" alt="${c.name}">
            </div>
            <h4>${c.name}</h4>
        </div>
    `).join('');
}

function renderCourses(list) {
    const grid = document.getElementById('course-list');
    if (list.length === 0) {
        grid.innerHTML = "<p style='padding:40px; font-weight:bold;'>No courses found. Try a different search.</p>";
        return;
    }
    grid.innerHTML = list.map(c => `
        <div class="course-card">
            <span class="degree">${c.degree_level}</span>
            <h3>${c.name}</h3>
            <span class="uni-name">🏛️ ${c.universities.name} • ${c.universities.countries.name}</span>
            <div class="meta">
                <div class="meta-item"><span>Duration</span><strong>${c.duration}</strong></div>
                <div class="meta-item"><span>Tuition</span><strong>${c.tuition_fee}</strong></div>
            </div>
            <a href="https://wa.me/8801811909779?text=I am interested in ${encodeURIComponent(c.name)} at ${encodeURIComponent(c.universities.name)}" target="_blank" class="btn-details">Enquire Now</a>
        </div>
    `).join('');
}

function populateDropdown() {
    const select = document.getElementById('course-country');
    const opts = allCountries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    select.innerHTML += opts;
}

function setupSearch() {
    document.getElementById('search-btn').addEventListener('click', () => {
        const kw = document.getElementById('course-keyword').value.toLowerCase();
        const ct = document.getElementById('course-country').value;

        const filtered = allCourses.filter(c => 
            (c.name.toLowerCase().includes(kw)) && 
            (!ct || c.universities.countries.name === ct)
        );
        renderCourses(filtered);
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });
}

function filterByCountry(name) {
    const filtered = allCourses.filter(c => c.universities.countries.name === name);
    renderCourses(filtered);
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}
