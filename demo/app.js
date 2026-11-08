// EduVexa Main App Logic
const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State Management
let allProgrammes = [];
let currentBudgetFilter = 'all';

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    console.log("EduVexa Initializing...");
    await fetchSiteSettings();
    await fetchProgrammes();
    await fetchScholarships();
    await fetchServices();
    loadCountries();
});

// 1. Fetch Dynamic Site Settings (Hotlines, Hero Text, etc.)
async function fetchSiteSettings() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (data) updateSiteSettingsUI(data);
    } catch (err) {
        console.error("Settings Error:", err);
    }
}

function updateSiteSettingsUI(s) {
    // Top Bar
    if(s.whatsapp_bd) {
        const bdLink = document.getElementById('top-wa-bd');
        bdLink.innerText = s.whatsapp_bd;
        bdLink.href = `https://wa.me/${s.whatsapp_bd.replace(/\D/g,'')}`;
        document.getElementById('footer-hotline-bd').innerText = s.whatsapp_bd;
    }
    if(s.whatsapp_eu) {
        const euLink = document.getElementById('top-wa-eu');
        euLink.innerText = s.whatsapp_eu;
        euLink.href = `https://wa.me/${s.whatsapp_eu.replace(/\D/g,'')}`;
        document.getElementById('footer-hotline-eu').innerText = s.whatsapp_eu;
    }
    if(s.contact_email) {
        document.getElementById('top-email').innerText = s.contact_email;
        document.getElementById('footer-email').innerText = s.contact_email;
    }

    // Hero Section Content
    if(s.hero_title) document.getElementById('hero-title').innerText = s.hero_title;
    if(s.hero_description) document.getElementById('hero-desc').innerText = s.hero_description;
    if(s.hero_motto) document.getElementById('hero-motto').innerHTML = `<i class="fas fa-star" style="color: var(--gold);"></i> ${s.hero_motto}`;
    if(s.hero_tagline) document.getElementById('hero-tagline').innerHTML = `<i class="fas fa-graduation-cap"></i> ${s.hero_tagline}`;
    
    // Background Image/Video Logic
    // If Admin set a custom background URL, we use it as the video poster fallback
    if(s.hero_bg_url) {
        const videoElement = document.querySelector('.hero-video-bg');
        if(videoElement) {
            videoElement.poster = s.hero_bg_url;
        }
    }
}

// 2. Fetch & Display Programmes
async function fetchProgrammes() {
    const { data, error } = await supabase
        .from('programmes')
        .select(`*, universities(name, country, logo_url)`);
    
    if (data) {
        allProgrammes = data;
        renderProgrammes(data);
    }
}

function renderProgrammes(progs) {
    const grid = document.getElementById('programmesGrid');
    grid.innerHTML = progs.length ? progs.map(p => `
        <div class="card">
            <div class="card-img" style="background-image: url('${p.image_url || 'https://images.unsplash.com/photo-1523050853063-9158a65721b3?q=80&w=800'}')"></div>
            <div class="card-content">
                <span class="card-tag">${p.universities?.country || 'International'}</span>
                <h3 class="card-title">${p.name}</h3>
                <p class="card-meta"><i class="fas fa-university"></i> ${p.universities?.name || 'Partner University'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #eee; padding-top:15px;">
                    <span style="font-weight:700; color:var(--red);">€${p.tuition_fee.toLocaleString()} / year</span>
                    <a href="#contact" class="btn-cta" style="padding: 5px 12px; font-size:12px;">APPLY</a>
                </div>
            </div>
        </div>
    `).join('') : '<p>No programmes found matching your criteria.</p>';
}

// 3. Search & Filters
function handleSearch() {
    const query = document.getElementById('progSearch').value.toLowerCase();
    const country = document.getElementById('countryFilter').value;
    const degree = document.getElementById('degreeFilter').value;

    let filtered = allProgrammes.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query);
        const matchesCountry = country === "" || p.universities.country === country;
        const matchesDegree = degree === "" || p.degree_level === degree;
        return matchesQuery && matchesCountry && matchesDegree;
    });

    renderProgrammes(filtered);
    document.getElementById('programmes').scrollIntoView({ behavior: 'smooth' });
}

function filterByBudget(budget) {
    currentBudgetFilter = budget;
    
    // Update UI pills
    document.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let filtered = allProgrammes.filter(p => {
        if(budget === 'low') return p.tuition_fee <= 3000;
        if(budget === 'mid') return p.tuition_fee > 3000 && p.tuition_fee <= 6000;
        if(budget === 'high') return p.tuition_fee > 6000;
        return true;
    });

    renderProgrammes(filtered);
}

// 4. Countries/Universities Section
function loadCountries() {
    const countries = [
        { name: 'Germany', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=400', count: '120+ Universities' },
        { name: 'Italy', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400', count: '80+ Universities' },
        { name: 'Hungary', img: 'https://images.unsplash.com/photo-1551867633-194f125bddfa?q=80&w=400', count: '40+ Universities' },
        { name: 'Malaysia', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a5cf?q=80&w=400', count: '60+ Universities' }
    ];

    const grid = document.getElementById('countriesGrid');
    if(grid) {
        grid.innerHTML = countries.map(c => `
            <div class="card" style="text-align:center;">
                <div class="card-img" style="background-image: url('${c.img}')"></div>
                <div class="card-content">
                    <h3 class="card-title">${c.name}</h3>
                    <p class="card-meta">${c.count}</p>
                </div>
            </div>
        `).join('');
    }
}

// 5. Scholarships & Services
async function fetchScholarships() {
    const { data } = await supabase.from('scholarships').select('*');
    if (data) {
        const grid = document.getElementById('scholarshipsGrid');
        grid.innerHTML = data.map(s => `
            <div class="card" style="display:flex; flex-direction:row;">
                <div style="padding:20px;">
                    <i class="fas fa-award" style="font-size:40px; color:var(--gold);"></i>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${s.name}</h3>
                    <p class="card-meta">${s.description.substring(0, 100)}...</p>
                    <span class="card-tag" style="background:var(--red); color:white;">Coverage: ${s.coverage_amount}</span>
                </div>
            </div>
        `).join('');
    }
}

async function fetchServices() {
    const { data } = await supabase.from('services').select('*');
    if (data) {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = data.map(s => `
            <div class="card" style="text-align:center; padding:30px;">
                <i class="${s.icon_class || 'fas fa-check-circle'}" style="font-size:40px; color:var(--navy); margin-bottom:20px;"></i>
                <h3 class="card-title">${s.name}</h3>
                <p class="card-meta">${s.description}</p>
            </div>
        `).join('');
    }
}
