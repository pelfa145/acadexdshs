// Data Management
const STORAGE_KEY = 'acadex_data_v1';
const DEFAULT_PAPERS = [
    {
        id: 1,
        title: "Machine Learning Applications in Educational Assessment",
        author: "Maria Santos",
        strand: "ICT",
        year: "2023-2024",
        abstract: "This research explores the implementation of machine learning algorithms to improve educational assessment methods. The study demonstrates how AI can provide more accurate and timely feedback to students, helping educators identify learning gaps and personalize instruction.",
        keywords: ["machine learning", "education", "assessment", "AI"],
        fileName: "ml_education_research.pdf",
        uploadDate: "2024-01-15",
        downloads: 142,
        views: 350
    },
    {
        id: 2,
        title: "The Impact of Social Media on Mental Health Among Adolescents",
        author: "John Reyes",
        strand: "HUMSS",
        year: "2023-2024",
        abstract: "A comprehensive study examining the correlation between social media usage and mental health outcomes in teenagers. Research includes surveys, interviews, and statistical analysis to provide insights into this pressing societal issue.",
        keywords: ["social media", "mental health", "adolescents", "psychology"],
        fileName: "social_media_mental_health.pdf",
        uploadDate: "2024-01-10",
        downloads: 89,
        views: 210
    },
    {
        id: 3,
        title: "Renewable Energy Solutions for Sustainable Communities",
        author: "Sarah Chen",
        strand: "HUMSS",
        category: "Dissertation",
        year: "2024-2025",
        abstract: "This paper investigates how social media and digital communication platforms are influencing the evolution of major Filipino dialects. Through linguistic analysis of over 50,000 public social media posts, the study identifies emerging loan words, code-switching patterns, and grammatical shifts among Gen Z speakers.",
        keywords: ["linguistics", "social media", "filipino", "culture", "communication"],
        fileName: "filipino_dialects_digital.pdf",
        uploadDate: "2025-11-20",
        downloads: 205,
        views: 560
    },
    {
        id: 4,
        title: "Micro-Business Resilience Strategies During Post-Pandemic Economic Recovery",
        author: "Miguel Torres",
        strand: "ABM",
        category: "Thesis",
        year: "2025-2026",
        abstract: "An analysis of financial management and operational strategies adopted by sari-sari stores and small eateries in Cavite during the 2024-2025 economic recovery period. The study identifies key success factors including digital payment adoption and inventory diversification.",
        keywords: ["economics", "small business", "finance", "resilience", "management"],
        fileName: "micro_business_resilience.pdf",
        uploadDate: "2026-01-05",
        downloads: 76,
        views: 180
    },
    {
        id: 5,
        title: "Psychological Effects of Algorithmic Feed Curation on Senior High Students",
        author: "Bea Alonzo",
        strand: "GAS",
        category: "Research",
        year: "2025-2026",
        abstract: "This correlational study examines the relationship between exposure to algorithmically curated social media feeds and self-reported anxiety levels among SHS students. Findings suggest a significant positive correlation between 'doomscrolling' duration and reported symptoms of eco-anxiety and social comparison.",
        keywords: ["psychology", "mental health", "social media", "algorithms", "youth"],
        fileName: "algo_psychology_effects.pdf",
        uploadDate: "2026-02-28",
        downloads: 112,
        views: 310
    },
    {
        id: 6,
        title: "Automated Waste Segregation System Using IoT and Computer Vision",
        author: "Rafael Lim",
        strand: "ICT",
        category: "Capstone",
        year: "2025-2026",
        abstract: "Development of a smart trash bin that uses Raspberry Pi and OpenCV to automatically classify and segregate waste into biodegradable, recyclable, and non-recyclable compartments. The prototype achieved an accuracy rate of 88% in real-world testing conditions.",
        keywords: ["IoT", "computer vision", "hardware", "waste management", "automation"],
        fileName: "smart_waste_bin.pdf",
        uploadDate: "2026-03-01",
        downloads: 45,
        views: 120
    }
];

