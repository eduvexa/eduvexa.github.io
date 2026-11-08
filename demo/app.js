/* ==========================================================================
   EDUVEXA DEMO ENGINE v12.1 - FULLY FIXED & FAST RENDER
   ========================================================================== */

// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 1. DEFAULT COUNTRIES DATA (10 COUNTRIES STRICT ORDER)
const DEFAULT_COUNTRIES = [
    { name: 'Malaysia', code: 'my', region: 'Asia', desc: 'World-class British and Australian branch campuses with affordable living cost.' },
    { name: 'Slovakia', code: 'sk', region: 'Europe (Schengen)', desc: 'Schengen country offer high academic standards with Schengen work opportunity.' },
    { name: 'Romania', code: 'ro', region: 'Europe (Schengen)', desc: 'Renowned for Medicine, Engineering, and Information Technology degrees.' },
    { name: 'Hungary', code: 'hu', region: 'Europe (Schengen)', desc: 'Home to historic universities and generous Stipendium Hungaricum scholarships.' },
    { name: 'Lithuania', code: 'lt', region: 'Europe (Schengen)', desc: 'High-tech Baltic hub with low tuition fees and vibrant student startup life.' },
    { name: 'China', code: 'cn', region: 'Asia', desc: 'Top global ranked universities with fully-funded government scholarships.' },
    { name: 'India', code: 'in', region: 'Asia', desc: 'Affordable quality engineering, pharmacy, and management education.' },
    { name: 'Italy', code: 'it', region: 'Europe (Schengen)', desc: 'Historic European excellence with DSU regional full scholarships for international students.' },
    { name: 'Turkey', code: 'tr', region: 'Eurasia', desc: 'Bridge between East and West offering English-taught quality degree programs.' },
    { name: 'Uzbekistan', code: 'uz', region: 'Central Asia', desc: 'Emerging hub for affordable international MBBS and Medical studies.' }
];

// 2. DEFAULT PROGRAMMES DATA
const DEFAULT_PROGRAMMES = [
    { title: 'B.Sc. in Computer Science', university: 'INTI International University', country: 'Malaysia', degree: 'Bachelor', tuition: '$4,200 / year', duration: '3 Years', intake: 'Jan, May, Sep' },
    { title: 'Master of Business Administration (MBA)', university: 'Slovak University of Technology', country: 'Slovakia', degree: 'Master', tuition: '€3,500 / year', duration: '2 Years', intake: 'September' },
    { title: 'General Medicine (MD / MBBS)', university: 'Iuliu Hațieganu University', country: 'Romania', degree: 'Bachelor', tuition: '€6,000 / year', duration: '6 Years', intake: 'September' },
    { title: 'B.Sc. Software Engineering', university: 'University of Debrecen', country: 'Hungary', degree: 'Bachelor', tuition: '$6,500 / year', duration: '3.5 Years', intake: 'Sep, Feb' },
    { title: 'M.Sc. Information Technology', university: 'Kaunas University of Technology', country: 'Lithuania', degree: 'Master', tuition: '€3,800 / year', duration: '2 Years', intake: 'September' },
    { title: 'Bachelor of Civil Engineering', university: 'Tsinghua University Campus', country: 'China', degree: 'Bachelor', tuition: '$3,200 / year', duration: '4 Years', intake: 'September' },
    { title: 'Bachelor of Pharmacy (B.Pharm)', university: 'Chandigarh University', country: 'India', degree: 'Bachelor', tuition: '$2,400 / year', duration: '4 Years', intake: 'July' },
    { title: 'M.Sc. Artificial Intelligence', university: 'Politecnico di Milano', country: 'Italy', degree: 'Master', tuition: '€3,900 / year', duration: '2 Years', intake: 'Sep, Feb' },
    { title: 'B.A. International Relations', university: 'Istanbul Bilgi University', country: 'Turkey', degree: 'Bachelor', tuition: '$4,500 / year', duration: '4 Years', intake: 'Oct, Feb' },
    { title: 'MD / General Medicine', university: 'Tashkent Medical Academy', country: 'Uzbekistan', degree: 'Bachelor', tuition: '$3,800 / year', duration: '5 Years', intake: 'September' }
];

