const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let globalData = { countries: [], universities: [], programs: [], scholarships: [] };

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupListeners();
});

async function loadData() {
    const { data: countries } = await supabase.from('countries').select('*').order('name');
    const { data: unis } = await supabase.from('universities').select('*, countries(name)');
    const { data: programs } = await supabase.from('programs').select('*, universities(*, countries(*))');
    const { data: scholarships } = await supabase.from('scholarships').select('*, countries(name)');

    globalData = { countries, universities: unis, programs, scholarships };

    populateDropdowns();
    renderCountries();
    renderPrograms(globalData.programs);
    renderUniversities(globalData.universities);
    renderScholarships(globalData.scholarships);
}

function populateDropdowns() {
    const options = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    ['hero-destination-select', 'filter-country', 'uni-country-select', 'student-country'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML += options;
    });
}

function renderCountries() {
    const container = document.getElementById('destinations-grid');
    container.innerHTML = globalData.countries.map(c => `
        <div class="card destination-card" style="cursor:pointer" onclick="filterByCountry('${c.name}')">
            <img src="https://flagcdn.com/w80/${c.code.toLowerCase()}.png" alt="${c.name}">
            <div class="destination-info"><h3>${c.name}</h3><span style="color:var(--gold)">View Programs →</span></div>
        </div>
    `).join('');
}

function renderPrograms(data) {
    const container = document.getElementById('program-cards-container');
    document.getElementById('results-count').innerText = `Showing ${data.length} Programs`;
    
    if (data.length === 0) {
        container.innerHTML = `<p style="padding:40px; text-align:center; background:#FFF; border-radius:15px;">No programs found matching your search.</p>`;
        return;
    }

    container.innerHTML = data.map(p => `
        <div class="program-card">
            <div class="program-header">
                <h3 class="program-title">${p.name}</h3>
                <span class="badge-degree">${p.degree_level}</span>
            </div>
            <p style="color:#64748B; font-size:14px; margin-bottom:10px;">🏛️ ${p.universities.name} • ${p.universities.countries.name}</p>
            <div class="program-details">
                <div class="detail-box"><span>Duration</span><strong>${p.duration}</strong></div>
                <div class="detail-box"><span>Tuition Fee</span><strong>${p.tuition_fee}</strong></div>
                <div class="detail-box"><span>Requirement</span><strong>${p.admission_requirements}</strong></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <a href="${p.official_url}" target="_blank" style="color:var(--navy); font-weight:700; font-size:13px;">Official Website ↗</a>
                <button class="btn-whatsapp" onclick="inquire('${p.name}', '${p.universities.name}')">Inquire Now</button>
            </div>
        </div>
    `).join('');
}

function renderUniversities(data) {
    const container = document.getElementById('universities-grid');
    container.innerHTML = data.map(u => `
        <div class="card">
            <h3>${u.name}</h3>
            <p style="color:#64748B; font-size:13px; margin:10px 0;">📍 ${u.countries.name}</p>
            <a href="${u.website}" target="_blank" style="color:var(--gold); font-weight:700; text-decoration:none; font-size:13px;">View Website →</a>
        </div>
    `).join('');
}

function renderScholarships(data) {
    const container = document.getElementById('scholarships-grid');
    container.innerHTML = data.map(s => `
        <div class="card" style="text-align:left">
            <span class="badge-scholarship">${s.countries.name} Scholarship</span>
            <h3 style="margin-top:10px;">${s.title}</h3>
            <p style="font-size:13px; color:#64748B; margin:10px 0;">${s.coverage}</p>
            <a href="${s.official_url}" target="_blank" style="color:var(--navy); font-weight:700; font-size:13px;">Details ↗</a>
        </div>
    `).join('');
}

function setupListeners() {
    document.getElementById('hero-search-btn').addEventListener('click', () => {
        const kw = document.getElementById('hero-keyword-input').value;
        const ct = document.getElementById('hero-destination-select').value;
        const dg = document.getElementById('hero-degree-select').value;
        
        document.getElementById('filter-keyword').value = kw;
        document.getElementById('filter-country').value = ct;
        document.getElementById('filter-degree').value = dg;
        applyFilters();
        document.getElementById('search').scrollIntoView({behavior:'smooth'});
    });

    ['filter-keyword', 'filter-country', 'filter-degree'].forEach(id => {
        document.getElementById(id).addEventListener('input', applyFilters);
    });

    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        ['filter-keyword', 'filter-country', 'filter-degree'].forEach(id => document.getElementById(id).value = '');
        renderPrograms(globalData.programs);
    });

    document.getElementById('uni-search-input').addEventListener('input', filterUnis);
    document.getElementById('uni-country-select').addEventListener('change', filterUnis);
}

function applyFilters() {
    const kw = document.getElementById('filter-keyword').value.toLowerCase();
    const ct = document.getElementById('filter-country').value;
    const dg = document.getElementById('filter-degree').value;

    const filtered = globalData.programs.filter(p => {
        return (p.name.toLowerCase().includes(kw) || p.universities.name.toLowerCase().includes(kw)) &&
               (!ct || p.universities.countries.name === ct) &&
               (!dg || p.degree_level === dg);
    });
    renderPrograms(filtered);
}

function filterUnis() {
    const kw = document.getElementById('uni-search-input').value.toLowerCase();
    const ct = document.getElementById('uni-country-select').value;
    const filtered = globalData.universities.filter(u => (!ct || u.countries.name === ct) && u.name.toLowerCase().includes(kw));
    renderUniversities(filtered);
}

function filterByCountry(name) {
    document.getElementById('filter-country').value = name;
    applyFilters();
    document.getElementById('search').scrollIntoView({behavior:'smooth'});
}

function inquire(prog, uni) {
    const text = encodeURIComponent(`Hello EduVexa! I am interested in ${prog} at ${uni}. Please help me.`);
    window.open(`https://wa.me/8801811909779?text=${text}`, '_blank');
}

function handleInquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const country = document.getElementById('student-country').value;
    const msg = document.getElementById('student-message').value;
    const text = encodeURIComponent(`New Inquiry:\nName: ${name}\nCountry: ${country}\nMessage: ${msg}`);
    window.open(`https://wa.me/8801811909779?text=${text}`, '_blank');
}
