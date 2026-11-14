const API_URL = 'http://localhost:5000/api/intel';

async function loadIntel() {
    try {
        const response = await fetch(API_URL, { credentials: 'include' });
        const data = await response.json();
        const feed = document.getElementById('intelFeed');
        
        feed.innerHTML = data.data.map(item => {
            let severityClass = 'severity-low';
            let badgeClass = 'badge-low';
            if (item.severity === 'High') { severityClass = 'severity-high'; badgeClass = 'badge-high'; }
            else if (item.severity === 'Medium') { severityClass = 'severity-med'; badgeClass = 'badge-med'; }

            return `
                <div class="intel-card ${severityClass}">
                    <div class="intel-header">
                        <h3>${item.title}</h3>
                        <span class="badge ${badgeClass}">${item.severity}</span>
                    </div>
                    <p class="intel-desc">${item.description}</p>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load intel');
    }
}
loadIntel();