// 3. DEFAULT SCHOLARSHIPS DATA
const DEFAULT_SCHOLARSHIPS = [
    { title: 'Stipendium Hungaricum Scholarship', country: 'Hungary', coverage: 'Full Tuition + Monthly Stipend', deadline: 'January 15, 2026', desc: 'Fully funded scholarship by the Hungarian Government for Bachelor, Master, & PhD studies.' },
    { title: 'Italian DSU Regional Scholarship', country: 'Italy', coverage: '100% Tuition Fee Waiver + €7,000 Grant', deadline: 'September 30, 2025', desc: 'Need-based scholarship covering full tuition, free accommodation, and meal passes.' },
    { title: 'Chinese Government Scholarship (CSC)', country: 'China', coverage: 'Full Tuition + Accommodation + Allowance', deadline: 'March 31, 2026', desc: 'Covers all degree programs with high acceptance rates for international applicants.' },
    { title: 'Slovak National Scholarship Programme', country: 'Slovakia', coverage: 'Monthly Living Allowance (€400 - €1,000)', deadline: 'April 30, 2026', desc: 'Supports international student mobility and higher education research studies.' }
];

// 4. DEFAULT SERVICES DATA
const DEFAULT_SERVICES = [
    { icon: 'fa-user-tie', title: '1-on-1 Academic Counseling', desc: 'Free personalized profile evaluation and university shortlisting by senior consultants.' },
    { icon: 'fa-file-signature', title: 'Admission & Application Processing', desc: 'Direct application submission with guaranteed fast offer letter issuing.' },
    { icon: 'fa-passport', title: 'Schengen & Global Visa Assistance', desc: 'Step-by-step guidance on file preparation, embassy appointment, and mock interview.' },
    { icon: 'fa-plane-departure', title: 'Pre-Departure & Airport Pickup', desc: 'Full flight briefing, currency guidance, and airport reception upon arrival.' }
];

// CURRENT APP STATE
let currentPrograms = [...DEFAULT_PROGRAMMES];

// INITIALIZE APP ON DOM CONTENT LOADED
document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant rendering fallback data
    renderCountries(DEFAULT_COUNTRIES);
    renderPrograms(DEFAULT_PROGRAMMES);
    renderScholarships(DEFAULT_SCHOLARSHIPS);
    renderServices(DEFAULT_SERVICES);

    // 2. Setup all UI Event Listeners
    setupEventListeners();

    // 3. Sync dynamic data from Supabase in background
    syncSupabaseData();
});

/* ==========================================================================
   RENDER FUNCTIONS
   ========================================================================== */

