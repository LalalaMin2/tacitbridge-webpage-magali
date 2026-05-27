const outboundLinks = document.querySelectorAll("a[href^=\"http\"][data-utm-content]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^=\"#\"]"));
const pageParams = new URLSearchParams(window.location.search);
const outboundTrackingEnabled = pageParams.get("outbound_utm") !== "off";
const outboundTracking = {
  source: pageParams.get("utm_source") || "magali_landing_page",
  medium: pageParams.get("utm_medium") || "referral",
  campaign: pageParams.get("utm_campaign") || "tbv2_copy_only_archive",
  term: pageParams.get("utm_term"),
};

if (outboundTrackingEnabled) {
  outboundLinks.forEach((link) => {
    const url = new URL(link.href);

    url.searchParams.set("utm_source", link.dataset.utmSource || outboundTracking.source);
    url.searchParams.set("utm_medium", link.dataset.utmMedium || outboundTracking.medium);
    url.searchParams.set(
      "utm_campaign",
      link.dataset.utmCampaign || outboundTracking.campaign
    );
    url.searchParams.set("utm_content", link.dataset.utmContent);

    if (link.dataset.utmTerm || outboundTracking.term) {
      url.searchParams.set("utm_term", link.dataset.utmTerm || outboundTracking.term);
    }

    link.href = url.toString();
  });
}

const navTargets = navLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    return target ? { link, target } : null;
  })
  .filter(Boolean);

if (navTargets.length) {
  const siteHeader = document.querySelector(".site-header");
  let activeFrame = null;

  const clearActiveLinks = () => {
    navLinks.forEach((link) => link.removeAttribute("aria-current"));
  };

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${id}`;

      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const targetTop = (target) => target.getBoundingClientRect().top + window.scrollY;

  const updateActiveLink = () => {
    activeFrame = null;

    const headerHeight = siteHeader ? siteHeader.getBoundingClientRect().height : 0;
    const activationOffset = headerHeight + Math.min(window.innerHeight * 0.32, 220);
    const activationY = window.scrollY + activationOffset;
    const firstTargetTop = targetTop(navTargets[0].target);

    if (activationY < firstTargetTop) {
      clearActiveLinks();
      return;
    }

    const currentTarget = navTargets.reduce((active, candidate) => {
      if (targetTop(candidate.target) <= activationY) {
        return candidate;
      }

      return active;
    }, null);

    if (currentTarget) {
      setActiveLink(currentTarget.target.id);
    } else {
      clearActiveLinks();
    }
  };

  const scheduleActiveUpdate = () => {
    if (activeFrame) return;
    activeFrame = window.requestAnimationFrame(updateActiveLink);
  };

  window.addEventListener("scroll", scheduleActiveUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveUpdate);
  window.addEventListener("load", scheduleActiveUpdate);
  scheduleActiveUpdate();
}

// testimonial carousel
const track = document.querySelector(".testimonial-grid");

function isMobile() {
  return window.innerWidth <= 760;
}

const originalSlides =
  document.querySelectorAll(".testimonial-card");

// Clone first and last
const firstClone = originalSlides[0].cloneNode(true);
const lastClone =
  originalSlides[originalSlides.length - 1].cloneNode(true);

if (!isMobile()) {
  // Add clone classes
  firstClone.classList.add("clone");
  lastClone.classList.add("clone");
  // Insert clones
  track.appendChild(firstClone);
  track.prepend(lastClone);
}

// Re-select all slides
const slides = document.querySelectorAll(".testimonial-card");

// Start on first REAL slide
let index = 1;

function getGap() {
  return parseInt(
    window.getComputedStyle(track).gap
  );
}

function getSlideWidth() {
  const gap = slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().right;
  return slides[index].getBoundingClientRect().width + getGap();
}

function update(animate = true) {
  if (isMobile()) {
    track.style.transition = "none";
    track.style.transform = "none";
    return;
  }

  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition =
      "transform 0.32s ease";
  }
  track.style.transform =
    `translateX(-${index * getSlideWidth()}px)`;
}

// Initial position
update(false);

// NEXT
function nextSlide() {
  if (index >= slides.length - 1) return;
  index++;
  update();
}

// PREV
function prevSlide() {
  if (index <= 0) return;
  index--;
  update();
}

// Buttons
document.querySelector(".next")
  .addEventListener("click", nextSlide);

document.querySelector(".prev")
  .addEventListener("click", prevSlide);


// Infinite reset logic
track.addEventListener("transitionend", () => {
  // If we're on cloned FIRST
  if (isMobile()) return;
  if (slides[index].classList.contains("clone")
      && index === slides.length - 1) {
    index = 1;
    update(false);
  }
  // If we're on cloned LAST
  if (slides[index].classList.contains("clone")
      && index === 0) {
    index = slides.length - 2;
    update(false);
  }
});

// Resize handling
window.addEventListener("resize", () => {
  if (isMobile()) {
    track.style.transition = "none";
    track.style.transform = "none";
  } else {
    update(false);
  }
});

// SWIPING

// let startX = 0;

// track.addEventListener("touchstart", e => {
//   startX = e.touches[0].clientX;
// });

// track.addEventListener("touchend", e => {

//   const endX = e.changedTouches[0].clientX;

//   const delta = startX - endX;

//   if (delta > 90) {
//     nextSlide();
//   }

//   if (delta < -90) {
//     prevSlide();
//   }
// });

var swiper = new Swiper(".testimonial-grid", {
  rewind: true
});