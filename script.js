// Clinic contact settings. Add the WhatsApp number (international format, digits only,
// e.g. "201001234567") to send booking requests straight to WhatsApp.
// While it is empty, the request is copied and the visitor is sent to Instagram Direct.
const CLINIC = {
  whatsapp: "",
  instagram: "braces.and.faces",
};

const root = document.documentElement;
root.classList.replace("no-js", "js");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Header */
const header = document.querySelector("[data-header]");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Mobile menu */
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const setMenu = (open) => {
  nav?.classList.toggle("is-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  if (menuToggle) menuToggle.textContent = open ? "Close" : "Menu";
};

menuToggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* Scroll reveal */
const revealNodes = document.querySelectorAll("[data-reveal]");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  revealNodes.forEach((node) => observer.observe(node));
}

/* Booking form */
const form = document.querySelector("[data-booking-form]");
const note = document.querySelector("[data-form-note]");

const showNote = (text, type) => {
  note.textContent = text;
  note.className = type ? `form-note is-${type}` : "form-note";
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  let valid = true;

  ["name", "phone", "interest"].forEach((field) => {
    const input = form.elements[field];
    const ok = String(data.get(field) || "").trim().length > 0;
    input.setAttribute("aria-invalid", String(!ok));
    if (!ok) valid = false;
  });

  if (!valid) {
    showNote("Add your name, phone number and treatment to send the request.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const lines = [
    "Hello Braces & Faces, I'd like to book a consultation.",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Treatment: ${data.get("interest")}`,
  ];
  const message = String(data.get("message") || "").trim();
  if (message) lines.push(`Message: ${message}`);
  const text = lines.join("\n");

  if (CLINIC.whatsapp) {
    showNote("Opening WhatsApp with your request…", "success");
    window.open(`https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable; the visitor can still type in the chat */
  }
  showNote("Request copied. Paste it into our Instagram chat to send it.", "success");
  window.open(`https://ig.me/m/${CLINIC.instagram}`, "_blank", "noopener");
});

form?.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("input", () => input.removeAttribute("aria-invalid"));
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
