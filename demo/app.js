/* ==========================================================================
   EDUVEXA DEMO ENGINE v12.2 - RICH DATA & FIXED FILTERING LOGIC
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
    { name: 'Slovakia', code: 'sk', region: 'Europe (Schengen)', desc: 'Schengen country offering high academic standards with Schengen work opportunities.' },
    { name: 'Romania', code: 'ro', region: 'Europe (Schengen)', desc: 'Renowned for Medicine, Engineering, and Information Technology degrees.' },
    { name: 'Hungary', code: 'hu', region: 'Europe (Schengen)', desc: 'Home to historic universities and generous Stipendium Hungaricum scholarships.' },
    { name: 'Lithuania', code: 'lt', region: 'Europe (Schengen)', desc: 'High-tech Baltic hub with low tuition fees and vibrant student startup life.' },
    { name: 'China', code: 'cn', region: 'Asia', desc: 'Top global ranked universities with fully-funded government scholarships.' },
    { name: 'India', code: 'in', region: 'Asia', desc: 'Affordable quality engineering, pharmacy, and management education.' },
    { name: 'Italy', code: 'it', region: 'Europe (Schengen)', desc: 'Historic European excellence with DSU regional full scholarships for international students.' },
    { name: 'Turkey', code: 'tr', region: 'Eurasia', desc: 'Bridge between East and West offering English-taught quality degree programs.' },
    { name: 'Uzbekistan', code: 'uz', region: 'Central Asia', desc: 'Emerging hub for affordable international MBBS and Medical studies.' }
];

// 2. DEFAULT RICH PROGRAMMES DATA (COVERING ALL DEGREE & BUDGET COMBINATIONS)
const DEFAULT_PROGRAMMES = [
    // MALAYSIA
    { title: 'B.Sc. in Computer Science', university: 'INTI International University', country: 'Malaysia', degree: 'Bachelor', tuition: '$4,200 / year', duration: '3 Years', intake: 'Jan, May, Sep' },
    { title: 'Master of Business Administration (MBA)', university: 'Asia Pacific University (APU)', country: 'Malaysia', degree: 'Master', tuition: '$5,500 / year', duration: '2 Years', intake: 'Feb, Aug' },
    
    // SLOVAKIA
    { title: 'B.Sc. Information Technology & Systems', university: 'Slovak University of Technology', country: 'Slovakia', degree: 'Bachelor', tuition: '€2,800 / year', duration: '3 Years', intake: 'September' },
    { title: 'Master of Business Administration (MBA)', university: 'Comenius University Bratislava', country: 'Slovakia', degree: 'Master', tuition: '€3,500 / year', duration: '2 Years', intake: 'September' },
    
    // ROMANIA
    { title: 'B.Sc. Software Engineering', university: 'Technical University of Cluj-Napoca', country: 'Romania', degree: 'Bachelor', tuition: '€2,500 / year', duration: '4 Years', intake: 'September' },
    { title: 'General Medicine (MD / MBBS)', university: 'Iuliu Hațieganu University', country: 'Romania', degree: 'Bachelor', tuition: '€6,000 / year', duration: '6 Years', intake: 'September' },
    
    // HUNGARY
    { title: 'B.Sc. Business Administration', university: 'University of Debrecen', country: 'Hungary', degree: 'Bachelor', tuition: '$2,950 / year', duration: '3.5 Years', intake: 'Sep, Feb' },
    { title: 'M.Sc. Data Science & AI', university: 'Eötvös Loránd University (ELTE)', country: 'Hungary', degree: 'Master', tuition: '$4,800 / year', duration: '2 Years', intake: 'September' },
    
    // LITHUANIA
    { title: 'B.Sc. Cyber Security', university: 'Kaunas University of Technology', country: 'Lithuania', degree: 'Bachelor', tuition: '€2,900 / year', duration: '4 Years', intake: 'September' },
    { title: 'M.Sc. International Business', university: 'Vilnius University', country: 'Lithuania', degree: 'Master', tuition: '€3,800 / year', duration: '2 Years', intake: 'September' },
    
    // CHINA
    { title: 'Bachelor of Civil Engineering', university: 'Tsinghua University Campus', country: 'China', degree: 'Bachelor', tuition: '$2,800 / year', duration: '4 Years', intake: 'September' },
    { title: 'Master of International Trade', university: 'Zhejiang University', country: 'China', degree: 'Master', tuition: '$3,500 / year', duration: '2 Years', intake: 'September' },
    
    // INDIA
    { title: 'Bachelor of Pharmacy (B.Pharm)', university: 'Chandigarh University', country: 'India', degree: 'Bachelor', tuition: '$2,400 / year', duration: '4 Years', intake: 'July' },
    { title: 'B.Tech in Computer Science', university: 'Lovely Professional University', country: 'India', degree: 'Bachelor', tuition: '$2,800 / year', duration: '4 Years', intake: 'August' },
    
    // ITALY
    { title: 'Bachelor of Business & Economics', university: 'University of Bologna', country: 'Italy', degree: 'Bachelor', tuition: '€2,600 / year', duration: '3 Years', intake: 'September' },
    { title: 'M.Sc. Artificial Intelligence', university: 'Politecnico di Milano', country: 'Italy', degree: 'Master', tuition: '€3,900 / year', duration: '2 Years', intake: 'Sep, Feb' },
    
    // TURKEY
    { title: 'B.Sc. Biomedical Engineering', university: 'Istanbul Bilgi University', country: 'Turkey', degree: 'Bachelor', tuition: '$2,900 / year', duration: '4 Years', intake: 'Oct, Feb' },
    { title: 'M.A. International Relations', university: 'Middle East Technical University', country: 'Turkey', degree: 'Master', tuition: '$4,200 / year', duration: '2 Years', intake: 'September' },
    
    // UZBEKISTAN
    { title: 'B.Sc. Business Management', university: 'Tashkent State University', country: 'Uzbekistan', degree: 'Bachelor', tuition: '$2,200 / year', duration: '4 Years', intake: 'September' },
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
    // 1. Instant rendering preset data
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
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; background:#fff; border-radius:8px; border:1px solid #e2e8f0;">
                <i class="fas fa-search" style="font-size: 2.8rem; color: #cbd5e1; margin-bottom: 12px; display:block;"></i>
                <h3 style="color:#002D5B; margin-bottom:8px;">No Programmes Match Your Search</h3>
                <p style="color:#64748B; font-size:0.9rem; margin-bottom:15px;">Try adjusting your degree level or tuition filter to see more results.</p>
                <button onclick="resetProgramFilters()" style="background:#E31E24; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;">
                    <i class="fas fa-undo"></i> Reset All Filters
                </button>
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
   EVENT LISTENERS & FILTERING ENGINE
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

// HELPER: PARSE NUMERIC TUITION AMOUNT FROM STRING
function parseTuitionAmount(tuitionStr) {
    if (!tuitionStr) return 0;
    const matches = tuitionStr.match(/\d+[\d,.]*/);
    if (!matches) return 0;
    return parseInt(matches[0].replace(/,/g, ''), 10);
}

