const SUPABASE_URL = 'https://cnxtddpqjzawfwakmlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LaWoUeSZI1uDSh9phxyROQ_Pm-CsgNF';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allProgrammes = [];

document.addEventListener('DOMContentLoaded', async () => {
    await fetchSiteSettings();
    await fetchProgrammes();
    await fetchScholarships();
    await fetchServices();
    loadCountries();
});

async function fetchSiteSettings() {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (data) {
        if(data.whatsapp_bd) document.getElementById('top-wa-bd').innerText = data.whatsapp_bd;
        if(data.whatsapp_eu) document.getElementById('top-wa-eu').innerText = data.whatsapp_eu;
        if(data.contact_email) document.getElementById('top-email').innerText = data.contact_email;
        if(data.hero_title) document.getElementById('hero-title').innerText = data.hero_title;
        if(data.hero_description) document.getElementById('hero-desc').innerText = data.hero_description;
        if(data.hero_bg_url) document.getElementById('hero-section').style.backgroundImage = `linear-gradient(rgba(0, 45, 91, 0.85), rgba(0, 45, 91, 0.7)), url('${data.hero_bg_url}')`;
    }
}

async function fetchProgrammes() {
    const { data } = await supabase.from('programmes').select(`*, universities(name, country)`);
    if (data) {
        allProgrammes = data;
        renderProgrammes(data);
    }
}

function renderProgrammes(progs) {
    const grid = document.getElementById('programmesGrid');
    grid.innerHTML = progs.map(p => `
        <div class="card">
            <div class="card-img" style="background-image: url('${p.image_url || 'https://images.unsplash.com/photo-1523050853063-9158a65721b3?q=80&w=800'}')"></div>
            <div class="card-content">
                <span class="card-tag">${p.universities?.country || 'International'}</span>
                <h3 class="card-title">${p.name}</h3>
                <p><i class="fas fa-university"></i> ${p.universities?.name}</p>
                <div style="margin-top:15px; font-weight:700; color:var(--red);">€${p.tuition_fee} / year</div>
            </div>
        </div>
    `).join('');
}

async function fetchScholarships() {
    const { data } = await supabase.from('scholarships').select('*');
    if (data) {
        document.getElementById('scholarshipsGrid').innerHTML = data.map(s => `
            <div class="card" style="padding:20px; display:flex; gap:20px;">
                <i class="fas fa-award" style="font-size:30px; color:var(--gold);"></i>
                <div>
                    <h3>${s.name}</h3>
                    <p>${s.coverage_amount}</p>
                </div>
            </div>
        `).join('');
    }
}

async function fetchServices() {
    const { data } = await supabase.from('services').select('*');
    if (data) {
        document.getElementById('servicesGrid').innerHTML = data.map(s => `
            <div class="card" style="text-align:center; padding:30px;">
                <i class="${s.icon_class}" style="font-size:40px; color:var(--navy); margin-bottom:15px;"></i>
                <h3>${s.name}</h3>
                <p>${s.description}</p>
            </div>
        `).join('');
    }
}

function loadCountries() {
    const countries = [
        { name: 'Germany', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=400' },
        { name: 'Italy', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400' },
        { name: 'Hungary', img: 'https://images.unsplash.com/photo-1551867633-194f125bddfa?q=80&w=400' },
        { name: 'Malaysia', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a5cf?q=80&w=400' }
    ];
    document.getElementById('countriesGrid').innerHTML = countries.map(c => `
        <div class="card">
            <div class="card-img" style="background-image: url('${c.img}')"></div>
            <div class="card-content" style="text-align:center;"><h3>${c.name}</h3></div>
        </div>
    `).join('');
}
