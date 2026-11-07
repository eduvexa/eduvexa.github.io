const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global state to store data
let store = {
    countries: [],
    universities: [],
    programs: [],
    scholarships: []
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("EduVexa Portal Initializing...");
    await loadAllData();
    setupSearch();
});

async function loadAllData() {
    try {
        // Fetch everything in parallel for speed
        const [resC, resU, resP, resS] = await Promise.all([
            supabase.from('countries').select('*').order('name'),
            supabase.from('universities').select('*').order('name'),
            supabase.from('programs').select('*').order('name'),
            supabase.from('scholarships').select('*').order('title')
        ]);

        store.countries = resC.data || [];
        store.universities = resU.data || [];
        store.programs = resP.data || [];
        store.scholarships = resS.data || [];

        console.log("Data Loaded:", {
            countries: store.countries.length,
            unis: store.universities.length,
            programs: store.programs.length
        });

        renderAll();
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

function renderAll() {
    renderDestinations();
    renderCourses(store.programs); // Initial load shows all programs
    populateDropdowns();
}

function populateDropdowns() {
    const selectHero = document.getElementById('course-country');
    const selectForm = document.getElementById('s-country');
    
    const options = store.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    if (selectHero) selectHero.innerHTML = `<option value="">Any Destination</option>` + options;
    if (selectForm) selectForm.innerHTML = `<option value="">Select a country</option>` + options;
}

function renderDestinations() {
    const grid = document.getElementById('country-grid');
    if (!grid) return;

    if (store.countries.length === 0) {
        grid.innerHTML = "<p>No countries found in database.</p>";
        return;
    }

    grid.innerHTML = store.countries.map(c => `
        <div class="country-card" onclick="filterByCountry('${c.name}')">
            <div class="flag-wrapper">
                <img src="https://flagcdn.com/w160/${c.code ? c.code.toLowerCase() : 'un'}.png" alt="${c.name}">
            </div>
            <h4>${c.name}</h4>
        </div>
    `).join('');
}

function renderCourses(list) {
    const grid = document.getElementById('course-list');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = "<div style='grid-column: 1/-1; padding: 50px; text-align: center; background: #eee;'><h3>No courses found.</h3><p>Try searching for something else.</p></div>";
        return;
    }

    grid.innerHTML = list.map(p => {
        // Link university and country manually
        const uni = store.universities.find(u => u.id === p.university_id) || { name: 'Partner University' };
        const country = store.countries.find(c => c.id === uni.country_id) || { name: 'International' };

        return `
            <div class="course-card">
                <span class="degree">${p.degree_level || 'Degree'}</span>
                <h3>${p.name}</h3>
                <span class="uni-name">🏛️ ${uni.name} • ${country.name}</span>
                <div class="meta">
                    <div class="meta-item"><span>Duration</span><strong>${p.duration || 'N/A'}</strong></div>
                    <div class="meta-item"><span>Tuition</span><strong>${p.tuition_fee || 'Contact Us'}</strong></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <a href="${p.official_url || '#'}" target="_blank" style="font-size:12px; color:#666; font-weight:700;">Official Site ↗</a>
                    <a href="https://wa.me/8801811909779?text=Inquiry about ${encodeURIComponent(p.name)} at ${encodeURIComponent(uni.name)}" target="_blank" class="btn-details">Enquire Now</a>
                </div>
            </div>
        `;
    }).join('');
}

function setupSearch() {
    const btn = document.getElementById('search-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const kw = document.getElementById('course-keyword').value.toLowerCase();
        const ct = document.getElementById('course-country').value;

        const filtered = store.programs.filter(p => {
            const uni = store.universities.find(u => u.id === p.university_id) || { name: '' };
            const country = store.countries.find(c => c.id === uni.country_id) || { name: '' };
            
            const matchKw = p.name.toLowerCase().includes(kw) || uni.name.toLowerCase().includes(kw);
            const matchCt = !ct || country.name === ct;
            
            return matchKw && matchCt;
        });

        renderCourses(filtered);
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });

    // Also filter on Degree dropdown change
    const degreeFilter = document.getElementById('filter-degree');
    if(degreeFilter) {
        degreeFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            const filtered = val ? store.programs.filter(p => p.degree_level === val) : store.programs;
            renderCourses(filtered);
        });
    }
}

function filterByCountry(countryName) {
    const filtered = store.programs.filter(p => {
        const uni = store.universities.find(u => u.id === p.university_id) || {};
        const country = store.countries.find(c => c.id === uni.country_id) || {};
        return country.name === countryName;
    });
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
