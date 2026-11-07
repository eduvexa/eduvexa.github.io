/* ==========================================================================
   EduVexa - Global Study Abroad Directory App JS (V7.0 Verified)
   Supabase Dynamic Data Integration & WhatsApp Inquiries
   ========================================================================== */

const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';

// Initialize Supabase Client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Application State
let globalData = {
  countries: [],
  universities: [],
  programs: [],
  scholarships: []
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  renderServices();
  await loadAllDataFromSupabase();
  setupEventListeners();
});

// Fetch All Portal Data
async function loadAllDataFromSupabase() {
  if (!supabase) {
    console.error('Supabase SDK not loaded properly.');
    return;
  }

  try {
    // 1. Fetch Countries (Sorted by Priority / Name)
    const { data: countries } = await supabase
      .from('countries')
      .select('*')
      .order('name');
    globalData.countries = countries || [];

    // 2. Fetch Universities with Country details
    const { data: unis } = await supabase
      .from('universities')
      .select('*, countries(id, name, code)')
      .order('name');
    globalData.universities = unis || [];

    // 3. Fetch Programs with University & Country details
    const { data: programs } = await supabase
      .from('programs')
      .select('*, universities(*, countries(*))')
      .order('name');
    globalData.programs = programs || [];

    // 4. Fetch Scholarships with Country details
    const { data: scholarships } = await supabase
      .from('scholarships')
      .select('*, countries(id, name, code)')
      .order('title');
    globalData.scholarships = scholarships || [];

    // Populate Dropdowns & Render Initial Views
    populateDropdowns();
    renderDestinations(globalData.countries);
    renderPrograms(globalData.programs);
    renderUniversities(globalData.universities);
    renderScholarships(globalData.scholarships);

  } catch (err) {
    console.error('Error fetching Supabase data:', err);
  }
}

// Populate Country Dropdowns
function populateDropdowns() {
  const countryOptions = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  
  const heroSelect = document.getElementById('hero-destination-select');
  const filterSelect = document.getElementById('filter-country');
  const uniSelect = document.getElementById('uni-country-select');
  const schSelect = document.getElementById('scholarship-country-select');
  const studentSelect = document.getElementById('student-country');

  if (heroSelect) heroSelect.innerHTML = '<option value="">🌍 All Destinations</option>' + countryOptions;
  if (filterSelect) filterSelect.innerHTML = '<option value="">All Destinations</option>' + countryOptions;
  if (uniSelect) uniSelect.innerHTML = '<option value="">Select Country</option>' + countryOptions;
  if (schSelect) schSelect.innerHTML = '<option value="">Select Country</option>' + countryOptions;
  if (studentSelect) studentSelect.innerHTML = '<option value="">Select Country</option>' + countryOptions;
}

// Render Destinations Cards Grid
function renderDestinations(countries) {
  const container = document.getElementById('destinations-grid');
  if (!container) return;

  if (!countries || countries.length === 0) {
    container.innerHTML = '<p class="no-results">No study destinations loaded.</p>';
    return;
  }

  container.innerHTML = countries.map(c => `
    <div class="destination-card" onclick="filterByCountry('${c.name}')">
      <img src="https://flagcdn.com/w80/${c.code ? c.code.toLowerCase() : 'un'}.png" alt="${c.name} Flag" onerror="this.src='https://flagcdn.com/w80/un.png'">
      <div class="destination-info">
        <h3>${c.name}</h3>
        <span>Explore Universities &rarr;</span>
      </div>
    </div>
  `).join('');
}

