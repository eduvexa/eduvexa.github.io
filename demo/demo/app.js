const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataStore = { countries: [], courses: [] };

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    setupEvents();
});

async function fetchData() {
    // Fetch Countries
    const { data: countries, error: cErr } = await supabase.from('countries').select('*').order('name');
    // Fetch Programs with Join
    const { data: courses, error: pErr } = await supabase.from('programs').select('*, universities(*, countries(*))');

    if (cErr || pErr) console.error("Data error:", cErr || pErr);

    dataStore.countries = countries || [];
    dataStore.courses = courses || [];

    renderCountries();
    renderCourses(dataStore.courses);
    populateDropdowns();
}

function populateDropdowns() {
    const opts = dataStore.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    document.getElementById('hero-country').innerHTML += opts;
    document.getElementById('s-country').innerHTML += opts;
}

function renderCountries() {
    const grid = document.getElementById('country-grid');
    if (dataStore.countries.length === 0) {
        grid.innerHTML = "<p>Loading study destinations...</p>";
        return;
    }
    grid.innerHTML = dataStore.countries.map(c => `
        <div class="country-item" onclick="filterByCountry('${c.name}')">
            <div class="flag-circle">
                <img src="https://flagcdn.com/w160/${c.code.toLowerCase()}.png" alt="${c.name}" onerror="this.src='https://flagcdn.com/w160/un.png'">
            </div>
            <h4>${c.name}</h4>
        </div>
    `).join('');
}

function renderCourses(list) {
    const grid = document.getElementById('course-grid');
    if (list.length === 0) {
        grid.innerHTML = "<p>No courses found matching your criteria.</p>";
        return;
    }
    grid.innerHTML = list.map(c => `
        <div class="course-card">
            <span class="degree">${c.degree_level}</span>
            <h3>${c.name}</h3>
            <span class="uni-info">🏛️ ${c.universities.name} • ${c.universities.countries.name}</span>
            <div class="course-meta">
                <div class="meta-item"><span>Duration</span><strong>${c.duration}</strong></div>
                <div class="meta-item"><span>Tuition</span><strong>${c.tuition_fee}</strong></div>
            </div>
            <a href="https://wa.me/8801811909779?text=Inquiry about ${encodeURIComponent(c.name)} at ${encodeURIComponent(c.universities.name)}" target="_blank" class="btn-apply">Inquire Now</a>
        </div>
    `).join('');
}

function setupEvents() {
    // Hero Search
    document.getElementById('btn-hero-search').addEventListener('click', () => {
        const kw = document.getElementById('hero-keyword').value.toLowerCase();
        const ct = document.getElementById('hero-country').value;
        const filtered = dataStore.courses.filter(c => 
            (c.name.toLowerCase().includes(kw)) && (!ct || c.universities.countries.name === ct)
        );
        renderCourses(filtered);
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });

    // Degree Filter
    document.getElementById('filter-degree').addEventListener('change', (e) => {
        const val = e.target.value;
        const filtered = val ? dataStore.courses.filter(c => c.degree_level === val) : dataStore.courses;
        renderCourses(filtered);
    });
}

function filterByCountry(name) {
    const filtered = dataStore.courses.filter(c => c.universities.countries.name === name);
    renderCourses(filtered);
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

function handleForm(e) {
    e.preventDefault();
    const name = document.getElementById('s-name').value;
    const phone = document.getElementById('s-phone').value;
    const country = document.getElementById('s-country').value;
    const msg = document.getElementById('s-msg').value;

    const waText = `🎓 *EduVexa Inquiry*\n\nName: ${name}\nWhatsApp: ${phone}\nInterest: ${country}\nMessage: ${msg}`;
    window.open(`https://wa.me/8801811909779?text=${encodeURIComponent(waText)}`, '_blank');
}
