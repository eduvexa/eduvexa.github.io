/* ==========================================================================
   EduVexa - INTI Portal App JS (V12.0 Instant Render Engine)
   Dual WhatsApp Routing & Instant Display
   ========================================================================== */

const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';

let supabase = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 10 Mandatory Countries in Exact Priority Order
const DESTINATION_ORDER = [
    "Malaysia", "Slovakia", "Romania", "Hungary", "Lithuania",
    "China", "India", "Italy", "Turkey", "Uzbekistan"
];

// Guaranteed Immediate Render Data
const DEFAULT_COUNTRIES = [
    { id: '1', name: 'Malaysia', code: 'my' },
    { id: '2', name: 'Slovakia', code: 'sk' },
    { id: '3', name: 'Romania', code: 'ro' },
    { id: '4', name: 'Hungary', code: 'hu' },
    { id: '5', name: 'Lithuania', code: 'lt' },
    { id: '6', name: 'China', code: 'cn' },
    { id: '7', name: 'India', code: 'in' },
    { id: '8', name: 'Italy', code: 'it' },
    { id: '9', name: 'Turkey', code: 'tr' },
    { id: '10', name: 'Uzbekistan', code: 'uz' }
];

const DEFAULT_PROGRAMS = [
    { id: 'p1', name: 'BSc in Computer Science & AI', level: 'Bachelor', country_name: 'Malaysia', university_name: 'INTI International University', tuition_per_year: 4500, duration: '3 Years' },
    { id: 'p2', name: 'MSc in General Medicine (MD)', level: 'Master', country_name: 'Slovakia', university_name: 'Comenius University Jessenius', tuition_per_year: 9500, duration: '6 Years' },
    { id: 'p3', name: 'Bachelor of Software Engineering', level: 'Bachelor', country_name: 'Romania', university_name: 'Technical University of Cluj-Napoca', tuition_per_year: 3200, duration: '4 Years' },
    { id: 'p4', name: 'MSc in Business Analytics & Leadership', level: 'Master', country_name: 'Hungary', university_name: 'University of Debrecen', tuition_per_year: 4000, duration: '2 Years' },
    { id: 'p5', name: 'BSc in Information Systems', level: 'Bachelor', country_name: 'Lithuania', university_name: 'Vilnius Tech University', tuition_per_year: 3100, duration: '3.5 Years' },
    { id: 'p6', name: 'Bachelor of Civil Engineering', level: 'Bachelor', country_name: 'China', university_name: 'Zhejiang University', tuition_per_year: 2800, duration: '4 Years' }
];

const DEFAULT_SCHOLARSHIPS = [
    { id: 's1', title: 'Stipendium Hungaricum Scholarship', coverage: '100% Tuition Fee Waiver + Monthly Stipend', description: 'Fully funded government scholarship for Bachelor, Master, and PhD degrees in Hungary.' },
    { id: 's2', title: 'Slovak Government National Scholarship', coverage: 'Full Tuition Waiver + Living Allowance', description: 'Open for international students applying for higher studies in Slovak Republic.' },
    { id: 's3', title: 'Chinese Government Scholarship (CSC)', coverage: '100% Tuition + Accommodation + Health Insurance', description: 'Comprehensive financial aid across top Tier-1 Chinese universities.' }
];

const DEFAULT_SERVICES = [
    { icon: 'fa-user-graduate', title: 'Free One-on-One Counseling', desc: 'Get expert guidance from certified education consultants to select the best country and university.' },
    { icon: 'fa-file-signature', title: 'University Admission & Direct Offer', desc: 'Direct application processing with guaranteed fast offer letter generation from partner universities.' },
    { icon: 'fa-passport', title: '100% Visa File Guidance', desc: 'Step-by-step assistance with embassy documentation, financial proofing, and interview preparation.' }
];

let globalData = {
    countries: DEFAULT_COUNTRIES,
    programs: DEFAULT_PROGRAMS,
    scholarships: DEFAULT_SCHOLARSHIPS
};