// Render Programs Result List
function renderPrograms(programs) {
  const container = document.getElementById('program-cards-container');
  const countSpan = document.getElementById('results-count');
  if (!container) return;

  if (countSpan) {
    countSpan.textContent = `Found ${programs ? programs.length : 0} study programs for you`;
  }

  if (!programs || programs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; background:#FFFFFF; border-radius:12px; border:1px solid #E2E8F0;">
        <h3 style="color:#102D4E;">No matching programs found</h3>
        <p style="color:#64748B; margin-top:8px;">Try adjusting your keyword or search criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = programs.map(p => {
    const uniName = p.universities ? p.universities.name : 'Partner University';
    const countryName = p.universities && p.universities.countries ? p.universities.countries.name : '';
    const countryCode = p.universities && p.universities.countries && p.universities.countries.code ? p.universities.countries.code.toLowerCase() : '';
    const flagImg = countryCode ? `<img src="https://flagcdn.com/w80/${countryCode}.png" class="country-flag-icon" alt="${countryName}">` : '🌐';

    return `
      <div class="program-card">
        <div class="program-card-header">
          <div>
            <h3 class="program-title">${p.name}</h3>
            <div class="program-meta">
              ${flagImg} ${uniName} ${countryName ? '• ' + countryName : ''}
            </div>
          </div>
          <span class="badge-degree">${p.degree_level || 'Degree'}</span>
        </div>
        
        <div class="program-details-grid">
          <div class="detail-box">
            <span>DURATION</span>
            <strong>${p.duration || 'N/A'}</strong>
          </div>
          <div class="detail-box">
            <span>TUITION FEE</span>
            <strong>${p.tuition_fee || 'Contact for fee'}</strong>
          </div>
          <div class="detail-box">
            <span>REQUIREMENTS</span>
            <strong>${p.admission_requirements || 'Standard Entry'}</strong>
          </div>
        </div>
        
        <div class="program-card-actions">
          ${p.official_url ? `<a href="${p.official_url}" target="_blank" rel="noopener" class="official-link">View Official Page ↗</a>` : '<span></span>'}
          <button class="btn-whatsapp" onclick="inquireProgram('${escapeJs(p.name)}', '${escapeJs(uniName)}')">
            Inquire via WhatsApp
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Universities Grid
function renderUniversities(unis) {
  const container = document.getElementById('universities-grid');
  if (!container) return;

  if (!unis || unis.length === 0) {
    container.innerHTML = '<p class="no-results">No universities found.</p>';
    return;
  }

  container.innerHTML = unis.map(u => `
    <div class="uni-card">
      <div>
        <h3>${u.name}</h3>
        <p class="uni-location">📍 ${u.countries ? u.countries.name : 'International'}</p>
      </div>
      ${u.website ? `<a href="${u.website}" target="_blank" rel="noopener" class="btn-link">Official Website &rarr;</a>` : ''}
    </div>
  `).join('');
}

// Render Scholarships Grid
function renderScholarships(scholarships) {
  const container = document.getElementById('scholarships-grid');
  if (!container) return;

  if (!scholarships || scholarships.length === 0) {
    container.innerHTML = '<p class="no-results">No scholarships found.</p>';
    return;
  }

  container.innerHTML = scholarships.map(s => `
    <div class="scholarship-card">
      <div>
        <span class="badge-scholarship">${s.countries ? s.countries.name : 'Global'} Scholarship</span>
        <h3>${s.title}</h3>
        <p style="font-size:13px; color:#64748B; margin-top:8px;"><strong>Coverage:</strong> ${s.coverage || 'Fully Funded / Partial'}</p>
        <p style="font-size:13px; color:#64748B; margin-top:4px;"><strong>Deadline:</strong> ${s.application_deadline ? s.application_deadline : 'Annual'}</p>
      </div>
      ${s.official_url ? `<a href="${s.official_url}" target="_blank" rel="noopener" class="btn-link">Scholarship Details &rarr;</a>` : ''}
    </div>
  `).join('');
}

// Render Consultancy Services Grid
function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const services = [
    { icon: '📋', title: 'Document Assessment', desc: 'Comprehensive evaluation of your academic qualifications and transcripts.' },
    { icon: '🎓', title: 'University & Program Matching', desc: 'Discover courses tailored to your academic profile and career goals.' },
    { icon: '🏛️', title: 'Admission Assistance', desc: 'Professional guidance for preparing and submitting official applications.' },
    { icon: '✈️', title: 'Student Visa Guidance', desc: 'Expert support with visa documentation, interviews, and embassy requirements.' }
  ];

  container.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-icon">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// Setup Event Listeners for Filters
function setupEventListeners() {
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const filterKeyword = document.getElementById('filter-keyword');
  const filterCountry = document.getElementById('filter-country');
  const filterDegree = document.getElementById('filter-degree');
  const sortBy = document.getElementById('sort-by');
  const resetBtn = document.getElementById('reset-filters-btn');

  const uniCountry = document.getElementById('uni-country-select');
  const uniInput = document.getElementById('uni-search-input');
  const schCountry = document.getElementById('scholarship-country-select');
  const schInput = document.getElementById('scholarship-search-input');

  if (heroSearchBtn) heroSearchBtn.addEventListener('click', handleHeroSearch);

  if (filterKeyword) filterKeyword.addEventListener('input', applyProgramFilters);
  if (filterCountry) filterCountry.addEventListener('change', applyProgramFilters);
  if (filterDegree) filterDegree.addEventListener('change', applyProgramFilters);
  if (sortBy) sortBy.addEventListener('change', applyProgramFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (filterKeyword) filterKeyword.value = '';
      if (filterCountry) filterCountry.value = '';
      if (filterDegree) filterDegree.value = '';
      if (sortBy) sortBy.value = 'name-asc';
      renderPrograms(globalData.programs);
    });
  }

  if (uniCountry) uniCountry.addEventListener('change', filterUniversities);
  if (uniInput) uniInput.addEventListener('input', filterUniversities);

  if (schCountry) schCountry.addEventListener('change', filterScholarships);
  if (schInput) schInput.addEventListener('input', filterScholarships);
}

// Hero Search Handler
function handleHeroSearch() {
  const keyword = document.getElementById('hero-keyword-input').value.trim();
  const country = document.getElementById('hero-destination-select').value;
  const degree = document.getElementById('hero-degree-select').value;

  document.getElementById('filter-keyword').value = keyword;
  document.getElementById('filter-country').value = country;
  document.getElementById('filter-degree').value = degree;

  applyProgramFilters();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

// Quick Discipline Tag Click
function quickTagSearch(tag) {
  document.getElementById('filter-keyword').value = tag;
  applyProgramFilters();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

// Country Card Click
function filterByCountry(countryName) {
  document.getElementById('filter-country').value = countryName;
  applyProgramFilters();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

// Filter Programs Logic
function applyProgramFilters() {
  const keyword = document.getElementById('filter-keyword').value.toLowerCase();
  const country = document.getElementById('filter-country').value;
  const degree = document.getElementById('filter-degree').value;
  const sort = document.getElementById('sort-by').value;

  let filtered = globalData.programs.filter(p => {
    const pName = p.name ? p.name.toLowerCase() : '';
    const uName = p.universities ? p.universities.name.toLowerCase() : '';
    const cName = p.universities && p.universities.countries ? p.universities.countries.name : '';
    const pDegree = p.degree_level || '';

    const matchesKeyword = !keyword || pName.includes(keyword) || uName.includes(keyword);
    const matchesCountry = !country || cName === country;
    const matchesDegree = !degree || pDegree.toLowerCase() === degree.toLowerCase();

    return matchesKeyword && matchesCountry && matchesDegree;
  });

  // Sorting
  if (sort === 'fee-asc') {
    filtered.sort((a, b) => (parseFee(a.tuition_fee) - parseFee(b.tuition_fee)));
  } else if (sort === 'fee-desc') {
    filtered.sort((a, b) => (parseFee(b.tuition_fee) - parseFee(a.tuition_fee)));
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderPrograms(filtered);
}

// Helper to parse Fee for sorting
function parseFee(feeStr) {
  if (!feeStr) return 0;
  const num = feeStr.replace(/[^0-9]/g, '');
  return num ? parseInt(num, 10) : 0;
}

// Filter Universities Logic
function filterUniversities() {
  const country = document.getElementById('uni-country-select').value;
  const search = document.getElementById('uni-search-input').value.toLowerCase();

  let filtered = globalData.universities.filter(u => {
    const cName = u.countries ? u.countries.name : '';
    const uName = u.name.toLowerCase();
    return (!country || cName === country) && (!search || uName.includes(search));
  });

  renderUniversities(filtered);
}

// Filter Scholarships Logic
function filterScholarships() {
  const country = document.getElementById('scholarship-country-select').value;
  const search = document.getElementById('scholarship-search-input').value.toLowerCase();

  let filtered = globalData.scholarships.filter(s => {
    const cName = s.countries ? s.countries.name : '';
    const sTitle = s.title.toLowerCase();
    return (!country || cName === country) && (!search || sTitle.includes(search));
  });

  renderScholarships(filtered);
}

// Program Inquire via WhatsApp Button Handler
function inquireProgram(programName, uniName) {
  const phone = '8801811909779';
  const text = encodeURIComponent(`Hello EduVexa! I am interested in applying for the program "${programName}" at "${uniName}". Please guide me with the admission process.`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// Direct Application Form Handler
function handleInquirySubmit(event) {
  event.preventDefault();

  const name = document.getElementById('student-name').value.trim();
  const phone = document.getElementById('student-whatsapp').value.trim();
  const email = document.getElementById('student-email').value.trim();
  const country = document.getElementById('student-country').value;
  const qualification = document.getElementById('student-qualification').value;
  const message = document.getElementById('student-message').value.trim();

  const waPhone = '8801811909779';
  const waText = encodeURIComponent(
    `🎓 *New Study Abroad Inquiry - EduVexa Portal*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📱 *WhatsApp:* ${phone}\n` +
    `📧 *Email:* ${email || 'N/A'}\n` +
    `🌍 *Preferred Country:* ${country}\n` +
    `🎓 *Qualification:* ${qualification}\n` +
    `📝 *Message:* ${message || 'I would like to get counseling for study abroad.'}`
  );

  window.open(`https://wa.me/${waPhone}?text=${waText}`, '_blank');
}

// String Helper
function escapeJs(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
