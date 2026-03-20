// Data Management
// Note: Supabase is initialized in index.html and exposed via window.supabaseClient

// State
let state = {
    papers: [],
    user: null,
    viewMode: 'grid' // 'grid' or 'list'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase to load
    setTimeout(() => {
        loadPapersFromSupabase();
        setupAuthState();
    }, 500);

    setupEventListeners();
    animateStats();
    
    // Check URL hash for initial section
    const hash = window.location.hash.substring(1);
    if (hash) showSection(hash);
});

async function loadPapersFromSupabase() {
    try {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const { data, error } = await supabase
            .from('papers')
            .select('*')
            .order('uploadDate', { ascending: false });

        if (error) throw error;

        state.papers = data || [];
        renderPapers(state.papers);
        renderFeatured();
        updateStats(state.papers.length);
    } catch (error) {
        console.error("Error loading papers:", error);
        showToast("Error loading data from Supabase", "error");
    }
}

async function setupAuthState() {
    const supabase = window.supabaseClient;
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    state.user = user;
    updateAuthUI(!!user);

    supabase.auth.onAuthStateChange((event, session) => {
        state.user = session?.user || null;
        updateAuthUI(!!state.user);
    });
}

function updateAuthUI(isLoggedIn) {
    const loginBtn = document.querySelector('.btn-login');
    if (isLoggedIn) {
        loginBtn.textContent = 'Sign Out';
        loginBtn.onclick = async () => {
            const { error } = await window.supabaseClient.auth.signOut();
            if (!error) {
                showToast("Signed out successfully", "success");
                showSection('home');
            }
        };
    } else {
        loginBtn.textContent = 'Sign In';
        loginBtn.setAttribute('onclick', "showSection('login')");
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active-section');
        s.classList.add('hidden');
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        setTimeout(() => {
            target.classList.add('active-section');
        }, 10);
    }

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
        if (l.dataset.section === sectionId) l.classList.add('active');
    });

    if (sectionId === 'browse') {
        renderPapers(state.papers);
    }
    
    document.querySelector('.nav-menu').classList.remove('active');
    window.scrollTo(0, 0);
}

