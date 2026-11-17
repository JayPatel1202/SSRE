const config = window.SSRE_CONFIG || {};

const form = document.getElementById("enquiry-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const billSecondWrap = document.getElementById("bill-second-wrap");
const billCurrent = document.getElementById("bill_current");
const billPrevious = document.getElementById("bill_previous");
const billPeriodRadios = form?.querySelectorAll('input[name="bill_period"]');

function getSheetEndpoint() {
  return (config.GOOGLE_SCRIPT_URL || "").trim();
}

function updateBillFields() {
  const selected = form?.querySelector('input[name="bill_period"]:checked');
  const twoMonths = selected?.value === "last_two_months";
  if (billSecondWrap) {
    billSecondWrap.classList.toggle("is-hidden", !twoMonths);
  }
  if (billPrevious) {
    billPrevious.required = Boolean(twoMonths);
    if (!twoMonths) billPrevious.value = "";
  }
}

billPeriodRadios?.forEach((radio) => {
  radio.addEventListener("change", updateBillFields);
});
updateBillFields();

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

/** Apps Script works reliably with ~8 MB per file */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function validateFiles() {
  for (const input of [billCurrent, billPrevious]) {
    if (!input?.files?.length) continue;
    const file = input.files[0];
    if (file.size > MAX_FILE_BYTES) {
      return `“${file.name}” is too large. Please use files under 8 MB.`;
    }
  }
  return null;
}

function readFileAsPayload(file) {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 =
        typeof dataUrl === "string" && dataUrl.includes(",")
          ? dataUrl.split(",")[1]
          : "";
      resolve({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        base64,
      });
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

async function buildSubmissionPayload() {
  const fd = new FormData(form);
  const gotcha = fd.get("_gotcha");
  if (gotcha) {
    return { honeypot: true };
  }

  const billPeriod = fd.get("bill_period");
  const currentFile = billCurrent?.files?.[0];
  const previousFile =
    billPeriod === "last_two_months" ? billPrevious?.files?.[0] : null;

  const [bill_current, bill_previous] = await Promise.all([
    readFileAsPayload(currentFile),
    readFileAsPayload(previousFile),
  ]);

  const payload = {
    name: String(fd.get("name") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    bill_period: billPeriod,
    solar_capacity: String(fd.get("solar_capacity") || "").trim(),
    message: String(fd.get("message") || "").trim(),
    page_url: window.location.href,
    bill_current,
    bill_previous,
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

  if (!billCurrent?.files?.length) {
    statusEl.textContent = "Please upload your current month electricity bill.";
    statusEl.className = "form-status error";
    billCurrent?.focus();
    return;
  }

  const selected = form.querySelector('input[name="bill_period"]:checked');
  if (!selected) {
    statusEl.textContent = "Please select which electricity bill period you are sharing.";
    statusEl.className = "form-status error";
    return;
  }

  if (selected.value === "last_two_months" && !billPrevious?.files?.length) {
    statusEl.textContent = "Please upload both months’ bills.";
    statusEl.className = "form-status error";
    billPrevious?.focus();
    return;
  }

  const fileError = validateFiles();
  if (fileError) {
    statusEl.textContent = fileError;
    statusEl.className = "form-status error";
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "Sending your enquiry…";
  statusEl.className = "form-status";

  try {
    const payload = await buildSubmissionPayload();
    if (payload.honeypot) {
      statusEl.textContent = "Thank you! We’ll call you shortly with your quote.";
      statusEl.className = "form-status success";
      form.reset();
      updateBillFields();
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
      updateBillFields();
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