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
  const duration = 1200;
  const start = performance.now();

  const tick = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);
    element.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.55 }
);

counters.forEach((counter) => revealObserver.observe(counter));

document.getElementById('year').textContent = new Date().getFullYear();
