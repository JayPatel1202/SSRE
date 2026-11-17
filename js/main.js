const config = window.SSRE_CONFIG || {};

const form = document.getElementById("enquiry-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

function getSheetEndpoint() {
  return (config.GOOGLE_SCRIPT_URL || "").trim();
}

/* Back to top (hash links fail when #top was on sticky header) */
function scrollToPageTop(event) {
  event?.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
  const target = document.getElementById("top");
  if (target && typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

document.querySelectorAll("[data-scroll-top], a[href='#top']").forEach((el) => {
  el.addEventListener("click", scrollToPageTop);
});

const capacityInput = document.getElementById("capacity");
document.querySelectorAll("[data-package]").forEach((link) => {
  link.addEventListener("click", () => {
    const value = link.getAttribute("data-package");
    if (capacityInput && value) {
      capacityInput.value = value;
    }
  });
});

/* Mobile nav */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("primary-nav");

navToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

/* Scroll reveal */
const revealEls = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
}

function buildSubmissionPayload() {
  const fd = new FormData(form);
  const gotcha = fd.get("_gotcha");
  if (gotcha) {
    return { honeypot: true };
  }

  const payload = {
    name: String(fd.get("name") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    average_bill: String(fd.get("average_bill") || "").trim(),
    solar_capacity: String(fd.get("solar_capacity") || "").trim(),
    message: String(fd.get("message") || "").trim(),
    page_url: window.location.href,
  };

  const secret = (config.FORM_SECRET || "").trim();
  if (secret) {
    payload.secret = secret;
  }

  return payload;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const endpoint = getSheetEndpoint();
  if (!endpoint) {
    statusEl.textContent =
      "Form is not linked to Google Sheets yet. Add your Web App URL in js/config.js (see SETUP-GOOGLE-SHEET.md).";
    statusEl.className = "form-status error";
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "Sending your enquiry…";
  statusEl.className = "form-status";

  try {
    const payload = buildSubmissionPayload();
    if (payload.honeypot) {
      statusEl.textContent = "Thank you! We’ll call you shortly with your quote.";
      statusEl.className = "form-status success";
      form.reset();
      return;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      statusEl.textContent = "Thank you! We’ll call you shortly with your quote.";
      statusEl.className = "form-status success";
      form.reset();
    } else {
      const msg =
        data.error ||
        "Something went wrong. Please try again or contact us below.";
      statusEl.textContent = msg;
      statusEl.className = "form-status error";
    }
  } catch {
    statusEl.textContent =
      "Network error. Check your connection or use the contact section below.";
    statusEl.className = "form-status error";
  } finally {
    submitBtn.disabled = false;
  }
});