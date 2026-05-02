// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('active'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealElements.forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('.stat-number[data-target]');
let counterStarted = false;
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counterStarted) {
      counterStarted = true;
      counters.forEach(counter => {
        const target = +counter.dataset.target;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const update = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current) + '+';
            requestAnimationFrame(update);
          } else {
            counter.textContent = target + '+';
          }
        };
        update();
      });
    }
  });
}, { threshold: 0.5 });
if (counters.length) counterObserver.observe(counters[0]);

// ===== TESTIMONIAL CAROUSEL =====
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('testimonialDots');
if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  const getVisible = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const totalDots = () => Math.max(1, cards.length - getVisible() + 1);

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalDots(); i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === currentSlide ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goToSlide(index) {
    currentSlide = index;
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  buildDots();
  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalDots();
    goToSlide(currentSlide);
  }, 4000);
  window.addEventListener('resize', () => { currentSlide = 0; buildDots(); goToSlide(0); });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(fi => {
      fi.classList.remove('active');
      fi.querySelector('.faq-answer').style.maxHeight = null;
    });
    if (!isActive) {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ===== COUNTDOWN TIMER =====
function startCountdown() {
  const h = document.getElementById('hours');
  const m = document.getElementById('mins');
  const s = document.getElementById('secs');
  let stored = localStorage.getItem('cfx_countdown');
  let totalSecs = stored ? parseInt(stored) : 23 * 3600 + 59 * 60 + 59;
  if (totalSecs <= 0) totalSecs = 23 * 3600 + 59 * 60 + 59;

  setInterval(() => {
    totalSecs--;
    if (totalSecs <= 0) totalSecs = 23 * 3600 + 59 * 60 + 59;
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    h.textContent = String(hrs).padStart(2, '0');
    m.textContent = String(mins).padStart(2, '0');
    s.textContent = String(secs).padStart(2, '0');
    localStorage.setItem('cfx_countdown', totalSecs);
  }, 1000);
}
startCountdown();

// ===== LEAD FORM =====
const form = document.getElementById('consultForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    package: document.getElementById('package').value
  };

  if (!data.name || !data.phone || !data.email) {
    alert('Please fill in all required fields.');
    return;
  }

  // Try backend first, fallback to local storage
  try {
    const res = await fetch('http://localhost:5000/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Server error');
  } catch {
    // Save locally if backend is not running
    const leads = JSON.parse(localStorage.getItem('cfx_leads') || '[]');
    leads.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('cfx_leads', JSON.stringify(leads));
  }

  form.style.display = 'none';
  formSuccess.style.display = 'block';

  // Redirect to Google Form after a short delay
  setTimeout(() => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdzvCKVojXVi3o55bzMjWxKmPmZy6to6GdIZOSanuWAtL7l-Q/viewform?usp=header', '_blank');
  }, 1500);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navH = navbar.offsetHeight + 20;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    }
  });
});
