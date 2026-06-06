// Intl Timezone list
const ALL_TIMEZONES = [
    'Africa/Johannesburg',
    'Africa/Cairo',
    'Africa/Lagos',
    'Africa/Nairobi',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Honolulu',
    'America/Mexico_City',
    'America/Toronto',
    'America/São_Paulo',
    'America/Buenos_Aires',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Jakarta',
    'Asia/Manila',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Bangkok',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Amsterdam',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Stockholm',
    'Europe/Moscow',
    'Europe/Istanbul',
    'Europe/Athens',
    'Europe/Dublin',
    'Europe/Lisbon',
    'Europe/Brussels',
    'Europe/Vienna',
    'Europe/Prague',
    'Europe/Budapest',
    'Europe/Warsaw',
    'Europe/Bucharest',
    'Europe/Helsinki',
    'Europe/Zurich',
    'Oceania/Auckland',
    'Oceania/Sydney',
    'Oceania/Melbourne',
    'Oceania/Brisbane',
    'Oceania/Fiji',
    'Pacific/Honolulu',
    'Pacific/Marquesas',
    'Pacific/Tongatapu',
];

// Store selected timezones
let selectedTimezones = JSON.parse(localStorage.getItem('selectedTimezones')) || [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    populateTimezoneSelect();
    renderTimezoneCards();
    updateClocks();
    setInterval(updateClocks, 1000);
});

// Update all clocks
function updateClocks() {
    updateDigitalClock();
    updateAnalogClock();
    updateTimezoneClocks();
}

// Digital Clock
function updateDigitalClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('digitalTime').textContent = `${hours}:${minutes}:${seconds}`;
    document.getElementById('periodDisplay').textContent = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Analog Clock
function updateAnalogClock() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minuteDeg = (minutes * 6) + (seconds * 0.1);
    const secondDeg = seconds * 6;
    
    document.getElementById('hourHand').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('secondHand').style.transform = `rotate(${secondDeg}deg)`;
}

// Timezone Clocks
function updateTimezoneClocks() {
    const cards = document.querySelectorAll('.timezone-card');
    cards.forEach(card => {
        const timezone = card.dataset.timezone;
        const now = new Date();
        
        // Get time in timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            month: 'short',
            day: 'numeric'
        });
        
        const time = formatter.format(now);
        const date = dateFormatter.format(now);
        
        card.querySelector('.timezone-time').textContent = time;
        card.querySelector('.timezone-date').textContent = date;
        
        // Update progress bar (shows time progress throughout the day)
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const progressPercent = (totalSeconds / (24 * 3600)) * 100;
        card.querySelector('.timezone-progress-bar').style.width = progressPercent + '%';
    });
}

// Render timezone cards
function renderTimezoneCards() {
    const grid = document.getElementById('timezoneGrid');
    grid.innerHTML = '';
    
    selectedTimezones.forEach((timezone, index) => {
        const card = createTimezoneCard(timezone, index);
        grid.appendChild(card);
    });
    
    updateTimezoneClocks();
}

// Create timezone card
function createTimezoneCard(timezone, index) {
    const card = document.createElement('div');
    card.className = 'timezone-card';
    card.dataset.timezone = timezone;
    
    // Get UTC offset
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const tzDate = new Date(formatter.format(now) + ' UTC');
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offset = Math.round((now - localDate) / 60000);
    const offsetHours = Math.floor(offset / 60);
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offsetHours >= 0 ? '+' : '';
    const offsetStr = `UTC ${offsetSign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
    
    card.innerHTML = `
        <div class="timezone-header">
            <div class="timezone-info">
                <h3>${timezone.replace(/_/g, ' ')}</h3>
                <div class="timezone-offset">${offsetStr}</div>
            </div>
            <button class="timezone-remove" onclick="removeTimezone(${index})" title="Remove">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        <div class="timezone-time">00:00:00</div>
        <div class="timezone-date">Jan 01</div>
        <div class="timezone-progress">
            <div class="timezone-progress-bar"></div>
        </div>
    `;
    
    return card;
}

// Populate timezone select
function populateTimezoneSelect() {
    const select = document.getElementById('timezoneSelect');
    ALL_TIMEZONES.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

// Search timezone
document.getElementById('searchTimezone').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.timezone-card');
    
    cards.forEach(card => {
        const tzName = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = tzName.includes(searchTerm) ? 'block' : 'none';
    });
});

// Add custom timezone
function addCustomTimezone() {
    document.getElementById('timezoneModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('timezoneModal').classList.remove('active');
}

// Save timezone
function saveTimezone() {
    const select = document.getElementById('timezoneSelect');
    const timezone = select.value;
    
    if (!selectedTimezones.includes(timezone)) {
        selectedTimezones.push(timezone);
        localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
        renderTimezoneCards();
    }
    
    closeModal();
}

// Remove timezone
function removeTimezone(index) {
    selectedTimezones.splice(index, 1);
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
    renderTimezoneCards();
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('timezoneModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const targetId = this.getAttribute('href');
        if (targetId) {
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update scroll based navigation
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.clock-section');
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

console.log('World Clock App Loaded Successfully!');