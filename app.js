// --- CONFIGURAÇÃO DA API DO GOOGLE APPS SCRIPT ---
// Substitua o link abaixo pela "URL do app da Web" que você copiou no Passo 2
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwf1RDggPtYo-HPAr8xN60lWjZn45y1paO2xUmug29qBayyib9tpEoPw0XwrYRzPIkamg/exec";

// --- CONFIGURAÇÕES DE DATAS PARA OS CONTADORES ---
const WORLD_CUP_DATE = new Date("June 11, 2026 00:00:00").getTime();
const CAMPAIGN_END_DATE = new Date("August 01, 2026 23:59:59").getTime(); 

const TOTAL_STICKERS = 994; 
const ITEMS_PER_PAGE = 48;

let stickersList = [];
let stickersState = {};
let stickersRepeatedState = {};
let currentFilter = 'all';
let currentPage = 1;
let isAdmin = false;

const SECTIONS_DATA = [
    { id: "FWC", name: "História da Copa", count: 20, prefix: "FWC", group: "especial" },
    { id: "MEX", name: "México", count: 20, prefix: "MEX", group: "A" },
    { id: "RSA", name: "África do Sul", count: 20, prefix: "RSA", group: "A" },
    { id: "KOR", name: "Coreia do Sul", count: 20, prefix: "KOR", group: "A" },
    { id: "CZE", name: "Rep. Tcheca", count: 20, prefix: "CZE", group: "A" },
    { id: "CAN", name: "Canadá", count: 20, prefix: "CAN", group: "B" },
    { id: "BIH", name: "Bósnia", count: 20, prefix: "BIH", group: "B" },
    { id: "QAT", name: "Catar", count: 20, prefix: "QAT", group: "B" },
    { id: "SUI", name: "Suíça", count: 20, prefix: "SUI", group: "B" },
    { id: "BRA", name: "Brasil", count: 20, prefix: "BRA", group: "C" },
    { id: "MAR", name: "Marrocos", count: 20, prefix: "MAR", group: "C" },
    { id: "HAI", name: "Haiti", count: 20, prefix: "HAI", group: "C" },
    { id: "SCO", name: "Escócia", count: 20, prefix: "SCO", group: "C" },
    { id: "USA", name: "Estados Unidos", count: 20, prefix: "USA", group: "D" },
    { id: "PAR", name: "Paraguai", count: 20, prefix: "PAR", group: "D" },
    { id: "AUS", name: "Austrália", count: 20, prefix: "AUS", group: "D" },
    { id: "TUR", name: "Turquia", count: 20, prefix: "TUR", group: "D" },
    { id: "GER", name: "Alemanha", count: 20, prefix: "GER", group: "E" },
    { id: "CUW", name: "Curaçao", count: 20, prefix: "CUW", group: "E" },
    { id: "CIV", name: "Costa do Marfim", count: 20, prefix: "CIV", group: "E" },
    { id: "ECU", name: "Equador", count: 20, prefix: "ECU", group: "E" },
    { id: "NED", name: "Holanda", count: 20, prefix: "NED", group: "F" },
    { id: "JPN", name: "Japão", count: 20, prefix: "JPN", group: "F" },
    { id: "SWE", name: "Suécia", count: 20, prefix: "SWE", group: "F" },
    { id: "TUN", name: "Tunísia", count: 20, prefix: "TUN", group: "F" },
    { id: "BEL", name: "Bélgica", count: 20, prefix: "BEL", group: "G" },
    { id: "EGY", name: "Egito", count: 20, prefix: "EGY", group: "G" },
    { id: "IRN", name: "Irã", count: 20, prefix: "IRN", group: "G" },
    { id: "NZL", name: "Nova Zelândia", count: 20, prefix: "NZL", group: "G" },
    { id: "ESP", name: "Espanha", count: 20, prefix: "ESP", group: "H" },
    { id: "CPV", name: "Cabo Verde", count: 20, prefix: "CPV", group: "H" },
    { id: "KSA", name: "Arábia Saudita", count: 20, prefix: "KSA", group: "H" },
    { id: "URU", name: "Uruguai", count: 20, prefix: "URU", group: "H" },
    { id: "FRA", name: "França", count: 20, prefix: "FRA", group: "I" },
    { id: "SEN", name: "Senegal", count: 20, prefix: "SEN", group: "I" },
    { id: "IRQ", name: "Iraque", count: 20, prefix: "IRQ", group: "I" },
    { id: "NOR", name: "Noruega", count: 20, prefix: "NOR", group: "I" },
    { id: "ARG", name: "Argentina", count: 20, prefix: "ARG", group: "J" },
    { id: "ALG", name: "Argélia", count: 20, prefix: "ALG", group: "J" },
    { id: "AUT", name: "Áustria", count: 20, prefix: "AUT", group: "J" },
    { id: "JOR", name: "Jordânia", count: 20, prefix: "JOR", group: "J" },
    { id: "POR", name: "Portugal", count: 20, prefix: "POR", group: "K" },
    { id: "COD", name: "Congo", count: 20, prefix: "COD", group: "K" },
    { id: "UZB", name: "Uzbequistão", count: 20, prefix: "UZB", group: "K" },
    { id: "COL", name: "Colômbia", count: 20, prefix: "COL", group: "K" },
    { id: "ENG", name: "Inglaterra", count: 20, prefix: "ENG", group: "L" },
    { id: "CRO", name: "Croácia", count: 20, prefix: "CRO", group: "L" },
    { id: "GHA", name: "Gana", count: 20, prefix: "GHA", group: "L" },
    { id: "PAN", name: "Panamá", count: 20, prefix: "PAN", group: "L" },
    { id: "CC", name: "Coca-Cola", count: 14, prefix: "CC", group: "especial" }
];