// Immediate DOM Setup
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    
    // Step 1: Render Default UI Instantly
    renderAll();

    // Step 2: Background Sync from Supabase
    syncSupabaseData();

    // Step 3: Event Listeners
    setupEventListeners();
});

function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function renderAll() {
    renderCountries();
    renderDropdowns();
    renderPrograms(globalData.programs);
    renderScholarships();
    renderServices();
}

async function syncSupabaseData() {
    if (!supabase) return;

    try {
        const [cRes, pRes, sRes] = await Promise.allSettled([
            supabase.from('countries').select('*'),
            supabase.from('programs').select('*'),
            supabase.from('scholarships').select('*')
        ]);

        if (cRes.status === 'fulfilled' && cRes.value.data && cRes.value.data.length > 0) {
            globalData.countries = cRes.value.data;
        }
        if (pRes.status === 'fulfilled' && pRes.value.data && pRes.value.data.length > 0) {
            globalData.programs = pRes.value.data;
        }
        if (sRes.status === 'fulfilled' && sRes.value.data && sRes.value.data.length > 0) {
            globalData.scholarships = sRes.value.data;
        }

        renderAll();
    } catch (e) {
        console.log("Using cached default data");
    }
}

// Render Country Cards
function renderCountries() {
    const container = document.getElementById('countryGrid');
    if (!container) return;

    const sorted = [...globalData.countries].sort((a, b) => {
        let ia = DESTINATION_ORDER.indexOf(a.name);
        let ib = DESTINATION_ORDER.indexOf(b.name);
        if (ia === -1) ia = 99;
        if (ib === -1) ib = 99;
        return ia - ib;
    });

    container.innerHTML = sorted.map((country, idx) => {
        const code = (country.code || getCountryCode(country.name)).toLowerCase();
        const flagUrl = `https://flagcdn.com/w160/${code}.png`;

        return `
            <div class="country-card">
                <div class="country-flag-box">
                    <span class="country-badge-num">#${idx + 1}</span>
                    <img src="${flagUrl}" alt="${country.name}" class="country-flag-img" onerror="this.src='https://flagcdn.com/w160/un.png'">
                </div>
                <div class="country-body">
                    <div>
                        <h3 class="country-name">${country.name}</h3>
                        <p class="country-univ-count"><i class="fa-solid fa-building-columns"></i> Accredited Higher Education</p>
                    </div>
                    <button onclick="filterProgramsByCountry('${country.name}')" class="btn-country-explore">
                        Explore Degrees <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Programs with Dual WhatsApp option
function renderPrograms(list) {
    const container = document.getElementById('programGrid');
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 30px; background:#fff; border-radius:8px;">
                <p style="font-weight:600; color:var(--inti-navy);">No degree programs found matching criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(p => {
        const country = p.country_name || 'Global';
        const univ = p.university_name || 'Partner University';
        const tuition = p.tuition_per_year ? `$${p.tuition_per_year.toLocaleString()} / year` : 'Varies';
        
        const waTextBD = encodeURIComponent(`Hello EduVexa BD Team, I want to apply for "${p.name}" at ${univ} (${country}).`);
        const waTextEU = encodeURIComponent(`Hello EduVexa EU Team, I want to apply for "${p.name}" at ${univ} (${country}).`);

        return `
            <div class="program-card">
                <div>
                    <div class="program-header">
                        <span class="degree-badge">${p.level || 'Degree'}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${country}</span>
                    </div>
                    <h3 class="program-title">${p.name}</h3>
                    <p class="program-univ"><i class="fa-solid fa-building-columns"></i> ${univ}</p>
                    
                    <div class="program-details">
                        <div class="detail-item">
                            <span>Tuition Fee</span>
                            <strong>${tuition}</strong>
                        </div>
                        <div class="detail-item">
                            <span>Duration</span>
                            <strong>${p.duration || '3-4 Years'}</strong>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <a href="https://wa.me/8801811909779?text=${waTextBD}" target="_blank" class="btn-apply-wa">
                        <i class="fa-brands fa-whatsapp"></i> BD Apply
                    </a>
                    <a href="https://wa.me/393509313338?text=${waTextEU}" target="_blank" class="btn-apply-wa" style="background:#0078D7;">
                        <i class="fa-brands fa-whatsapp"></i> EU Apply
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function renderDropdowns() {
    const whereToStudy = document.getElementById('whereToStudy');
    const filterCountry = document.getElementById('filterCountry');

    const opts = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    if (whereToStudy) whereToStudy.innerHTML = `<option value="">All Destinations</option>` + opts;
    if (filterCountry) filterCountry.innerHTML = `<option value="">All Countries</option>` + opts;
}

function renderScholarships() {
    const container = document.getElementById('scholarshipGrid');
    if (!container) return;

    container.innerHTML = globalData.scholarships.map(s => `
        <div class="scholarship-card">
            <h3 class="scholarship-title">${s.title || s.name}</h3>
            <p class="scholarship-coverage">${s.coverage || 'Full Tuition Waiver'}</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">${s.description || 'Verified international scholarship.'}</p>
        </div>
    `).join('');
}

function renderServices() {
    const container = document.getElementById('servicesGrid');
    if (!container) return;

    container.innerHTML = DEFAULT_SERVICES.map(srv => `
        <div class="scholarship-card" style="border-top-color: var(--inti-navy);">
            <div style="font-size:2rem; color:var(--inti-red); margin-bottom:10px;">
                <i class="fa-solid ${srv.icon}"></i>
            </div>
            <h3 class="scholarship-title">${srv.title}</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">${srv.desc}</p>
        </div>
    `).join('');
}

function setupEventListeners() {
    const btnHero = document.getElementById('btnHeroSearch');
    if (btnHero) btnHero.addEventListener('click', applyHeroSearch);

    const fk = document.getElementById('filterKeyword');
    const fc = document.getElementById('filterCountry');
    const fd = document.getElementById('filterDegree');
    const ft = document.getElementById('filterTuition');
    const btnReset = document.getElementById('btnResetFilters');

    if (fk) fk.addEventListener('input', applyFilters);
    if (fc) fc.addEventListener('change', applyFilters);
    if (fd) fd.addEventListener('change', applyFilters);
    if (ft) ft.addEventListener('change', applyFilters);

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (fk) fk.value = '';
            if (fc) fc.value = '';
            if (fd) fd.value = '';
            if (ft) ft.value = '';
            renderPrograms(globalData.programs);
        });
    }
}

