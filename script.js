const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const quoteForm = document.querySelector("[data-quote-form]");
const formStatus = document.querySelector("[data-form-status]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-effects-ready");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

window.addEventListener("load", () => {
  document.body.classList.add("is-loaded");
});

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.classList.toggle("nav-open", Boolean(isOpen));
});

nav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  nav.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
});

document.querySelectorAll(".reveal-stagger").forEach((group) => {
  Array.from(group.children).forEach((child, index) => {
    child.style.setProperty("--stagger-delay", `${index * 120}ms`);
  });
});

const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.classList.add("has-revealed");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12
  });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const statValueItems = document.querySelectorAll("[data-stat-value]");

const setupStatValue = (item) => {
  const value = (item.dataset.statValue || item.textContent.trim()).toUpperCase();
  const numberMatch = value.match(/^(\d+)(?:\s+([A-Z]+))?$/);

  item.setAttribute("aria-label", value);
  item.textContent = "";

  if (numberMatch) {
    const digits = numberMatch[1];
    const suffix = numberMatch[2] || "";
    const odometer = document.createElement("span");

    odometer.className = "stat-odometer";

    Array.from(digits).forEach((digit, digitIndex) => {
      const digitMask = document.createElement("span");
      const reel = document.createElement("span");
      const targetDigit = Number(digit);
      const cycles = 2;
      const endIndex = cycles * 10 + targetDigit;

      digitMask.className = "odometer-digit";
      reel.className = "odometer-reel";
      reel.dataset.endIndex = String(endIndex);
      reel.style.transitionDuration = `${4200 + digitIndex * 240}ms`;
      reel.style.transitionDelay = `${digitIndex * 180}ms`;

      for (let index = 0; index <= endIndex; index += 1) {
        const number = document.createElement("span");
        number.className = "odometer-number";
        number.textContent = String(index % 10);
        reel.appendChild(number);
      }

      digitMask.appendChild(reel);
      odometer.appendChild(digitMask);
    });

    if (suffix) {
      const suffixElement = document.createElement("span");
      suffixElement.className = "odometer-suffix";
      suffixElement.textContent = suffix;
      suffixElement.style.setProperty("--suffix-delay", `${digits.length * 180 + 720}ms`);
      odometer.appendChild(suffixElement);
    }

    item.appendChild(odometer);
    return;
  }

  const wordMask = document.createElement("span");
  const inner = document.createElement("span");

  wordMask.className = "stat-word-roll";
  inner.className = "word-roll-inner";
  inner.textContent = value;
  wordMask.appendChild(inner);
  item.appendChild(wordMask);
};

const animateStatValue = (item, tileIndex = 0) => {
  if (item.dataset.rolled === "true") return;
  item.dataset.rolled = "true";

  const delay = tileIndex * 1150;

  if (reduceMotion) {
    item.querySelectorAll(".odometer-reel").forEach((reel) => {
      reel.style.transform = `translate3d(0, -${Number(reel.dataset.endIndex) || 0}em, 0)`;
    });
    item.classList.add("is-complete");
    return;
  }

  window.setTimeout(() => {
    item.classList.add("is-rolling");

    window.requestAnimationFrame(() => {
      item.querySelectorAll(".odometer-reel").forEach((reel) => {
        reel.style.transform = `translate3d(0, -${Number(reel.dataset.endIndex) || 0}em, 0)`;
      });
    });

    window.setTimeout(() => {
      item.classList.add("is-complete");
    }, 5400);
  }, delay);
};

statValueItems.forEach(setupStatValue);

const statsSection = document.querySelector(".trust-stats");

if (statsSection && "IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statValueItems.forEach((item, index) => animateStatValue(item, index));
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.35
  });

  statsObserver.observe(statsSection);
} else {
  statValueItems.forEach((item, index) => animateStatValue(item, index));
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sectionTargets = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sectionTargets.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

    navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0.01
  });

  sectionTargets.forEach((section) => activeObserver.observe(section));
}

document.querySelectorAll(".interactive-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--cursor-x", `${x.toFixed(2)}%`);
    card.style.setProperty("--cursor-y", `${y.toFixed(2)}%`);
  });
});

const createAmbientSparks = () => {
  if (reduceMotion) return;

  const fields = document.querySelectorAll("[data-spark-field]");
  const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;

  fields.forEach((field, fieldIndex) => {
    const count = field.classList.contains("cta-spark-field")
      ? 7
      : (isSmallScreen ? 5 : 14);

    for (let index = 0; index < count; index += 1) {
      const spark = document.createElement("span");
      spark.className = "ambient-spark";

      const x = field.classList.contains("cta-spark-field")
        ? 8 + Math.random() * 84
        : Math.random() * 100;
      const y = field.classList.contains("cta-spark-field")
        ? 20 + Math.random() * 70
        : 10 + Math.random() * 86;
      const drift = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 46);
      const duration = 7200 + Math.random() * 6200;
      const delay = -(Math.random() * duration) - (fieldIndex * 600);
      const size = 1.2 + Math.random() * 1.8;
      const height = 6 + Math.random() * 16;

      spark.style.setProperty("--spark-x", `${x.toFixed(2)}%`);
      spark.style.setProperty("--spark-y", `${y.toFixed(2)}%`);
      spark.style.setProperty("--spark-drift-x", `${drift.toFixed(2)}px`);
      spark.style.setProperty("--spark-duration", `${duration.toFixed(0)}ms`);
      spark.style.setProperty("--spark-delay", `${delay.toFixed(0)}ms`);
      spark.style.setProperty("--spark-size", `${size.toFixed(2)}px`);
      spark.style.setProperty("--spark-height", `${height.toFixed(2)}px`);

      field.appendChild(spark);
    }
  });
};

createAmbientSparks();

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const submitButton = quoteForm.querySelector("button[type='submit']");
  const originalButtonText = submitButton?.textContent || "Send Quote Request";
  const formData = new FormData(quoteForm);

  if (formStatus) {
    formStatus.textContent = "";
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }

  fetch(quoteForm.action, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  })
    .then(async (response) => {
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Quote request failed.");
      }

      quoteForm.reset();

      if (formStatus) {
        formStatus.textContent = "Thanks. Your quote request has been sent. Big Blue will follow up shortly.";
      }
    })
    .catch(() => {
      if (formStatus) {
        formStatus.textContent = "Something went wrong. Please call 403-295-0909 or email bigbluewelding@gmail.com.";
      }
    })
    .finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
});
