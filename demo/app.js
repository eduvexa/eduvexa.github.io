/* ==========================================================================
   EduVexa - INTI Portal App JS (V12.0)
   Dynamic Supabase Integration & WhatsApp Counseling
   ========================================================================== */

const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let globalData = {
  countries: [],
  universities: [],
  programs: [],
  scholarships: []
};

document.addEventListener('DOMContentLoaded', async () => {
  renderServices();
  await fetchPortalData();
  setupEventListeners();
});

async function fetchPortalData() {
  if (!supabase) return;

  try {
    const [cRes, uRes, pRes, sRes] = await Promise.all([
      supabase.from('countries').select('*').order('name'),
      supabase.from('universities').select('*').order('name'),
      supabase.from('programs').select('*').order('name'),
      supabase.from('scholarships').select('*').order('title')
    ]);

    globalData.countries = cRes.data || [];
    globalData.universities = uRes.data || [];
    globalData.programs = pRes.data || [];
    globalData.scholarships = sRes.data || [];

    populateDropdowns();
    renderDestinations(globalData.countries);
    renderPrograms(globalData.programs);
    renderUniversities(globalData.universities);
    renderScholarships(globalData.scholarships);

  } catch (err) {
    console.error('Error loading Supabase data:', err);
  }
}

function populateDropdowns() {
  const opts = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  
  const finderSelect = document.getElementById('finder-country');
  const filterSelect = document.getElementById('filter-country');
  const uniSelect = document.getElementById('uni-country-select');
  const studentSelect = document.getElementById('student-country');

  if (finderSelect) finderSelect.innerHTML = '<option value="">🌍 All Destinations</option>' + opts;
  if (filterSelect) filterSelect.innerHTML = '<option value="">All Destinations</option>' + opts;
  if (uniSelect) uniSelect.innerHTML = '<option value="">Select Country</option>' + opts;
  if (studentSelect) studentSelect.innerHTML = '<option value="">Select Country</option>' + opts;
}

function renderDestinations(countries) {
  const container = document.getElementById('destinations-grid');
  if (!container) return;

  if (!countries || countries.length === 0) {
    container.innerHTML = '<p>Loading destinations...</p>';
    return;
  }

  container.innerHTML = countries.map(c => `
    <div class="destination-card" onclick="quickCountrySearch('${c.name}')">
      <img src="https://flagcdn.com/w80/${c.code ? c.code.toLowerCase() : 'un'}.png" alt="${c.name} Flag" onerror="this.src='https://flagcdn.com/w80/un.png'">
      <div class="destination-info">
        <h3>${c.name}</h3>
        <span>View Programmes &rarr;</span>
      </div>
    </div>
  `).join('');
}