// APPLY PROGRAM FILTERS WITH ACCURATE TUITION RANGE MATCHING
function applyProgramFilters() {
    const keyword = (document.getElementById('filterKeyword')?.value || '').toLowerCase().trim();
    const country = (document.getElementById('filterCountry')?.value || '').toLowerCase().trim();
    const degree = (document.getElementById('filterDegree')?.value || '').toLowerCase().trim();
    const tuitionRange = document.getElementById('filterTuition')?.value || '';

    let filtered = currentPrograms.filter(p => {
        // Keyword Match
        const matchesKeyword = !keyword || 
            p.title.toLowerCase().includes(keyword) || 
            p.university.toLowerCase().includes(keyword) ||
            p.country.toLowerCase().includes(keyword);

        // Country Match
        const matchesCountry = !country || p.country.toLowerCase() === country;

        // Degree Match
        const matchesDegree = !degree || p.degree.toLowerCase().includes(degree);

        // Tuition Range Match
        let matchesTuition = true;
        if (tuitionRange) {
            const amount = parseTuitionAmount(p.tuition);
            if (tuitionRange === 'low') {
                matchesTuition = amount <= 3000;
            } else if (tuitionRange === 'mid') {
                matchesTuition = amount > 3000 && amount <= 6000;
            } else if (tuitionRange === 'high') {
                matchesTuition = amount > 6000;
            }
        }

        return matchesKeyword && matchesCountry && matchesDegree && matchesTuition;
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
            const fetchedPrograms = programsRes.value.data.map(p => ({
                title: p.title || p.name,
                university: p.university_name || 'Partner University',
                country: p.country_name || 'Study Destination',
                degree: p.degree_level || 'Degree',
                tuition: p.tuition_fee ? `$${p.tuition_fee} / year` : 'Flexible Tuition',
                duration: p.duration || '3-4 Years',
                intake: p.intake || 'Multiple Intakes'
            }));
            currentPrograms = [...fetchedPrograms, ...DEFAULT_PROGRAMMES];
            applyProgramFilters();
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
        console.log('Supabase Sync Notice: Using preset data.', err);
    }
}