function generateStickersDatabase() {
    stickersList = [];
    let absoluteId = 1;

    SECTIONS_DATA.forEach(sec => {
        for (let j = 1; j <= sec.count; j++) {
            let code = "";
            let name = "";
            let isSpecial = false;
            let bgGradient = "from-slate-900 to-slate-950";

            if (sec.id === "FWC") {
                if (j === 1) {
                    code = "00";
                    name = "História da Copa - Emblema";
                    isSpecial = true;
                } else {
                    code = `FWC${j - 1}`;
                    name = `História da Copa #${j - 1}`;
                }
                bgGradient = "from-red-950/40 to-slate-950";
            } else if (sec.id === "CC") {
                code = `CC${j}`;
                name = `Coca-Cola Especial #${j}`;
                isSpecial = true;
                bgGradient = "from-red-900 to-slate-950";
            } else {
                code = `${sec.prefix}${j}`;
                if (j === 1) {
                    name = `Escudo Oficial - ${sec.name}`;
                    isSpecial = true;
                } else {
                    name = `${sec.name} - Jogador nº ${j}`;
                }

                if (sec.id === "BRA") bgGradient = "from-yellow-950/40 to-slate-950";
                else if (sec.id === "ARG") bgGradient = "from-sky-950/40 to-slate-950";
                else if (["MEX", "USA", "CAN"].includes(sec.id)) bgGradient = "from-red-950/30 to-slate-950";
            }

            stickersList.push({
                id: absoluteId,
                code: code,
                name: name,
                category: sec.id,
                group: sec.group,
                bg: bgGradient,
                special: isSpecial
            });
            absoluteId++;
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    generateStickersDatabase();
    initCountdowns(); 
    checkLoginState();
    await loadDatabaseFromSheets();
});

// --- LEITURA REAL-TIME DO GOOGLE SHEETS ---
async function loadDatabaseFromSheets() {
    stickersState = {};
    stickersRepeatedState = {};
    
    stickersList.forEach(s => {
        stickersState[s.id] = false;
        stickersRepeatedState[s.id] = 0;
    });

    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("SUA_URL_DO_APPS_SCRIPT_AQUI")) {
        console.warn("Aviso: URL do Apps Script não configurada.");
        updateDashboard();
        renderAlbum();
        return;
    }

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        const data = await response.json();
        
        data.forEach(item => {
            const matched = stickersList.find(s => s.code.toUpperCase() === item.code.toUpperCase());
            if (matched) {
                stickersState[matched.id] = item.owned;
                stickersRepeatedState[matched.id] = item.repeated;
            }
        });
    } catch (error) {
        console.error("Erro ao carregar dados do Google Sheets:", error);
    }

    updateDashboard();
    renderAlbum();
}

// --- ENVIO DINÂMICO DE ATUALIZAÇÕES PARA A PLANILHA ---
async function syncStickerToSheets(stickerId) {
    if (!isAdmin) return;
    
    const sticker = stickersList.find(s => s.id === stickerId);
    if (!sticker) return;

    const payload = {
        code: sticker.code,
        owned: stickersState[stickerId],
        repeated: stickersRepeatedState[stickerId] || 0
    };

    try {
        // Envia de forma assíncrona em background para não travar a tela
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Necessário para evitar bloqueios de CORS do Google Apps Script
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Erro ao sincronizar modificação com o Sheets:", error);
    }
}

// --- LÓGICA DOS CONTADORES ---
function initCountdowns() {
    updateCountdowns(); 
    setInterval(updateCountdowns, 1000); 
}