function renderPrograms(programs) {
  const container = document.getElementById('program-cards-container');
  const countSpan = document.getElementById('results-count');
  if (!container) return;

  if (countSpan) {
    countSpan.textContent = `Found ${programs.length} degree programmes for you`;
  }

  if (!programs || programs.length === 0) {
    container.innerHTML = '<p style="padding:30px; background:#FFF; border-radius:8px;">No programmes found matching your search criteria.</p>';
    return;
  }

  container.innerHTML = programs.map(p => {
    const uni = globalData.universities.find(u => u.id === p.university_id) || { name: 'Partner University' };
    const country = globalData.countries.find(c => c.id === uni.country_id) || { name: '' };

    return `
      <div class="program-card">
        <div class="program-card-header">
          <div>
            <h3 class="program-title">${p.name}</h3>
            <div class="program-meta">
              🏛️ ${uni.name} ${country.name ? '• ' + country.name : ''}
            </div>
          </div>
          <span class="badge-degree">${p.degree_level || 'Degree'}</span>
        </div>
        
        <div class="program-details-grid">
          <div class="detail-box"><span>DURATION</span><strong>${p.duration || 'N/A'}</strong></div>
          <div class="detail-box"><span>TUITION FEE</span><strong>${p.tuition_fee || 'Contact for fee'}</strong></div>
          <div class="detail-box"><span>REQUIREMENTS</span><strong>${p.admission_requirements || 'Standard Entry'}</strong></div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          ${p.official_url ? `<a href="${p.official_url}" target="_blank" style="color:var(--inti-navy); font-weight:700; font-size:13px;">Official Link ↗</a>` : '<span></span>'}
          <button class="btn-whatsapp-inquire" onclick="inquireProgram('${escapeJs(p.name)}', '${escapeJs(uni.name)}')">Inquire via WhatsApp</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderUniversities(unis) {
  const container = document.getElementById('universities-grid');
  if (!container) return;

  container.innerHTML = unis.map(u => {
    const country = globalData.countries.find(c => c.id === u.country_id) || { name: 'International' };
    return `
      <div class="uni-card">
        <h3>${u.name}</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin: 8px 0;">📍 ${country.name}</p>
        ${u.website ? `<a href="${u.website}" target="_blank" style="color: var(--inti-navy); font-weight: 700; font-size: 13px;">Official Website &rarr;</a>` : ''}
      </div>
    `;
  }).join('');
}

function renderScholarships(scholarships) {
  const container = document.getElementById('scholarships-grid');
  if (!container) return;

  container.innerHTML = scholarships.map(s => {
    const country = globalData.countries.find(c => c.id === s.country_id) || { name: 'Global' };
    return `
      <div class="scholarship-card">
        <span class="badge-scholarship">${country.name} Scholarship</span>
        <h3 style="margin-top: 8px;">${s.title}</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin: 10px 0;"><strong>Coverage:</strong> ${s.coverage || 'Fully Funded / Partial'}</p>
        ${s.official_url ? `<a href="${s.official_url}" target="_blank" style="color: var(--inti-navy); font-weight: 700; font-size: 13px;">Scholarship Details &rarr;</a>` : ''}
      </div>
    `;
  }).join('');
}

function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const services = [
    { icon: '📋', title: 'Document Assessment', desc: 'Comprehensive evaluation of your academic qualifications.' },
    { icon: '🎓', title: 'University Matching', desc: 'Discover courses tailored to your academic profile and career goals.' },
    { icon: '🏛️', title: 'Admission Support', desc: 'Professional guidance for preparing official applications.' },
    { icon: '✈️', title: 'Student Visa Guidance', desc: 'Expert support with visa documentation and embassy interviews.' }
  ];

  container.innerHTML = services.map(s => `
    <div class="service-card" style="text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">${s.icon}</div>
      <h3>${s.title}</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">${s.desc}</p>
    </div>
  `).join('');
}

function setupEventListeners() {
  const finderBtn = document.getElementById('finder-search-btn');
  const filterKw = document.getElementById('filter-keyword');
  const filterCt = document.getElementById('filter-country');
  const filterDg = document.getElementById('filter-degree');
  const resetBtn = document.getElementById('reset-filters-btn');

  if (finderBtn) {
    finderBtn.addEventListener('click', () => {
      const kw = document.getElementById('finder-keyword').value.trim();
      const ct = document.getElementById('finder-country').value;
      const dg = document.getElementById('finder-degree').value;

      document.getElementById('filter-keyword').value = kw;
      document.getElementById('filter-country').value = ct;
      document.getElementById('filter-degree').value = dg;

      applyProgramFilters();
      document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (filterKw) filterKw.addEventListener('input', applyProgramFilters);
  if (filterCt) filterCt.addEventListener('change', applyProgramFilters);
  if (filterDg) filterDg.addEventListener('change', applyProgramFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-keyword').value = '';
      document.getElementById('filter-country').value = '';
      document.getElementById('filter-degree').value = '';
      renderPrograms(globalData.programs);
    });
  }
}

function quickCountrySearch(countryName) {
  document.getElementById('filter-country').value = countryName;
  applyProgramFilters();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function quickTagSearch(tag) {
  document.getElementById('filter-keyword').value = tag;
  applyProgramFilters();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function applyProgramFilters() {
  const kw = document.getElementById('filter-keyword').value.toLowerCase();
  const ct = document.getElementById('filter-country').value;
  const dg = document.getElementById('filter-degree').value;

  const filtered = globalData.programs.filter(p => {
    const uni = globalData.universities.find(u => u.id === p.university_id) || { name: '' };
    const country = globalData.countries.find(c => c.id === uni.country_id) || { name: '' };

    const matchesKw = !kw || p.name.toLowerCase().includes(kw) || uni.name.toLowerCase().includes(kw);
    const matchesCt = !ct || country.name === ct;
    const matchesDg = !dg || (p.degree_level && p.degree_level.toLowerCase().includes(dg.toLowerCase()));

    return matchesKw && matchesCt && matchesDg;
  });

  renderPrograms(filtered);
}

function inquireProgram(programName, uniName) {
  const phone = '8801811909779';
  const text = encodeURIComponent(`Hello EduVexa! I am interested in applying for the programme "${programName}" at "${uniName}". Please guide me with the admission process.`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

function handleInquirySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('student-name').value.trim();
  const phone = document.getElementById('student-whatsapp').value.trim();
  const email = document.getElementById('student-email').value.trim();
  const country = document.getElementById('student-country').value;
  const qual = document.getElementById('student-qualification').value;
  const msg = document.getElementById('student-message').value.trim();

  const waPhone = '8801811909779';
  const text = encodeURIComponent(
    `🎓 *New Counseling Request - EduVexa Portal*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📱 *WhatsApp:* ${phone}\n` +
    `📧 *Email:* ${email || 'N/A'}\n` +
    `🌍 *Country:* ${country}\n` +
    `🎓 *Qualification:* ${qual}\n` +
    `📝 *Message:* ${msg || 'I want counseling for studying abroad.'}`
  );

  window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
}

function escapeJs(str) {
  return str ? str.replace(/'/g, "\\'").replace(/"/g, '&quot;') : '';
}