// UI Rendering
function renderPapers(papersToRender) {
    const grid = document.getElementById('papersGrid');
    const noResults = document.getElementById('noResults');
    
    grid.innerHTML = '';
    
    if (papersToRender.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');

    grid.className = state.viewMode === 'list' ? 'papers-list' : 'papers-grid';

    papersToRender.forEach(paper => {
        const card = document.createElement('div');
        card.className = `paper-card ${paper.strand}`;
        card.onclick = () => openPaperModal(paper.id);
        
        card.style.animation = `fadeIn 0.5s ease forwards`;

        card.innerHTML = `
            <div class="card-header">
                <span class="strand-badge">${paper.strand}</span>
                <h3 class="paper-title">${paper.title}</h3>
                <div class="paper-meta">
                    <span><i class="fas fa-user-circle"></i> ${paper.author}</span>
                </div>
            </div>
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="card-footer">
                <span class="paper-year"><i class="far fa-calendar-alt"></i> ${paper.year}</span>
                <div class="paper-stats" style="color: var(--text-light); font-size: 0.85rem;">
                    <span style="margin-right: 12px;"><i class="fas fa-eye"></i> ${paper.views || 0}</span>
                    <span><i class="fas fa-download"></i> ${paper.downloads || 0}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderFeatured() {
    const grid = document.getElementById('featuredGrid');
    const featured = [...state.papers].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
    
    grid.innerHTML = featured.map(paper => `
        <div class="paper-card ${paper.strand}" onclick="openPaperModal('${paper.id}')">
            <span class="strand-badge">${paper.strand}</span>
            <h3 class="paper-title" style="font-size: 1rem;">${paper.title}</h3>
            <p class="paper-abstract" style="-webkit-line-clamp: 2;">${paper.abstract}</p>
            <div class="paper-meta" style="margin-top: auto; padding-top: 12px; font-size: 0.8rem;">
                <span><i class="fas fa-star" style="color: var(--warning)"></i> Featured Research</span>
            </div>
        </div>
    `).join('');
}

// Search & Filter
function filterPapers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const strand = document.getElementById('strandFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filtered = state.papers.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                            p.abstract.toLowerCase().includes(searchTerm) ||
                            (p.keywords && p.keywords.some(k => k.toLowerCase().includes(searchTerm)));
        const matchesStrand = !strand || p.strand === strand;
        return matchesSearch && matchesStrand;
    });

    if (sort === 'newest') {
        filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } else if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    } else if (sort === 'az') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderPapers(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('strandFilter').value = '';
    document.getElementById('sortFilter').value = 'newest';
    filterPapers();
}

// Modal Logic
async function openPaperModal(id) {
    const paper = state.papers.find(p => p.id === id);
    if (!paper) return;

    try {
        const supabase = window.supabaseClient;
        await supabase.rpc('increment_views', { paper_id: id });
        paper.views = (paper.views || 0) + 1;
    } catch (e) {
        console.error("View increment failed", e);
    }

    const modal = document.getElementById('paperModal');
    const modalBody = document.getElementById('modalBody');
    const badges = document.getElementById('modalBadges');

    badges.innerHTML = `
        <span class="strand-badge" style="background:var(--bg-secondary); color:var(--text-main)">${paper.category}</span>
        <span class="strand-badge">${paper.strand}</span>
    `;

    modalBody.innerHTML = `
        <h2 class="paper-full-title">${paper.title}</h2>
        <div class="paper-details-grid">
            <div class="detail-item">
                <h4>Author</h4>
                <p>${paper.author}</p>
            </div>
            <div class="detail-item">
                <h4>Academic Year</h4>
                <p>${paper.year}</p>
            </div>
            <div class="detail-item">
                <h4>Published</h4>
                <p>${new Date(paper.uploadDate).toLocaleDateString()}</p>
            </div>
            <div class="detail-item">
                <h4>Impact</h4>
                <p>${paper.downloads || 0} Downloads</p>
            </div>
        </div>
        <span class="section-label">Abstract</span>
        <p class="full-abstract">${paper.abstract}</p>
        <span class="section-label">Keywords</span>
        <div class="keyword-chips">
            ${(paper.keywords || []).map(k => `<span class="k-chip">#${k}</span>`).join('')}
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="downloadPaper('${paper.id}')">
                <i class="fas fa-file-download"></i> Download PDF
            </button>
            <button class="btn btn-outline" onclick="copyCitation('${paper.id}')">
                <i class="fas fa-quote-right"></i> Cite
            </button>
        </div>
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('paperModal').style.display = 'none';
}

async function downloadPaper(id) {
    const paper = state.papers.find(p => p.id === id);
    if (paper) {
        try {
            await window.supabaseClient.rpc('increment_downloads', { paper_id: id });
            paper.downloads = (paper.downloads || 0) + 1;
        } catch (e) {
            console.error("Download increment failed", e);
        }
        
        showToast(`Opening document...`, 'success');
        if (paper.fileUrl) {
            window.open(paper.fileUrl, '_blank');
        }
    }
}

function copyCitation(id) {
    const paper = state.papers.find(p => p.id === id);
    if (paper) {
        const citation = `${paper.author}. (${paper.year.split('-')[0]}). "${paper.title}". DSHS Acadex Repository.`;
        navigator.clipboard.writeText(citation);
        showToast('Citation copied to clipboard', 'info');
    }
}

// Upload Form Handling
const keywordTags = new Set();

function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });

    document.getElementById('searchInput').addEventListener('input', debounce(filterPapers, 300));

    const keyInput = document.getElementById('keywords');
    const tagsContainer = document.getElementById('keywordTags');

    keyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = keyInput.value.trim().replace(/,/g, '');
            if (val && !keywordTags.has(val)) {
                keywordTags.add(val);
                renderTags();
                keyInput.value = '';
            }
        }
    });

    function renderTags() {
        tagsContainer.innerHTML = Array.from(keywordTags).map(tag => `
            <span class="keyword-tag">${tag} <i class="fas fa-times" onclick="removeTag('${tag}')"></i></span>
        `).join('');
    }

    window.removeTag = (tag) => {
        keywordTags.delete(tag);
        renderTags();
    };

    const fileInput = document.getElementById('pdfFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.classList.remove('hidden');
        }
    });

    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!state.user) {
            showToast('Please sign in to publish.', 'error');
            showSection('login');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Uploading...';
        btn.disabled = true;

        try {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `papers/${fileName}`;

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('research-papers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = window.supabaseClient.storage
                .from('research-papers')
                .getPublicUrl(filePath);

            const newPaper = {
                title: document.getElementById('paperTitle').value,
                author: document.getElementById('authorName').value,
                strand: document.getElementById('strand').value,
                category: document.getElementById('category').value,
                year: document.getElementById('year').value,
                abstract: document.getElementById('abstract').value,
                keywords: Array.from(keywordTags),
                fileName: file.name,
                fileUrl: publicUrl,
                uploadDate: new Date().toISOString(),
                downloads: 0,
                views: 0,
                uploaderId: state.user.id
            };

            const { data, error } = await window.supabaseClient
                .from('papers')
                .insert([newPaper])
                .select();

            if (error) throw error;

            state.papers.unshift(data[0]);
            showToast('Published successfully!', 'success');
            e.target.reset();
            keywordTags.clear();
            renderTags();
            fileNameDisplay.classList.add('hidden');
            showSection('browse');
        } catch (error) {
            console.error("Upload failed:", error);
            showToast("Upload failed: " + error.message, "error");
        } finally {
            btn.innerHTML = 'Publish Paper';
            btn.disabled = false;
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');
        
        btn.innerHTML = 'Signing In...';
        btn.disabled = true;

        const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast(`Welcome back!`, 'success');
            showSection('browse');
        }
        btn.innerHTML = 'Sign In';
        btn.disabled = false;
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.viewMode = btn.dataset.view;
            filterPapers();
        });
    });

    window.onclick = (event) => {
        if (event.target == document.getElementById('paperModal')) closeModal();
    };
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle');
    toast.innerHTML = `<i class="fas fa-${icon} toast-icon"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function animateStats() {}
function updateStats(count) {
    const stat = document.querySelector('.stat-number[data-target="150"]');
    if(stat) stat.innerText = count;
}