// RENDER 10 COUNTRIES
function renderCountries(countries) {
    const grid = document.getElementById('countryGrid');
    if (!grid) return;

    grid.innerHTML = countries.map(c => `
        <div class="country-card">
            <div class="country-flag-wrap">
                <img src="https://flagcdn.com/w160/${c.code.toLowerCase()}.png" alt="${c.name} Flag" class="country-flag">
            </div>
            <div class="country-info">
                <span class="country-region">${c.region || 'International'}</span>
                <h3 class="country-name">${c.name}</h3>
                <p class="country-desc">${c.desc}</p>
                <button onclick="filterByCountryName('${c.name}')" class="btn-country-explore">
                    Explore Programmes <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// RENDER PROGRAMMES
function renderPrograms(programs) {
    const grid = document.getElementById('programGrid');
    if (!grid) return;

    if (programs.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; background:#fff; border-radius:8px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                <h3>No Programmes Found</h3>
                <p>Try clearing your filters or changing your search criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = programs.map(p => {
        const waTextBD = encodeURIComponent(`Hello EduVexa BD, I want to apply for ${p.title} at ${p.university} (${p.country}).`);
        const waTextEU = encodeURIComponent(`Hello EduVexa EU, I want to apply for ${p.title} at ${p.university} (${p.country}).`);

        return `
            <div class="program-card">
                <div class="program-header">
                    <span class="badge-degree">${p.degree}</span>
                    <span class="badge-country"><i class="fas fa-map-marker-alt"></i> ${p.country}</span>
                </div>
                <h3 class="program-title">${p.title}</h3>
                <h4 class="program-university"><i class="fas fa-university"></i> ${p.university}</h4>
                
                <div class="program-meta">
                    <div><i class="fas fa-clock"></i> Duration: <strong>${p.duration}</strong></div>
                    <div><i class="fas fa-calendar-alt"></i> Intake: <strong>${p.intake}</strong></div>
                    <div><i class="fas fa-money-bill-wave"></i> Tuition: <strong>${p.tuition}</strong></div>
                </div>

                <div class="program-actions">
                    <a href="https://wa.me/8801811909779?text=${waTextBD}" target="_blank" class="btn-apply-wa wa-bd-btn">
                        <i class="fab fa-whatsapp"></i> BD Apply
                    </a>
                    <a href="https://wa.me/393509313338?text=${waTextEU}" target="_blank" class="btn-apply-wa wa-eu-btn">
                        <i class="fab fa-whatsapp"></i> EU Apply
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// RENDER SCHOLARSHIPS
function renderScholarships(scholarships) {
    const grid = document.getElementById('scholarshipGrid');
    if (!grid) return;

    grid.innerHTML = scholarships.map(s => `
        <div class="scholarship-card">
            <div class="scholarship-badge"><i class="fas fa-award"></i> ${s.country}</div>
            <h3 class="scholarship-title">${s.title}</h3>
            <div class="scholarship-coverage"><i class="fas fa-check-circle"></i> ${s.coverage}</div>
            <p class="scholarship-desc">${s.desc}</p>
            <div class="scholarship-footer">
                <span class="deadline"><i class="far fa-clock"></i> Deadline: ${s.deadline}</span>
                <a href="https://wa.me/8801811909779?text=I%20am%20interested%20in%20${encodeURIComponent(s.title)}" target="_blank" class="btn-scholarship-apply">Inquire Now</a>
            </div>
        </div>
    `).join('');
}

// RENDER SERVICES
function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="service-icon"><i class="fas ${s.icon}"></i></div>
            <h3 class="service-title">${s.title}</h3>
            <p class="service-desc">${s.desc}</p>
        </div>
    `).join('');
}

/* ==========================================================================
   EVENT LISTENERS & INTERACTION LOGIC
   ========================================================================== */

function setupEventListeners() {
    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 2. Hero Finder Search Button
    const btnHeroSearch = document.getElementById('btnHeroSearch');
    if (btnHeroSearch) {
        btnHeroSearch.addEventListener('click', handleHeroSearch);
    }

    // 3. Programme Filter Inputs
    const filterKeyword = document.getElementById('filterKeyword');
    const filterCountry = document.getElementById('filterCountry');
    const filterDegree = document.getElementById('filterDegree');
    const filterTuition = document.getElementById('filterTuition');
    const btnResetFilters = document.getElementById('btnResetFilters');

    if (filterKeyword) filterKeyword.addEventListener('input', applyProgramFilters);
    if (filterCountry) filterCountry.addEventListener('change', applyProgramFilters);
    if (filterDegree) filterDegree.addEventListener('change', applyProgramFilters);
    if (filterTuition) filterTuition.addEventListener('change', applyProgramFilters);
    if (btnResetFilters) btnResetFilters.addEventListener('click', resetProgramFilters);
}

// HERO SEARCH HANDLER
function handleHeroSearch() {
    const keyword = document.getElementById('searchProgram')?.value || '';
    const country = document.getElementById('whereToStudy')?.value || '';
    const degree = document.getElementById('degreeLevel')?.value || '';

    // Transfer values to detailed filter controls
    if (document.getElementById('filterKeyword')) document.getElementById('filterKeyword').value = keyword;
    if (document.getElementById('filterCountry')) document.getElementById('filterCountry').value = country;
    if (document.getElementById('filterDegree')) document.getElementById('filterDegree').value = degree;

    // Apply filters
    applyProgramFilters();

    // Smooth scroll down to programmes section
    const progSection = document.getElementById('programmes');
    if (progSection) {
        progSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// APPLY PROGRAM FILTERS
function applyProgramFilters() {
    const keyword = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
    const country = document.getElementById('filterCountry')?.value || '';
    const degree = document.getElementById('filterDegree')?.value || '';
    const tuition = document.getElementById('filterTuition')?.value || '';

    let filtered = currentPrograms.filter(p => {
        const matchesKeyword = !keyword || 
            p.title.toLowerCase().includes(keyword) || 
            p.university.toLowerCase().includes(keyword);

        const matchesCountry = !country || p.country.toLowerCase() === country.toLowerCase();
        const matchesDegree = !degree || p.degree.toLowerCase().includes(degree.toLowerCase());

        return matchesKeyword && matchesCountry && matchesDegree;
    });

    renderPrograms(filtered);
}

// RESET FILTERS
function resetProgramFilters() {
    if (document.getElementById('filterKeyword')) document.getElementById('filterKeyword').value = '';
    if (document.getElementById('filterCountry')) document.getElementById('filterCountry').value = '';
    if (document.getElementById('filterDegree')) document.getElementById('filterDegree').value = '';
    if (document.getElementById('filterTuition')) document.getElementById('filterTuition').value = '';
    if (document.getElementById('searchProgram')) document.getElementById('searchProgram').value = '';
    if (document.getElementById('whereToStudy')) document.getElementById('whereToStudy').value = '';
    if (document.getElementById('degreeLevel')) document.getElementById('degreeLevel').value = '';

    renderPrograms(currentPrograms);
}

// EXPLORE PROGRAMMES FROM COUNTRY CARD
function filterByCountryName(countryName) {
    if (document.getElementById('filterCountry')) {
        document.getElementById('filterCountry').value = countryName;
    }
    applyProgramFilters();
    const progSection = document.getElementById('programmes');
    if (progSection) {
        progSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ==========================================================================
   SUPABASE BACKGROUND DATA SYNC
   ========================================================================== */
async function syncSupabaseData() {
    if (!supabaseClient) return;

    try {
        const [countriesRes, programsRes, scholarshipsRes] = await Promise.allSettled([
            supabaseClient.from('countries').select('*').order('id', { ascending: true }),
            supabaseClient.from('programs').select('*'),
            supabaseClient.from('scholarships').select('*')
        ]);

        if (countriesRes.status === 'fulfilled' && countriesRes.value.data && countriesRes.value.data.length > 0) {
            renderCountries(countriesRes.value.data);
        }

        if (programsRes.status === 'fulfilled' && programsRes.value.data && programsRes.value.data.length > 0) {
            currentPrograms = programsRes.value.data.map(p => ({
                title: p.title || p.name,
                university: p.university_name || 'Partner University',
                country: p.country_name || 'Study Destination',
                degree: p.degree_level || 'Degree',
                tuition: p.tuition_fee ? `$${p.tuition_fee} / year` : 'Flexible Tuition',
                duration: p.duration || '3-4 Years',
                intake: p.intake || 'Multiple Intakes'
            }));
            renderPrograms(currentPrograms);
        }

        if (scholarshipsRes.status === 'fulfilled' && scholarshipsRes.value.data && scholarshipsRes.value.data.length > 0) {
            const fetchedScholarships = scholarshipsRes.value.data.map(s => ({
                title: s.title,
                country: s.country_name || 'Global',
                coverage: s.coverage || 'Partial/Full Support',
                deadline: s.application_deadline || 'Open All Year',
                desc: s.description || 'Verified scholarship opportunity for international students.'
            }));
            renderScholarships(fetchedScholarships);
        }
    } catch (err) {
        console.log('Supabase Sync Notice: Using initial preset data.', err);
    }
}
