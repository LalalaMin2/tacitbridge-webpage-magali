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
// const track = document.querySelector('.testimonial-grid');

// document.querySelector('.next').addEventListener('click', () => {
//   track.scrollBy({
//     left: 470,
//     behavior: 'smooth'
//   });
// });

// document.querySelector('.prev').addEventListener('click', () => {
//   track.scrollBy({
//     left: -470,
//     behavior: 'smooth'
//   });
// });



const track = document.querySelector(".testimonial-grid");
const slides = document.querySelectorAll(".testimonial-card");

let index = 0; // start at real first slide
const slideWidth = 570;

function update() {
  track.style.transform = `translateX(-${index * slideWidth}px)`;
}

// next
document.querySelector(".next").addEventListener("click", () => {
  index++;
  update();

  if (index === slides.length) {
    setTimeout(() => {
      track.style.transition = "none";
      index = 0;
      update();
    }, 400);

    setTimeout(() => {
      track.style.transition = "transform 0.4s ease";
    }, 450);
  }
});

// prev
document.querySelector(".prev").addEventListener("click", () => {
  index--;
  update();

  if (index === -1) {
    setTimeout(() => {
      track.style.transition = "none";
      index = slides.length - 1;
      update();
    }, 400);

    setTimeout(() => {
      track.style.transition = "transform 0.4s ease";
    }, 450);
  }
});