function applyFilters() {
    const kw = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
    const country = document.getElementById('filterCountry')?.value || '';
    const degree = document.getElementById('filterDegree')?.value || '';
    const maxT = parseFloat(document.getElementById('filterTuition')?.value) || 0;

    let filtered = globalData.programs.filter(p => {
        const pName = (p.name || '').toLowerCase();
        const pCountry = p.country_name || '';
        const pLevel = p.level || '';
        const pTuition = p.tuition_per_year || 0;

        const mKw = !kw || pName.includes(kw);
        const mCountry = !country || pCountry === country;
        const mDegree = !degree || pLevel === degree;
        const mTuition = !maxT || (pTuition > 0 && pTuition <= maxT);

        return mKw && mCountry && mDegree && mTuition;
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
    const fc = document.getElementById('filterCountry');
    if (fc) fc.value = countryName;
    applyFilters();
    document.getElementById('programmes')?.scrollIntoView({ behavior: 'smooth' });
}

function getCountryCode(countryName) {
    const map = {
        'Malaysia': 'my', 'Slovakia': 'sk', 'Romania': 'ro', 'Hungary': 'hu',
        'Lithuania': 'lt', 'China': 'cn', 'India': 'in', 'Italy': 'it',
        'Turkey': 'tr', 'Uzbekistan': 'uz'
    };
    return map[countryName] || 'un';
}
