const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const counters = document.querySelectorAll('[data-count]');
const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  if (!Number.isFinite(target)) return;
  const duration = 900;
  const start = performance.now();
  const tick = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.55 });
  counters.forEach((counter) => revealObserver.observe(counter));
} else {
  counters.forEach((counter) => animateCounter(counter));
}

const applicationForm = document.getElementById('application-form');
if (applicationForm) {
  applicationForm.addEventListener('submit', () => {
    const submit = applicationForm.querySelector('button[type="submit"]');
    if (submit) {
      submit.textContent = 'Opening email…';
      submit.disabled = true;
    }
  });
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