// State
let state = {
    papers: [],
    user: null,
    viewMode: 'grid' // 'grid' or 'list'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    animateStats();
    renderFeatured();
    
    // Check URL hash for initial section
    const hash = window.location.hash.substring(1);
    if (hash) showSection(hash);
});

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        state.papers = parsed.papers || DEFAULT_PAPERS;
        state.user = parsed.user || null;
    } else {
        state.papers = DEFAULT_PAPERS;
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        papers: state.papers,
        user: state.user
    }));
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active-section');
        s.classList.add('hidden');
    });

    // Show target
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        // Small delay to allow display:block to apply before adding opacity class
        setTimeout(() => {
            target.classList.add('active-section');
        }, 10);
    }

    // Update Nav
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
        if (l.dataset.section === sectionId) l.classList.add('active');
    });

    // Specific logic
    if (sectionId === 'browse') {
        renderPapers(state.papers);
    }
    
    // Mobile menu close
    document.querySelector('.nav-menu').classList.remove('active');
    
    // Scroll to top
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

    // Apply view mode class
    grid.className = state.viewMode === 'list' ? 'papers-list' : 'papers-grid';

    papersToRender.forEach(paper => {
        const card = document.createElement('div');
        card.className = `paper-card ${paper.strand}`;
        card.onclick = () => openPaperModal(paper.id);
        
        // Staggered animation
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
                    <span style="margin-right: 12px;"><i class="fas fa-eye"></i> ${paper.views}</span>
                    <span><i class="fas fa-download"></i> ${paper.downloads}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderFeatured() {
    const grid = document.getElementById('featuredGrid');
    // Get top 3 by views
    const featured = [...state.papers].sort((a, b) => b.views - a.views).slice(0, 3);
    
    grid.innerHTML = featured.map(paper => `
        <div class="paper-card ${paper.strand}" onclick="openPaperModal(${paper.id})">
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
                            p.keywords.some(k => k.toLowerCase().includes(searchTerm));
        const matchesStrand = !strand || p.strand === strand;
        return matchesSearch && matchesStrand;
    });

    // Sorting
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
function openPaperModal(id) {
    const paper = state.papers.find(p => p.id === id);
    if (!paper) return;

    // Increment views
    paper.views++;
    saveData();

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
                <p>${paper.downloads} Downloads</p>
            </div>
        </div>

        <span class="section-label">Abstract</span>
        <p class="full-abstract">${paper.abstract}</p>

        <span class="section-label">Keywords</span>
        <div class="keyword-chips">
            ${paper.keywords.map(k => `<span class="k-chip">#${k}</span>`).join('')}
        </div>

        <div class="modal-actions">
            <button class="btn btn-primary" onclick="downloadPaper(${paper.id})">
                <i class="fas fa-file-download"></i> Download PDF
            </button>
            <button class="btn btn-outline" onclick="copyCitation(${paper.id})">
                <i class="fas fa-quote-right"></i> Cite
            </button>
        </div>
    `;

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('paperModal').style.display = 'none';
}

function downloadPaper(id) {
    const paper = state.papers.find(p => p.id === id);
    if (paper) {
        paper.downloads++;
        saveData();
        
        // Fake download process
        const btn = document.querySelector('.modal-actions .btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        btn.disabled = true;
        
        setTimeout(() => {
            showToast(`Downloaded "${paper.fileName}" successfully`, 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);
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
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Mobile Menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(filterPapers, 300));

    // Keyword Input Tagging
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
            <span class="keyword-tag">
                ${tag}
                <i class="fas fa-times" onclick="removeTag('${tag}')"></i>
            </span>
        `).join('');
    }

    window.removeTag = (tag) => {
        keywordTags.delete(tag);
        renderTags();
    };

    // File Upload Preview
    const fileInput = document.getElementById('pdfFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const name = e.target.files[0].name;
            fileNameDisplay.textContent = name;
            fileNameDisplay.classList.remove('hidden');
        }
    });

    // Form Submit
    document.getElementById('uploadForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulating upload
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publishing...';
        btn.disabled = true;

        setTimeout(() => {
            const newPaper = {
                id: Date.now(),
                title: document.getElementById('paperTitle').value,
                author: document.getElementById('authorName').value,
                strand: document.getElementById('strand').value,
                category: document.getElementById('category').value,
                year: document.getElementById('year').value,
                abstract: document.getElementById('abstract').value,
                keywords: Array.from(keywordTags),
                fileName: fileInput.files[0] ? fileInput.files[0].name : 'document.pdf',
                uploadDate: new Date().toISOString(),
                downloads: 0,
                views: 0
            };

            state.papers.unshift(newPaper);
            saveData();
            
            showToast('Research paper published successfully!', 'success');
            e.target.reset();
            keywordTags.clear();
            renderTags();
            fileNameDisplay.classList.add('hidden');
            
            btn.innerHTML = 'Publish Paper';
            btn.disabled = false;
            
            showSection('browse');
        }, 2000);
    });

    // Login Form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        if (email.endsWith('.edu') || email.includes('dshs')) {
            state.user = { email: email, name: email.split('@')[0] };
            saveData();
            showToast(`Welcome back, ${state.user.name}`, 'success');
            showSection('browse');
        } else {
            showToast('Please use a valid school email address', 'error');
        }
    });

    // View Toggles
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.viewMode = btn.dataset.view;
            filterPapers();
        });
    });

    // Click outside modal
    window.onclick = (event) => {
        if (event.target == document.getElementById('paperModal')) {
            closeModal();
        }
    };
}

// Utilities
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = +stat.dataset.target;
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        const updateCount = () => {
            current += increment;
            if (current < target) {
                stat.innerText = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                stat.innerText = target;
            }
        };
        updateCount();
    });
}
