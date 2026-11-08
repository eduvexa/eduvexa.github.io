/* ==========================================================================
   EduVexa - INTI Portal App JS (V12.0)
   Dynamic Supabase Integration & Direct Direct Counseling Engine
   ========================================================================== */

const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';

// Initialize Supabase Client defensively
let supabase = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Global Data Store
let globalData = {
    countries: [],
    universities: [],
    programs: [],
    scholarships: []
};

// Target Destination Priority Order
const DESTINATION_ORDER = [
    "Malaysia", "Slovakia", "Romania", "Hungary", "Lithuania",
    "China", "India", "Italy", "Turkey", "Uzbekistan"
];

// Fallback Default Data (If Supabase Network Call Pending/Delayed)
const MOCK_COUNTRIES = [
    { id: '1', name: 'Malaysia', code: 'my', universities_count: 12 },
    { id: '2', name: 'Slovakia', code: 'sk', universities_count: 8 },
    { id: '3', name: 'Romania', code: 'ro', universities_count: 10 },
    { id: '4', name: 'Hungary', code: 'hu', universities_count: 9 },
    { id: '5', name: 'Lithuania', code: 'lt', universities_count: 7 },
    { id: '6', name: 'China', code: 'cn', universities_count: 25 },
    { id: '7', name: 'India', code: 'in', universities_count: 15 },
    { id: '8', name: 'Italy', code: 'it', universities_count: 11 },
    { id: '9', name: 'Turkey', code: 'tr', universities_count: 14 },
    { id: '10', name: 'Uzbekistan', code: 'uz', universities_count: 6 }
];

const MOCK_PROGRAMS = [
    { id: 'p1', name: 'BSc in Computer Science & AI', level: 'Bachelor', country_name: 'Malaysia', university_name: 'INTI International University', tuition_per_year: 4500, duration: '3 Years' },
    { id: 'p2', name: 'MSc in General Medicine (MD)', level: 'Master', country_name: 'Slovakia', university_name: 'Comenius University Jessenius', tuition_per_year: 9500, duration: '6 Years' },
    { id: 'p3', name: 'Bachelor of Software Engineering', level: 'Bachelor', country_name: 'Romania', university_name: 'Technical University of Cluj-Napoca', tuition_per_year: 3200, duration: '4 Years' },
    { id: 'p4', name: 'MSc in Business Analytics & Leadership', level: 'Master', country_name: 'Hungary', university_name: 'University of Debrecen', tuition_per_year: 4000, duration: '2 Years' }
];

document.addEventListener('DOMContentLoaded', async () => {
    setupMobileMenu();
    await fetchPortalData();
    setupEventListeners();
});

// Mobile Navigation Toggle
function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Fetch Portal Data safely from Supabase
async function fetchPortalData() {
    try {
        if (!supabase) throw new Error("Supabase client library not initialized.");

        const [cRes, uRes, pRes, sRes] = await Promise.allSettled([
            supabase.from('countries').select('*'),
            supabase.from('universities').select('*'),
            supabase.from('programs').select('*'),
            supabase.from('scholarships').select('*')
        ]);

        globalData.countries = (cRes.status === 'fulfilled' && cRes.value.data && cRes.value.data.length > 0) 
            ? cRes.value.data : MOCK_COUNTRIES;
            
        globalData.universities = (uRes.status === 'fulfilled' && uRes.value.data) ? uRes.value.data : [];
        globalData.programs = (pRes.status === 'fulfilled' && pRes.value.data && pRes.value.data.length > 0) 
            ? pRes.value.data : MOCK_PROGRAMS;
            
        globalData.scholarships = (sRes.status === 'fulfilled' && sRes.value.data) ? sRes.value.data : [];

    } catch (err) {
        console.warn('Supabase Fetch Warning, using resilient data:', err);
        globalData.countries = MOCK_COUNTRIES;
        globalData.programs = MOCK_PROGRAMS;
    } finally {
        renderCountries();
        renderDropdowns();
        renderPrograms(globalData.programs);
        renderScholarships();
    }
}

