// --- SIDEBAR TOGGLE ---
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const overlay = document.getElementById('overlay');

function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
}

function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
}

menuToggle.addEventListener('click', openSidebar);
overlay.addEventListener('click', closeSidebar);

// --- DATA MANAGEMENT ---
function getComplaints() {
    const complaints = localStorage.getItem('electionComplaints');
    return complaints ? JSON.parse(complaints) : [];
}

function saveComplaints(complaints) {
    localStorage.setItem('electionComplaints', JSON.stringify(complaints));
}

// --- UI & NAVIGATION ---
function showSection(id, element) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));
    if (element) element.classList.add("active");
    if (window.innerWidth < 992) closeSidebar();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// --- COMPLAINTS LOGIC ---
function renderComplaintsTable() {
    const complaints = getComplaints();
    const tableBody = document.getElementById('complaintsTableBody');
    tableBody.innerHTML = '';
    if (complaints.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No issues reported yet.</td></tr>';
        return;
    }
    complaints.forEach(c => {
        const statusClass = c.status === 'Resolved' ? 'status-resolved' : 'status-progress';
        const row = `
            <tr>
                <td>${c.id}</td>
                <td>${c.role}</td>
                <td>${c.issueType}</td>
                <td><span class="status ${statusClass}">${c.status}</span></td>
                <td>${c.details}</td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

document.getElementById("issueForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const complaints = getComplaints();
    const newComplaint = {
        id: "CMP-2025-" + String(Math.floor(Math.random() * 9000) + 1000),
        role: document.getElementById('role').value,
        issueType: document.getElementById('issueType').value,
        details: document.getElementById('details').value,
        status: "In Progress"
    };
    complaints.unshift(newComplaint);
    saveComplaints(complaints);
    showNotification(`Complaint ${newComplaint.id} submitted successfully!`);
    this.reset();
    renderComplaintsTable();
    showSection('track', document.querySelector('a[onclick*="track"]'));
});

function trackComplaint() {
    const id = document.getElementById("trackId").value.trim();
    const complaints = getComplaints();
    const complaint = complaints.find(c => c.id.toLowerCase() === id.toLowerCase());
    const msgEl = document.getElementById("trackMsg");
    if (id === '') {
        msgEl.innerText = "Please enter a Complaint ID to track.";
        return;
    }
    if (complaint) {
        msgEl.innerText = `Status for ${complaint.id}: ${complaint.status}. Details: ${complaint.details}`;
    } else {
        msgEl.innerText = "Complaint ID not found.";
    }
}

function verifyVoter() {
    const voterId = document.getElementById("voterId").value;
    const msgEl = document.getElementById("verifyMsg");
    if (!voterId) msgEl.innerText = "Please enter a valid ID.";
    else if (voterId === "12345") msgEl.innerText = "Duplicate voter detected!";
    else msgEl.innerText = "Voter verified successfully.";
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (getComplaints().length === 0) {
        const mockData = [
            { id: 'CMP-2024-0088', role: 'Observer', issueType: 'Misinformation', status: 'In Progress', details: 'Fake news spreading on social media about polling times.' },
            { id: 'CMP-2024-7789', role: 'Citizen/Voter', issueType: 'Fraud', status: 'Resolved', details: 'Polling official was not checking IDs properly.' },
        ];
        saveComplaints(mockData);
    }
    renderComplaintsTable();
    showSection('track', document.querySelector('a[onclick*="track"]'));
});

// --- PWA: SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
    });
}

// --- PWA: INSTALL PROMPT ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.createElement('button');
    installBtn.innerText = 'Install EMS';
    installBtn.style = 'position:fixed;bottom:20px;right:20px;padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;z-index:1000;';
    document.body.appendChild(installBtn);
    installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') console.log('App installed');
            deferredPrompt = null;
            installBtn.remove();
        });
    });
});
