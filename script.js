const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const year = document.querySelector("[data-year]");
const form = document.querySelector("[data-booking-form]");
const formNote = document.querySelector("[data-form-note]");
const canvas = document.querySelector(".motion-field");
const heroMedia = document.querySelector(".hero-media");

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = [...document.querySelectorAll(".reveal")];
revealItems.forEach((item, index) => {
  item.style.setProperty("--delay", `${Math.min(index * 55, 320)}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
);

revealItems.forEach((item) => revealObserver.observe(item));

const metrics = [...document.querySelectorAll("[data-count]")];
const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateMetric(entry.target);
      metricObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.7 },
);

metrics.forEach((metric) => metricObserver.observe(metric));

function animateMetric(element) {
  const target = Number(element.dataset.count || 0);
  const duration = prefersReducedMotion ? 0 : 1300;
  const start = performance.now();

  const frame = (now) => {
    const progress = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toString();

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
}

if (!prefersReducedMotion && heroMedia) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 24;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      heroMedia.style.setProperty("--parallax-x", `${x}px`);
      heroMedia.style.setProperty("--parallax-y", `${y}px`);
    },
    { passive: true },
  );
}

document.querySelectorAll(".magnetic").forEach((element) => {
  if (prefersReducedMotion) return;

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get("name")?.toString().trim();
    const phone = data.get("phone")?.toString().trim();
    const interest = data.get("interest")?.toString().trim();
    const message = data.get("message")?.toString().trim();

    const body = [
      "New consultation request from bracesandfaces.net",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Treatment interest: ${interest}`,
      "",
      "Message:",
      message || "No message provided.",
    ].join("\n");

    const mailto = new URL("mailto:hello@bracesandfaces.net");
    mailto.searchParams.set("subject", `Consultation request from ${name}`);
    mailto.searchParams.set("body", body);

    formNote.textContent = "Opening your email app with the consultation details.";
    window.location.href = mailto.toString();
  });
}

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const createParticles = () => {
    particles.length = 0;
    const count = Math.min(86, Math.max(34, Math.floor(width / 18)));

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.22 + 0.08,
        drift: Math.random() * 0.22 - 0.11,
        alpha: Math.random() * 0.28 + 0.08,
      });
    }
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;

      if (particle.y < -8) {
        particle.y = height + 8;
        particle.x = Math.random() * width;
      }

      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(18, 74, 132, ${particle.alpha})`;
      ctx.fill();

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 118) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(18, 74, 132, ${0.07 * (1 - distance / 118)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw();

  window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame));
}