// Render Top 10 Countries
function renderCountries() {
    const container = document.getElementById('countryGrid') || document.getElementById('countriesGrid');
    if (!container) return;

    // Sort countries according to DESTINATION_ORDER
    const sortedCountries = [...globalData.countries].sort((a, b) => {
        let indexA = DESTINATION_ORDER.indexOf(a.name);
        let indexB = DESTINATION_ORDER.indexOf(b.name);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
    });

    container.innerHTML = sortedCountries.map((country, idx) => {
        const countryCode = (country.code || getCountryCode(country.name)).toLowerCase();
        const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;
        
        return `
            <div class="country-card">
                <div class="country-flag-box">
                    <span class="country-badge-num">#${idx + 1}</span>
                    <img src="${flagUrl}" alt="${country.name}" class="country-flag-img" onerror="this.src='https://flagcdn.com/w160/un.png'">
                </div>
                <div class="country-body">
                    <div>
                        <h3 class="country-name">${country.name}</h3>
                        <p class="country-univ-count"><i class="fa-solid fa-building-columns"></i> Accredited Universities</p>
                    </div>
                    <button onclick="filterProgramsByCountry('${country.name}')" class="btn-country-explore">
                        Explore Degrees <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Program Cards
function renderPrograms(programsList) {
    const container = document.getElementById('programGrid');
    if (!container) return;

    if (!programsList || programsList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px; background:#fff; border-radius:8px;">
                <i class="fa-solid fa-circle-exclamation fa-2x" style="color: var(--inti-red);"></i>
                <p style="margin-top:10px; font-weight:600;">No matching degree programs found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = programsList.map(prog => {
        const country = prog.country_name || (prog.universities ? prog.universities.country_name : 'Global');
        const univ = prog.university_name || (prog.universities ? prog.universities.name : 'Partner University');
        const tuition = prog.tuition_per_year ? `$${prog.tuition_per_year.toLocaleString()} / year` : 'Varies';
        
        const waText = encodeURIComponent(`Hello EduVexa Team, I would like to apply for the "${prog.name}" programme at ${univ} (${country}). Please guide me through admission.`);

        return `
            <div class="program-card">
                <div>
                    <div class="program-header">
                        <span class="degree-badge">${prog.level || 'Degree'}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${country}</span>
                    </div>
                    <h3 class="program-title">${prog.name}</h3>
                    <p class="program-univ"><i class="fa-solid fa-building-columns"></i> ${univ}</p>
                    
                    <div class="program-details">
                        <div class="detail-item">
                            <span>Tuition Fee</span>
                            <strong>${tuition}</strong>
                        </div>
                        <div class="detail-item">
                            <span>Duration</span>
                            <strong>${prog.duration || '3-4 Years'}</strong>
                        </div>
                    </div>
                </div>

                <a href="https://wa.me/8801811909779?text=${waText}" target="_blank" class="btn-apply-wa">
                    <i class="fa-brands fa-whatsapp"></i> Apply via WhatsApp
                </a>
            </div>
        `;
    }).join('');
}

// Populate Search Dropdowns
function renderDropdowns() {
    const whereToStudy = document.getElementById('whereToStudy');
    const filterCountry = document.getElementById('filterCountry');

    const countryOptions = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    if (whereToStudy) whereToStudy.innerHTML = `<option value="">All Destinations</option>` + countryOptions;
    if (filterCountry) filterCountry.innerHTML = `<option value="">All Countries</option>` + countryOptions;
}

// Render Scholarships
function renderScholarships() {
    const container = document.getElementById('scholarshipGrid');
    if (!container) return;

    if (!globalData.scholarships || globalData.scholarships.length === 0) {
        container.innerHTML = `
            <div class="scholarship-card">
                <h3 class="scholarship-title">Stipendium Hungaricum Scholarship</h3>
                <p class="scholarship-coverage">100% Tuition Fee Waiver + Monthly Stipend</p>
                <p style="font-size:0.85rem; color:var(--text-muted);">Fully funded government scholarship for Bachelor, Master, and PhD degrees in Hungary.</p>
            </div>
            <div class="scholarship-card">
                <h3 class="scholarship-title">Slovak Government National Scholarship</h3>
                <p class="scholarship-coverage">Full Tuition Waiver + Living Allowance</p>
                <p style="font-size:0.85rem; color:var(--text-muted);">Open for international students applying for higher studies in Slovak Republic.</p>
            </div>
            <div class="scholarship-card">
                <h3 class="scholarship-title">Chinese Government Scholarship (CSC)</h3>
                <p class="scholarship-coverage">100% Tuition + Accommodation + Health Insurance</p>
                <p style="font-size:0.85rem; color:var(--text-muted);">Comprehensive financial aid across top Tier-1 Chinese universities.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = globalData.scholarships.map(s => `
        <div class="scholarship-card">
            <h3 class="scholarship-title">${s.title || s.name}</h3>
            <p class="scholarship-coverage">${s.coverage || 'Full / Partial Tuition Waiver'}</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">${s.description || 'Verified international scholarship scheme.'}</p>
        </div>
    `).join('');
}

// Event Listeners for Filters
function setupEventListeners() {
    const heroBtn = document.getElementById('btnHeroSearch');
    if (heroBtn) {
        heroBtn.addEventListener('click', applyHeroSearch);
    }

    const filterKeyword = document.getElementById('filterKeyword');
    const filterCountry = document.getElementById('filterCountry');
    const filterDegree = document.getElementById('filterDegree');
    const filterTuition = document.getElementById('filterTuition');
    const btnReset = document.getElementById('btnResetFilters');

    if (filterKeyword) filterKeyword.addEventListener('input', applyFilters);
    if (filterCountry) filterCountry.addEventListener('change', applyFilters);
    if (filterDegree) filterDegree.addEventListener('change', applyFilters);
    if (filterTuition) filterTuition.addEventListener('change', applyFilters);
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (filterKeyword) filterKeyword.value = '';
            if (filterCountry) filterCountry.value = '';
            if (filterDegree) filterDegree.value = '';
            if (filterTuition) filterTuition.value = '';
            renderPrograms(globalData.programs);
        });
    }
}

