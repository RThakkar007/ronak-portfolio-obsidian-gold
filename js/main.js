/* Obsidian Gold — main.js */

// ===== CANVAS BACKGROUND (floating gold particles) =====
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

class GoldParticle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -Math.random() * 0.5 - 0.1;
    this.size = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.05;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * (1 - this.life / this.maxLife);
    ctx.fillStyle = '#f5a623';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#f5a623';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particles = Array.from({ length: 80 }, () => new GoldParticle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== TYPING EFFECT =====
const roles = [
  'Sr. QA Test Engineer',
  'Test Automation Specialist',
  'Agile QA Lead',
  'ISTQB Certified Tester',
  'Quality Assurance Expert',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-role');

function type() {
  const current = roles[roleIdx];
  if (!deleting && charIdx < current.length) {
    typedEl.textContent = current.slice(0, ++charIdx);
    setTimeout(type, 75);
  } else if (!deleting && charIdx === current.length) {
    setTimeout(() => { deleting = true; type(); }, 2500);
  } else if (deleting && charIdx > 0) {
    typedEl.textContent = current.slice(0, --charIdx);
    setTimeout(type, 40);
  } else {
    deleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    setTimeout(type, 400);
  }
}
type();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== SKILL BAR ANIMATION =====
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-bars-col').forEach(el => barObserver.observe(el));

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== CONTACT FORM — with Visitor Data Capture =====
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  return 'Desktop';
}
function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome')) return 'Google Chrome';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
}
function getOSName() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
}

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const name = document.getElementById('cf-name').value;
  const email = document.getElementById('cf-email').value;
  const subject = document.getElementById('cf-subject').value || '(No subject)';
  const message = document.getElementById('cf-message').value;

  btn.textContent = '⏳ Sending...';
  btn.disabled = true;

  const visitorData = {
    browser: getBrowserName(),
    os: getOSName(),
    device: getDeviceType(),
    screenRes: `${screen.width}x${screen.height}`,
    language: navigator.language || 'N/A',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    referrer: document.referrer || 'Direct',
    sourceSite: window.location.href,
    ip: 'Fetching...',
    city: 'Fetching...',
    country: 'Fetching...',
    isp: 'Fetching...'
  };

  try {
    const geo = await fetch('https://ipapi.co/json/').then(r => r.json());
    visitorData.ip = geo.ip || 'N/A';
    visitorData.city = geo.city || 'N/A';
    visitorData.country = `${geo.country_name || 'N/A'} (${geo.country_code || ''})`;
    visitorData.isp = geo.org || 'N/A';
  } catch (_) {
    visitorData.ip = 'Unavailable';
    visitorData.city = 'Unavailable';
    visitorData.country = 'Unavailable';
    visitorData.isp = 'Unavailable';
  }

  const payload = {
    from_name: name, from_email: email, subject, message,
    visitor_ip: visitorData.ip, visitor_city: visitorData.city,
    visitor_country: visitorData.country, visitor_isp: visitorData.isp,
    visitor_browser: visitorData.browser, visitor_os: visitorData.os,
    visitor_device: visitorData.device, visitor_screen: visitorData.screenRes,
    visitor_language: visitorData.language, visitor_timezone: visitorData.timezone,
    visitor_time: visitorData.timestamp, visitor_referrer: visitorData.referrer,
    source_site: visitorData.sourceSite
  };
  console.log('[Portfolio Contact] Submission payload (ready for EmailJS):', payload);

  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'rgba(245,166,35,0.15)';
  btn.style.borderColor = 'var(--gold)';
  btn.style.color = 'var(--gold)';

  const panel = document.getElementById('cf-visitor-data');
  panel.style.display = 'block';
  panel.innerHTML = `
    <div style="margin-top:20px;padding:16px;border:1px solid rgba(245,166,35,0.3);border-radius:4px;background:rgba(245,166,35,0.04);font-family:var(--font-sans);font-size:12px;color:var(--text-dim);">
      <div style="color:var(--gold);font-weight:700;margin-bottom:10px;font-size:13px;letter-spacing:0.08em;">VISITOR SESSION DATA</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;">
        <span>IP Address:</span><span style="color:var(--gold);">${visitorData.ip}</span>
        <span>Location:</span><span style="color:var(--gold);">${visitorData.city}, ${visitorData.country}</span>
        <span>ISP:</span><span style="color:var(--gold);">${visitorData.isp}</span>
        <span>Browser:</span><span style="color:var(--gold);">${visitorData.browser}</span>
        <span>OS:</span><span style="color:var(--gold);">${visitorData.os}</span>
        <span>Device:</span><span style="color:var(--gold);">${visitorData.device}</span>
        <span>Screen:</span><span style="color:var(--gold);">${visitorData.screenRes}</span>
        <span>Timezone:</span><span style="color:var(--gold);">${visitorData.timezone}</span>
        <span>Language:</span><span style="color:var(--gold);">${visitorData.language}</span>
        <span>Time:</span><span style="color:var(--gold);">${visitorData.timestamp}</span>
        <span>Referrer:</span><span style="color:var(--gold);">${visitorData.referrer}</span>
      </div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(245,166,35,0.15);color:rgba(245,166,35,0.5);font-size:11px;">📧 Email delivery: wire up EmailJS to send this payload to ronakenterprise0@gmail.com</div>
    </div>`;

  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.disabled = false;
    e.target.reset();
    setTimeout(() => { panel.style.display = 'none'; }, 500);
  }, 8000);
});

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--gold)' : '';
  });
});

// ===== DARK / LIGHT MODE TOGGLE =====
(function() {
  const STORAGE_KEY = 'rt-gold-theme';
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  // Apply saved or system preference on load
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  // Update particle colors based on theme
  function updateParticleColors(theme) {
    if (typeof particles !== 'undefined') {
      particles.forEach(p => {
        if (theme === 'light') {
          p.color = Math.random() > 0.5 ? '#b8760a' : '#d4890a';
        } else {
          p.color = Math.random() > 0.5 ? '#f5a623' : '#ffd166';
        }
      });
    }
  }
  updateParticleColors(initial);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    updateParticleColors(next);
  });
})();
