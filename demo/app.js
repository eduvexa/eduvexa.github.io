const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let globalData = { countries: [], unis: [], programs: [] };

document.addEventListener('DOMContentLoaded', async () => {
    console.log("EduVexa INTI Portal Loading...");
    await fetchAllData();
    setupFilters();
});

async function fetchAllData() {
    // Parallel fetching for performance
    const [cRes, uRes, pRes] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('universities').select('*'),
        supabase.from('programs').select('*')
    ]);

    globalData.countries = cRes.data || [];
    globalData.unis = uRes.data || [];
    globalData.programs = pRes.data || [];

    renderUI();
}

function renderUI() {
    renderDestinations();
    renderPrograms(globalData.programs);
    populateDropdowns();
}

function populateDropdowns() {
    const opts = globalData.countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    const select = document.getElementById('find-country');
    if(select) select.innerHTML += opts;
}

function renderDestinations() {
    const grid = document.getElementById('country-grid');
    if (!grid) return;
    
    grid.innerHTML = globalData.countries.map(c => `
        <div class="country-card" onclick="filterByCountry('${c.name}')">
            <div class="flag-box">
                <img src="https://flagcdn.com/w160/${c.code.toLowerCase()}.png" alt="${c.name}" onerror="this.src='https://flagcdn.com/w160/un.png'">
            </div>
            <h4>${c.name}</h4>
        </div>
    `).join('');
}

function renderPrograms(list) {
    const grid = document.getElementById('program-list');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = "<p style='padding:50px; text-align:center; font-weight:bold;'>No programmes found.</p>";
        return;
    }

    grid.innerHTML = list.map(p => {
        const uni = globalData.unis.find(u => u.id === p.university_id) || { name: 'Partner University' };
        const country = globalData.countries.find(c => c.id === uni.country_id) || { name: '' };

        return `
            <div class="program-card">
                <div class="program-top">
                    <span>${p.degree_level || 'Degree'}</span>
                    <span>INTAKE OPEN</span>
                </div>
                <div class="program-body">
                    <h3>${p.name}</h3>
                    <span class="program-uni">🏛️ ${uni.name} • ${country.name}</span>
                    <div class="program-info">
                        <div class="info-box"><span>Duration</span><strong>${p.duration}</strong></div>
                        <div class="info-box"><span>Tuition Fee</span><strong>${p.tuition_fee}</strong></div>
                    </div>
                    <a href="https://wa.me/8801811909779?text=Interested in ${encodeURIComponent(p.name)} at ${encodeURIComponent(uni.name)}" target="_blank" class="btn-inquire">ENQUIRE NOW</a>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilters() {
    const btn = document.getElementById('find-btn');
    if(!btn) return;

    btn.addEventListener('click', () => {
        const kw = document.getElementById('find-keyword').value.toLowerCase();
        const ct = document.getElementById('find-country').value;
        const dg = document.getElementById('find-degree').value;

        const filtered = globalData.programs.filter(p => {
            const uni = globalData.unis.find(u => u.id === p.university_id) || {};
            const country = globalData.countries.find(c => c.id === uni.country_id) || {};
            
            const matchKw = p.name.toLowerCase().includes(kw) || uni.name.toLowerCase().includes(kw);
            const matchCt = !ct || country.name === ct;
            const matchDg = !dg || p.degree_level === dg;

            return matchKw && matchCt && matchDg;
        });

        renderPrograms(filtered);
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });
}

function filterByCountry(name) {
    const filtered = globalData.programs.filter(p => {
        const uni = globalData.unis.find(u => u.id === p.university_id) || {};
        const country = globalData.countries.find(c => c.id === uni.country_id) || {};
        return country.name === name;
    });
    renderPrograms(filtered);
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}