// Apply Filters Logic
function applyFilters() {
    const keyword = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
    const country = document.getElementById('filterCountry')?.value || '';
    const degree = document.getElementById('filterDegree')?.value || '';
    const maxTuition = parseFloat(document.getElementById('filterTuition')?.value) || 0;

    let filtered = globalData.programs.filter(p => {
        const pName = (p.name || '').toLowerCase();
        const pCountry = p.country_name || (p.universities ? p.universities.country_name : '');
        const pLevel = p.level || '';
        const pTuition = p.tuition_per_year || 0;

        const matchKeyword = !keyword || pName.includes(keyword);
        const matchCountry = !country || pCountry === country;
        const matchDegree = !degree || pLevel === degree;
        const matchTuition = !maxTuition || (pTuition > 0 && pTuition <= maxTuition);

        return matchKeyword && matchCountry && matchDegree && matchTuition;
    });

    renderPrograms(filtered);
}

function applyHeroSearch() {
    const searchProg = document.getElementById('searchProgram')?.value || '';
    const destination = document.getElementById('whereToStudy')?.value || '';
    const level = document.getElementById('degreeLevel')?.value || '';

    if (document.getElementById('filterKeyword')) document.getElementById('filterKeyword').value = searchProg;
    if (document.getElementById('filterCountry')) document.getElementById('filterCountry').value = destination;
    if (document.getElementById('filterDegree')) document.getElementById('filterDegree').value = level;

    applyFilters();
    document.getElementById('programmes')?.scrollIntoView({ behavior: 'smooth' });
}

function filterProgramsByCountry(countryName) {
    const filterCountry = document.getElementById('filterCountry');
    if (filterCountry) filterCountry.value = countryName;
    applyFilters();
    document.getElementById('programmes')?.scrollIntoView({ behavior: 'smooth' });
}

// Country Code Helper
function getCountryCode(countryName) {
    const map = {
        'Malaysia': 'my', 'Slovakia': 'sk', 'Romania': 'ro', 'Hungary': 'hu',
        'Lithuania': 'lt', 'China': 'cn', 'India': 'in', 'Italy': 'it',
        'Turkey': 'tr', 'Uzbekistan': 'uz'
    };
    return map[countryName] || 'un';
}