function updateCountdowns() {
    const now = new Date().getTime();
    const wcDistance = WORLD_CUP_DATE - now;
    renderTimer('wc', wcDistance);

    const campDistance = CAMPAIGN_END_DATE - now;
    renderTimer('camp', campDistance);
}

function renderTimer(prefix, distance) {
    if (distance < 0) {
        document.getElementById(`${prefix}-days`).innerText = "00";
        document.getElementById(`${prefix}-hours`).innerText = "00";
        document.getElementById(`${prefix}-mins`).innerText = "00";
        document.getElementById(`${prefix}-secs`).innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(`${prefix}-days`).innerText = String(days).padStart(2, '0');
    document.getElementById(`${prefix}-hours`).innerText = String(hours).padStart(2, '0');
    document.getElementById(`${prefix}-mins`).innerText = String(minutes).padStart(2, '0');
    document.getElementById(`${prefix}-secs`).innerText = String(seconds).padStart(2, '0');
}

function updateDashboard() {
    const total = TOTAL_STICKERS;
    const owned = Object.values(stickersState).filter(v => v === true).length;
    const repeated = Object.values(stickersRepeatedState).reduce((acc, curr) => acc + (curr || 0), 0);
    const pct = Math.round((owned / total) * 100);

    if(document.getElementById('stats-owned')) document.getElementById('stats-owned').innerText = owned;
    if(document.getElementById('stats-repeated')) document.getElementById('stats-repeated').innerText = repeated;
    if(document.getElementById('progress-percentage')) document.getElementById('progress-percentage').innerText = `${pct}%`;
    if(document.getElementById('progress-bar')) document.getElementById('progress-bar').style.width = `${pct}%`;
}

function handleSearch() {
    currentPage = 1;
    renderAlbum();
}

function changeGroup() {
    document.getElementById('category-select').value = 'all';
    currentPage = 1;
    renderAlbum();
}

function changeCategory() {
    const categoryFilter = document.getElementById('category-select').value;
    if (categoryFilter !== 'all') {
        const section = SECTIONS_DATA.find(s => s.id === categoryFilter);
        if (section) {
            document.getElementById('group-select').value = section.group;
        }
    } else {
        document.getElementById('group-select').value = 'all';
    }
    currentPage = 1;
    renderAlbum();
}

function renderAlbum() {
    const grid = document.getElementById('album-grid');
    const groupFilter = document.getElementById('group-select').value;
    const categoryFilter = document.getElementById('category-select').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
    grid.innerHTML = '';

    const filteredList = stickersList.filter(sticker => {
        const isOwned = stickersState[sticker.id];
        const repCount = stickersRepeatedState[sticker.id] || 0;

        if (groupFilter !== 'all' && sticker.group !== groupFilter) return false;
        if (categoryFilter !== 'all' && sticker.category !== categoryFilter) return false;
        if (currentFilter === 'owned' && !isOwned) return false;
        if (currentFilter === 'missing' && isOwned) return false;
        if (currentFilter === 'repeated' && (!isOwned || repCount === 0)) return false;

        if (searchQuery) {
            const matchesName = sticker.name.toLowerCase().includes(searchQuery);
            const matchesCode = sticker.code.toLowerCase().includes(searchQuery);
            if (!matchesName && !matchesCode) return false;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    document.getElementById('total-pages-num').innerText = totalPages;
    document.getElementById('current-page-num').innerText = currentPage;

    document.getElementById('btn-first').disabled = currentPage === 1;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
    document.getElementById('btn-last').disabled = currentPage === totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredList.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    if (pageItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-medium text-xs">Nenhuma figurinha encontrada para os filtros ou busca aplicados.</div>`;
        return;
    }

    pageItems.forEach(sticker => {
        const isOwned = stickersState[sticker.id];
        const repCount = stickersRepeatedState[sticker.id] || 0;
        const card = document.createElement('div');

        card.className = `sticker-card relative rounded-lg p-2 flex flex-col justify-between aspect-[3/4] text-center select-none bg-gradient-to-br ${sticker.bg} ${isOwned ? 'sticker-owned' : 'sticker-missing'} ${sticker.special ? 'sticker-special' : ''} ${isAdmin ? 'cursor-pointer scale-100 hover:scale-105 border border-dashed border-red-500/40 z-10' : ''}`;

        if (isAdmin) {
            card.onclick = () => toggleSticker(sticker.id);
        }

        let repeatedHTML = '';
        if (isOwned) {
            if (isAdmin) {
                repeatedHTML = `
                    <div class="text-[8px] font-bold text-[#ff1e56] mt-1">✓ OBTIDO</div>
                    <div onclick="event.stopPropagation();" class="flex items-center justify-between bg-black/50 border border-slate-800 rounded p-0.5 mt-0.5 text-[10px]">
                        <button onclick="changeRepeated(${sticker.id}, -1)" class="px-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded cursor-pointer transition text-[9px]">-</button>
                        <span class="font-bold text-amber-400 font-mono">${repCount} rep</span>
                        <button onclick="changeRepeated(${sticker.id}, 1)" class="px-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded cursor-pointer transition text-[9px]">+</button>
                    </div>
                `;
            } else if (repCount > 0) {
                repeatedHTML = `
                    <div class="text-[8px] font-bold text-[#ff1e56] mt-1">✓ OBTIDO</div>
                    <div class="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold rounded py-0.5 mt-0.5 text-[9px] font-mono tracking-wide">
                        +${repCount} REPETIDA
                    </div>
                `;
            } else {
                repeatedHTML = `<div class="text-[8px] font-bold text-[#ff1e56] py-0.5 mt-1">✓ OBTIDO</div>`;
            }
        } else {
            repeatedHTML = `<div class="text-[8px] font-bold text-slate-600 py-0.5 mt-1">NÃO TENHO</div>`;
        }

        card.innerHTML = `
            <div class="flex justify-between items-center w-full text-[9px] font-mono opacity-80">
                <span class="bg-black/40 px-1.5 py-0.5 rounded font-bold">${sticker.category}</span>
                <span class="${sticker.special ? 'text-amber-400 font-bold' : ''}">${sticker.code}</span>
            </div>
            <div class="sticker-avatar my-2 flex justify-center text-slate-600">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
            ${repeatedHTML}
        `;
        grid.appendChild(card);
    });
}

function toggleSticker(id) {
    if (!isAdmin) return;
    stickersState[id] = !stickersState[id];
    if (!stickersState[id]) {
        stickersRepeatedState[id] = 0;
    }
    updateDashboard();
    renderAlbum();
    syncStickerToSheets(id); // Dispara sincronização com o sheets
}

function changeRepeated(id, amount) {
    if (!isAdmin) return;
    if (stickersRepeatedState[id] === undefined) stickersRepeatedState[id] = 0;
    stickersRepeatedState[id] += amount;
    if (stickersRepeatedState[id] < 0) stickersRepeatedState[id] = 0;
    updateDashboard();
    renderAlbum();
    syncStickerToSheets(id); // Dispara sincronização com o sheets
}

function filterStickers(filter, event) {
    currentFilter = filter;
    currentPage = 1;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-[#ff1e56]', 'text-slate-950');
        btn.classList.add('text-slate-400');
    });

    const targetBtn = event ? event.currentTarget : window.event?.target;
    if (targetBtn) {
        targetBtn.classList.add('active', 'bg-[#ff1e56]', 'text-slate-950');
        targetBtn.classList.remove('text-slate-400');
    }
    renderAlbum();
}

function navigatePage(direction) {
    const groupFilter = document.getElementById('group-select').value;
    const categoryFilter = document.getElementById('category-select').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();

    const filteredList = stickersList.filter(sticker => {
        const isOwned = stickersState[sticker.id];
        const repCount = stickersRepeatedState[sticker.id] || 0;
        if (groupFilter !== 'all' && sticker.group !== groupFilter) return false;
        if (categoryFilter !== 'all' && sticker.category !== categoryFilter) return false;
        if (currentFilter === 'owned' && !isOwned) return false;
        if (currentFilter === 'missing' && isOwned) return false;
        if (currentFilter === 'repeated' && (!isOwned || repCount === 0)) return false;
        if (searchQuery) {
            const matchesName = sticker.name.toLowerCase().includes(searchQuery);
            const matchesCode = sticker.code.toLowerCase().includes(searchQuery);
            if (!matchesName && !matchesCode) return false;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;

    if (direction === 'first') currentPage = 1;
    else if (direction === 'prev') { if (currentPage > 1) currentPage--; }
    else if (direction === 'next') { if (currentPage < totalPages) currentPage++; }
    else if (direction === 'last') currentPage = totalPages;

    renderAlbum();
}

function checkLoginState() {
    if (sessionStorage.getItem('copa2026_logged_in') === 'true') {
        isAdmin = true;
        if(document.getElementById('admin-badge')) document.getElementById('admin-badge').classList.remove('hidden');
        if(document.getElementById('login-trigger-btn')) document.getElementById('login-trigger-btn').classList.add('hidden');
        if(document.getElementById('admin-hint')) document.getElementById('admin-hint').classList.remove('hidden');
    }
}

function logout() {
    sessionStorage.removeItem('copa2026_logged_in');
    location.reload();
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function handleLogin(event) {
    event.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'copa2026') {
        sessionStorage.setItem('copa2026_logged_in', 'true');
        location.reload();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}
