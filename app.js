
// OutThink AI - Offline / Static Vercel API Fallback Shim
(function() {
  var origFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      return origFetch.apply(this, arguments).then(function(resp) {
        if (!resp.ok && (resp.status === 404 || resp.status === 502 || resp.status === 500)) {
          var jsonUrl = url.split('?')[0];
          if (!jsonUrl.endsWith('.json')) {
            jsonUrl = jsonUrl.replace(/\/$/, '') + '.json';
            return origFetch(jsonUrl, options).catch(function() { return resp; });
          }
        }
        return resp;
      }).catch(function(err) {
        var jsonUrl = url.split('?')[0];
        if (!jsonUrl.endsWith('.json')) {
          jsonUrl = jsonUrl.replace(/\/$/, '') + '.json';
          return origFetch(jsonUrl, options);
        }
        throw err;
      });
    }
    return origFetch.apply(this, arguments);
  };
})();

// ==========================================================================
// OutThink AI: Expert-Class Application Logic & Kinetic Interactivity
// ==========================================================================

// Copy-to-clipboard chips (token contract address in the hero, and any future
// data-copy element). The button had no handler before, so it did nothing.
function copyWithSelection(value) {
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch (e) {
    return false;
  }
}

function setupCopyButtons() {
  document.addEventListener("click", function (e) {
    const el = e.target && e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!el) return;
    const value = el.getAttribute("data-copy") || "";
    if (!value) return;
    e.preventDefault();
    const done = function () { showToast("Copied " + value, "success"); };
    const failed = function () {
      if (copyWithSelection(value)) done();
      else showToast("Copy failed. Select the text manually.", "error");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, failed);
    } else {
      failed();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupRouter();
  setupNavbarDropdowns();
  setupMobileDrawer();
  setupBottomNav();
  setupMobileDrawerAccordions();
  setupFontThemeSwitcher();
  setupThemeModeToggle();
  setupWeb3Wallet();
  setupCopyButtons();
  loadLiveStats();
  // Everything below belongs to widgets that are off-screen at first paint, so their
  // wiring is spread across frames instead of one long blocking task.
  deferSetup([
    setupAudioHaptics,
    setupPortals,
    setupCaseSubmission,
    setupAttachmentUploader,
    setupLiveArenaPlayground,
    setupCognitiveRadar,
    setupDeclassificationLens,
    setupShareCardStudio,
    setupTokenomicsSimulator,
    setupOnboardingFlow,
    setupSprintsFlow,
    setupVotedReviewsToggle,
    renderVotedReviews,
    startIdleKeepAlive
  ]);
});

// Runs initialisers in short time slices, finishing early on the first user gesture.
function deferSetup(tasks) {
  let index = 0;
  const now = () => (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now());
  function runSlice() {
    const deadline = now() + 8;
    while (index < tasks.length) {
      const task = tasks[index++];
      try {
        task();
      } catch (err) {
        console.error("Setup step failed:", err);
      }
      if (now() > deadline) break;
    }
    if (index < tasks.length) requestAnimationFrame(runSlice);
  }
  function flush() {
    while (index < tasks.length) {
      const task = tasks[index++];
      try {
        task();
      } catch (err) {
        console.error("Setup step failed:", err);
      }
    }
  }
  window.__flushOutthinkSetup = flush;
  requestAnimationFrame(runSlice);
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((evt) => {
    window.addEventListener(evt, flush, { once: true, passive: true });
  });
}

// Free hosting (Render, Railway) spins an idle instance down after ~15 minutes with no
// incoming requests, so the next visitor pays a cold start. While a tab is open we send one
// tiny health request every few minutes: it registers as live traffic, it is invisible to the
// visitor, and unlike a timed page reload it never throws away scroll position or form input.
function startIdleKeepAlive() {
  const PING_INTERVAL_MS = 4 * 60 * 1000;
  const RETRY_AFTER_FAILURE_MS = 60 * 1000;
  let timer = null;

  function ping() {
    if (typeof fetch !== "function" || document.visibilityState !== "visible") {
      schedule(PING_INTERVAL_MS);
      return;
    }
    fetch("/api/health", { method: "GET", cache: "no-store" })
      .then((res) => {
        // A sleeping instance answers nothing, so retry sooner to wake it up
        schedule(res.ok ? PING_INTERVAL_MS : RETRY_AFTER_FAILURE_MS);
      })
      .catch(() => schedule(RETRY_AFTER_FAILURE_MS));
  }

  function schedule(delay) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(ping, delay);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ping();
  });
  schedule(PING_INTERVAL_MS);
}

// Custom Non-Blocking Toast Notification Utility
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "status");

  let iconName = "benchmark";
  if (type === "success") iconName = "check";
  else if (type === "error") iconName = "alert";

  toast.innerHTML = `
    <outthink-icon name="${iconName}" size="16"></outthink-icon>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.OutThinkIcons?.upgrade) {
    window.OutThinkIcons.upgrade();
  }

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
window.showToast = showToast;

// --------------------------------------------------------------------------
// 1. Theme Design Tokens & Typography Switcher
// --------------------------------------------------------------------------
function getThemeTokens() {
  const cs = getComputedStyle(document.body);
  const getProp = (prop, fallback) => cs.getPropertyValue(prop).trim() || fallback;
  return {
    bg: getProp("--bg", "#0B0C10"),
    surface: getProp("--surface", "#14161D"),
    surface2: getProp("--surface-2", "#1E222D"),
    border: getProp("--border", "#2A2F3D"),
    text: getProp("--text", "#EDEFF5"),
    textMuted: getProp("--text-muted", "#8A90A2"),
    primary: getProp("--primary", "#9575FF"),
    primaryContrast: getProp("--primary-contrast", "#0B0C10"),
    secondary: getProp("--secondary", "#2DD4BF"),
    alert: getProp("--alert", "#FF5C7A"),
    warning: getProp("--warning", "#F59E0B"),
    success: getProp("--success", "#2DD4BF"),
    onPrimary: getProp("--on-primary", "#0B0C10"),
    onSecondary: getProp("--on-secondary", "#0B0C10"),
    onAlert: getProp("--on-alert", "#0B0C10"),
    glow: getProp("--glow", "rgba(149, 117, 255, 0.25)"),
    display: getProp("--display", "system-ui, sans-serif"),
    body: getProp("--body", "system-ui, sans-serif"),
    mono: getProp("--mono", "monospace"),
  };
}

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;
  let c = hex.slice(1);
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDynamicLogoPath(domain, colorMode) {
  let activeDomain = domain;
  if (!activeDomain) {
    try {
      activeDomain = localStorage.getItem("outthink_font_theme") ||
                     localStorage.getItem("outthink_theme") ||
                     document.documentElement.getAttribute("data-font-theme") ||
                     document.body?.getAttribute("data-font-theme") ||
                     "benchmark";
    } catch (e) {
      activeDomain = "benchmark";
    }
  }

  let effectiveMode = colorMode;
  if (!effectiveMode || effectiveMode === "system") {
    try {
      const savedMode = localStorage.getItem("outthink_color_mode") ||
                        document.documentElement.getAttribute("data-theme-mode") ||
                        "system";
      if (savedMode === "light" || savedMode === "dark") {
        effectiveMode = savedMode;
      } else {
        const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        effectiveMode = prefersLight ? "light" : "dark";
      }
    } catch (e) {
      effectiveMode = "dark";
    }
  } else if (effectiveMode !== "light" && effectiveMode !== "dark") {
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    effectiveMode = prefersLight ? "light" : "dark";
  }

  const modeKey = effectiveMode === "light" ? "light" : "dark";
  const normDomain = String(activeDomain || "").toLowerCase().trim();

  let logoFile = `logo-default-benchmark-${modeKey}.png`;
  if (normDomain.includes("med") || normDomain.includes("clin")) {
    logoFile = `logo-medicine-${modeKey}.png`;
  } else if (normDomain.includes("law") || normDomain.includes("juris") || normDomain.includes("legal")) {
    logoFile = `logo-law-${modeKey}.png`;
  } else if (normDomain.includes("soft") || normDomain.includes("system") || normDomain.includes("eng")) {
    logoFile = `logo-systems-${modeKey}.png`;
  } else if (normDomain.includes("tax") || normDomain.includes("finan") || normDomain.includes("account")) {
    logoFile = `logo-tax-financial-${modeKey}.png`;
  } else if (normDomain.includes("trade") || normDomain.includes("diag") || normDomain.includes("mech")) {
    logoFile = `logo-diagnostics-trades-${modeKey}.png`;
  }

  return `assets/${logoFile}`;
}

function updateDynamicLogoAndFavicon(domain, colorMode) {
  const logoPath = getDynamicLogoPath(domain, colorMode);

  const dynamicFav = document.getElementById("dynamicFavicon");
  if (dynamicFav) {
    dynamicFav.href = logoPath;
    dynamicFav.type = "image/png";
  }
  const dynamicFavAlt = document.getElementById("dynamicFaviconAlt");
  if (dynamicFavAlt) {
    dynamicFavAlt.href = logoPath;
    dynamicFavAlt.type = "image/png";
  }

  const logos = document.querySelectorAll("[data-dynamic-logo]");
  logos.forEach(img => {
    if (img.getAttribute("src") !== logoPath) {
      img.src = logoPath;
    }
  });

  return logoPath;
}

if (typeof window !== "undefined") {
  window.getDynamicLogoPath = getDynamicLogoPath;
  window.updateDynamicLogoAndFavicon = updateDynamicLogoAndFavicon;
}

function setupFontThemeSwitcher() {
  const pickerBtn = document.getElementById("themePickerBtn");
  const dropdown = document.getElementById("themePickerDropdown");
  const themeOpts = document.querySelectorAll(".theme-opt");
  const currentLabel = document.getElementById("activeThemeLabel");

  const savedTheme = localStorage.getItem("outthink_font_theme") || localStorage.getItem("outthink_theme") || "benchmark";
  applyFontTheme(savedTheme);

  if (pickerBtn && dropdown) {
    pickerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
      playHapticSound("click");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== pickerBtn) {
        dropdown.classList.remove("show");
      }
    });
  }

  themeOpts.forEach(opt => {
    opt.addEventListener("click", () => {
      const theme = opt.getAttribute("data-font-opt");
      applyFontTheme(theme);
      dropdown?.classList.remove("show");
      playHapticSound("success");
    });
  });

  function applyFontTheme(theme) {
    document.body.setAttribute("data-font-theme", theme);
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-font-theme", theme);
    localStorage.setItem("outthink_font_theme", theme);
    localStorage.setItem("outthink_theme", theme);

    themeOpts.forEach(o => {
      const optTheme = o.getAttribute("data-font-opt");
      const isActive = optTheme === theme ||
        (theme === "legal" && optTheme === "jurisprudence") ||
        (theme === "jurisprudence" && optTheme === "legal") ||
        (theme === "tax" && optTheme === "financial") ||
        (theme === "financial" && optTheme === "tax") ||
        (theme === "trades" && optTheme === "diagnostics") ||
        (theme === "diagnostics" && optTheme === "trades");
      o.classList.toggle("active", isActive);
      if (isActive && currentLabel) {
        currentLabel.textContent = o.querySelector("strong")?.textContent || "Benchmark";
      }
    });

    updateDynamicLogoAndFavicon(theme);

    if (typeof window.updateRadarTheme === "function") {
      window.updateRadarTheme();
    }
  }
}

function setupThemeModeToggle() {
  const toggleBtn = document.getElementById("themeModeToggleBtn");
  const drawerBtns = document.querySelectorAll(".drawer-theme-mode-btn");

  let currentMode = "system";
  try {
    currentMode = localStorage.getItem("outthink_color_mode") || "system";
  } catch (e) {}

  function applyColorMode(mode) {
    if (mode !== "light" && mode !== "dark" && mode !== "system") {
      mode = "system";
    }
    currentMode = mode;

    let effectiveMode = mode;
    if (mode === "system") {
      const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
      effectiveMode = prefersLight ? "light" : "dark";
    }

    document.documentElement.setAttribute("data-color-mode", effectiveMode);
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.body.setAttribute("data-color-mode", effectiveMode);
    document.body.setAttribute("data-theme-mode", mode);
    document.documentElement.style.colorScheme = effectiveMode;

    const metaTheme = document.getElementById("themeColorMeta");
    if (metaTheme) {
      const tokens = getThemeTokens();
      metaTheme.setAttribute("content", tokens.bg || (effectiveMode === "light" ? "#F8F9FC" : "#0B0C10"));
    }

    try {
      localStorage.setItem("outthink_color_mode", mode);
    } catch (e) {}

    // Update desktop button UI
    if (toggleBtn) {
      const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);
      toggleBtn.setAttribute("title", `Theme: ${modeLabel} (click to cycle)`);
      toggleBtn.setAttribute("aria-label", `Toggle color theme, currently ${modeLabel}`);

      let iconName = "system_theme";
      if (mode === "light") iconName = "sun";
      else if (mode === "dark") iconName = "moon";

      toggleBtn.innerHTML = `<outthink-icon name="${iconName}" size="16"></outthink-icon>`;
    }

    // Update drawer buttons UI
    drawerBtns.forEach(b => {
      const bMode = b.getAttribute("data-mode");
      b.classList.toggle("active", bMode === mode);
    });

    if (window.OutThinkIcons?.upgrade) {
      window.OutThinkIcons.upgrade();
    }

    updateDynamicLogoAndFavicon(undefined, effectiveMode);

    if (typeof window.updateRadarTheme === "function") {
      window.updateRadarTheme();
    }
  }

  // Initial apply
  applyColorMode(currentMode);

  // Desktop click listener (cycle: system -> light -> dark -> system)
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      let nextMode = "system";
      if (currentMode === "system") nextMode = "light";
      else if (currentMode === "light") nextMode = "dark";
      else if (currentMode === "dark") nextMode = "system";

      applyColorMode(nextMode);
      playHapticSound("click");
    });
  }

  // Drawer buttons listener
  drawerBtns.forEach(b => {
    b.addEventListener("click", () => {
      const targetMode = b.getAttribute("data-mode");
      if (targetMode) {
        applyColorMode(targetMode);
        playHapticSound("click");
      }
    });
  });

  // System OS preference change listener
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", () => {
      if (currentMode === "system") {
        applyColorMode("system");
      }
    });
  }
}

// --------------------------------------------------------------------------
// 2. Synthesized Web Audio Haptic Feedback (Zero External Files)
// --------------------------------------------------------------------------
let audioCtx = null;
let soundEnabled = localStorage.getItem("outthink_sound") !== "muted";

function setupAudioHaptics() {
  const toggleBtn = document.getElementById("soundToggleBtn");
  if (toggleBtn) {
    updateSoundBtnState();
    toggleBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem("outthink_sound", soundEnabled ? "on" : "muted");
      updateSoundBtnState();
      if (soundEnabled) playHapticSound("success");
    });
  }

  function updateSoundBtnState() {
    if (!toggleBtn) return;
    toggleBtn.classList.toggle("sound-on", soundEnabled);
    toggleBtn.setAttribute("title", soundEnabled ? "Mute audio haptics" : "Enable audio haptics");
    toggleBtn.innerHTML = soundEnabled 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
  }
}

function playHapticSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "pulse") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // AudioContext autoplay restrictions handled silently
  }
}

// --------------------------------------------------------------------------
// 3. SPA Route Navigation & Mobile Drawer
// --------------------------------------------------------------------------
const ROUTES = {
  "/": "view-home",
  "/submit": "view-submit",
  "/review-queue": "view-review-queue",
  "/leaderboard": "view-leaderboard",
  "/share-studio": "view-share-studio",
  "/ai-labs": "view-ai-labs",
  "/onboarding": "view-onboarding",
  "/monthly-report": "view-monthly-report",
  "/bounty-sprints": "view-bounty-sprints"
};

const ROUTE_TITLES = {
  "/": "OutThink AI: Experts vs AI",
  "/submit": "Submit an Expert Case | OutThink AI",
  "/review-queue": "Pending Expert Review Queue | OutThink AI",
  "/leaderboard": "Expert Leaderboard | OutThink AI",
  "/share-studio": "Viral Share Card Studio | OutThink AI",
  "/ai-labs": "Private Evaluation Catalog | OutThink AI",
  "/onboarding": "Expert Onboarding & Tier Verification | OutThink AI",
  "/monthly-report": "Monthly PR Benchmark Intelligence Report | OutThink AI",
  "/bounty-sprints": "Bounty Sprints & Domain Challenges | OutThink AI"
};

const MODAL_ROUTE_MAP = {
  "modal-submit": "/onboarding",
  "modal-reviews": "/review-queue",
  "modal-leaderboard": "/leaderboard",
  "modal-share": "/share-studio",
  "modal-buyer": "/ai-labs",
  "modal-onboard": "/onboarding",
  "modal-report": "/monthly-report",
  "modal-sprints": "/bounty-sprints"
};

function navigateTo(path, push = true) {
  let cleanPath = (path || "/").split("?")[0].split("#")[0] || "/";
  if (!ROUTES[cleanPath]) {
    cleanPath = "/";
  }

  // Gate /review-queue and /onboarding (and /submit) behind wallet connection
  const isWalletConnected = !!localStorage.getItem("outthink_wallet");
  if (!isWalletConnected && (cleanPath === "/review-queue" || cleanPath === "/onboarding" || cleanPath === "/submit")) {
    showToast("Please connect your Web3 wallet to access " + (cleanPath === "/review-queue" ? "the review queue" : "onboarding") + ".", "info");
    const connectBtn = document.getElementById("connectWalletBtn");
    if (connectBtn) {
      connectBtn.focus();
    }
    cleanPath = "/";
    path = "/";
  }

  const viewId = ROUTES[cleanPath];
  updateBottomNavActive(cleanPath);

  // Show target page-view and hide others, but only touch nodes whose state differs
  // (writing redundant inline styles here would force a full layout on every navigation)
  const activeBefore = document.querySelector(".page-view.active");
  const sameView = !!activeBefore && activeBefore.id === viewId;
  if (!sameView) {
    Object.values(ROUTES).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === viewId) {
        if (el.style.display !== "block") el.style.display = "block";
        if (!el.classList.contains("active")) el.classList.add("active");
      } else {
        if (el.style.display !== "none") el.style.display = "none";
        if (el.classList.contains("active")) el.classList.remove("active");
      }
    });

    // This view was display:none at boot, so its glyphs were left unbuilt on purpose
    if (window.OutThinkIcons && window.OutThinkIcons.upgrade) {
      const shown = document.getElementById(viewId);
      if (shown) window.OutThinkIcons.upgrade(shown);
    }
  }

  if (cleanPath === "/submit") resetCaseSubmitForm();
  if (cleanPath === "/onboarding") refreshOnboardingState();
  if (cleanPath === "/submit") ensureSubmitReady();

  document.title = ROUTE_TITLES[cleanPath] || "OutThink AI: Experts vs AI";

  if (push) {
    const currentFull = window.location.pathname + window.location.hash;
    if (currentFull !== path) {
      window.history.pushState({}, "", path);
    }
  }

  // Scroll position handling
  if (path && path.includes("#")) {
    const hash = path.substring(path.indexOf("#"));
    const target = document.querySelector(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  } else if (!sameView) {
    requestAnimationFrame(() => {
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  // Auto-fetch data for loaded view
  if (cleanPath === "/leaderboard") loadLeaderboard();
  else if (cleanPath === "/review-queue") loadPendingReviews();
  else if (cleanPath === "/ai-labs") loadBuyerCatalog();
  else if (cleanPath === "/monthly-report") loadMonthlyReport();
  else if (cleanPath === "/bounty-sprints") loadSprints();

  if (window.closeMobileDrawer) {
    window.closeMobileDrawer();
  }
}

function setupRouter() {
  window.OutThinkRouter = {
    navigate: navigateTo
  };

  document.addEventListener("click", (e) => {
    // Legacy data-open-modal compatibility
    const modalBtn = e.target.closest("[data-open-modal]");
    if (modalBtn) {
      e.preventDefault();
      const modalId = modalBtn.getAttribute("data-open-modal");
      const targetRoute = MODAL_ROUTE_MAP[modalId] || "/";
      navigateTo(targetRoute);
      playHapticSound("click");
      return;
    }

    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;

    if (link.target === "_blank" || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return;
    }

    if (href.startsWith("#")) {
      if (window.location.pathname !== "/") {
        e.preventDefault();
        navigateTo("/" + href);
      }
      playHapticSound("click");
    } else if (href.startsWith("/")) {
      e.preventDefault();
      navigateTo(href);
      playHapticSound("click");
    }
  });

  window.addEventListener("popstate", () => {
    navigateTo(window.location.pathname + window.location.hash, false);
  });

  // Initial render on boot
  navigateTo(window.location.pathname + window.location.hash, false);
}

function setupNavbarDropdowns() {
  const exploreContainer = document.getElementById("navDropdownExplore");
  const communityContainer = document.getElementById("navDropdownCommunity");
  const exploreBtn = document.getElementById("navBtnExplore");
  const communityBtn = document.getElementById("navBtnCommunity");
  const exploreMenu = document.getElementById("navMenuExplore");
  const communityMenu = document.getElementById("navMenuCommunity");

  if (!exploreContainer || !communityContainer) return;

  const menus = {
    explore: {
      container: exploreContainer,
      btn: exploreBtn,
      menu: exploreMenu,
      items: () => Array.from(exploreMenu?.querySelectorAll(".nav-dropdown-item") || [])
    },
    community: {
      container: communityContainer,
      btn: communityBtn,
      menu: communityMenu,
      items: () => Array.from(communityMenu?.querySelectorAll(".nav-dropdown-item") || [])
    }
  };

  let activeMenu = null; // "explore" | "community" | null
  let openTimer = null;
  let closeTimer = null;

  const OPEN_DELAY = 100; // ~80-120ms hover-intent delay
  const CLOSE_DELAY = 150; // ~150ms close grace period

  function clampPosition(menuEl) {
    if (!menuEl) return;
    menuEl.style.left = "0px";
    const rect = menuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    if (rect.right > viewportWidth - 16) {
      const overflow = rect.right - (viewportWidth - 16);
      menuEl.style.left = `${-overflow}px`;
    }
    if (rect.left < 16) {
      menuEl.style.left = `${16 - rect.left}px`;
    }
  }

  function setActiveMenu(name) {
    if (activeMenu === name) return;

    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    activeMenu = name;

    Object.keys(menus).forEach(key => {
      const entry = menus[key];
      const isOpen = key === name;
      entry.container?.classList.toggle("open", isOpen);
      entry.btn?.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen && entry.menu) {
        clampPosition(entry.menu);
      }
    });
  }

  function scheduleOpen(name) {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    // When moving pointer directly from one trigger to the other, switch immediately with zero overlap!
    if (activeMenu && activeMenu !== name) {
      setActiveMenu(name);
      return;
    }

    if (activeMenu === name) return;

    if (openTimer) clearTimeout(openTimer);
    openTimer = setTimeout(() => {
      setActiveMenu(name);
      openTimer = null;
    }, OPEN_DELAY);
  }

  function scheduleClose() {
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      setActiveMenu(null);
      closeTimer = null;
    }, CLOSE_DELAY);
  }

  // Bind trigger & menu events
  Object.keys(menus).forEach(key => {
    const entry = menus[key];

    // Hover-intent handling on container (trigger button + hover bridge + menu panel)
    entry.container?.addEventListener("mouseenter", () => {
      scheduleOpen(key);
    });

    entry.container?.addEventListener("mouseleave", () => {
      scheduleClose();
    });

    // Toggle on trigger button click
    entry.btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeMenu === key) {
        setActiveMenu(null);
      } else {
        setActiveMenu(key);
      }
    });

    // Keyboard navigation on trigger button
    entry.btn?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveMenu(key);
        const items = entry.items();
        if (items.length > 0) items[0].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveMenu(key);
        const items = entry.items();
        if (items.length > 0) items[items.length - 1].focus();
      } else if (e.key === "Escape") {
        if (activeMenu === key) {
          e.preventDefault();
          setActiveMenu(null);
        }
      }
    });

    // Keyboard navigation on menu items
    entry.menu?.addEventListener("keydown", (e) => {
      const items = entry.items();
      const currentIndex = items.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveMenu(null);
        entry.btn?.focus();
      } else if (e.key === "Tab") {
        setTimeout(() => {
          if (!entry.container?.contains(document.activeElement)) {
            setActiveMenu(null);
          }
        }, 10);
      }
    });

    entry.container?.addEventListener("focusout", (e) => {
      if (!entry.container.contains(e.relatedTarget)) {
        if (activeMenu === key) {
          setActiveMenu(null);
        }
      }
    });

    // Close when selecting an item
    entry.menu?.querySelectorAll(".nav-dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        setActiveMenu(null);
      });
    });
  });

  // Global dismiss on click outside
  document.addEventListener("pointerdown", (e) => {
    if (!exploreContainer.contains(e.target) && !communityContainer.contains(e.target)) {
      setActiveMenu(null);
    }
  });

  // Global dismiss on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeMenu) {
      const currentBtn = menus[activeMenu]?.btn;
      setActiveMenu(null);
      currentBtn?.focus();
    }
  });

  // Handle resize for clamping
  window.addEventListener("resize", () => {
    if (activeMenu && menus[activeMenu]?.menu) {
      clampPosition(menus[activeMenu].menu);
    }
  });
}

// --------------------------------------------------------------------------
// Mobile & Tablet App-Style Bottom Navigation
// --------------------------------------------------------------------------
function updateBottomNavActive(routePath) {
  document.querySelectorAll(".bottom-nav-item[data-route]").forEach((item) => {
    const active = item.getAttribute("data-route") === routePath;
    item.classList.toggle("active", active);
    if (active) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function setupBottomNav() {
  const menuBtn = document.getElementById("bottomNavMenu");
  menuBtn?.addEventListener("click", () => {
    const hamburger = document.getElementById("mobileMenuBtn");
    hamburger?.click();
  });
  updateBottomNavActive(window.location.pathname);
}

function setupMobileDrawerAccordions() {
  const exploreWrap = document.getElementById("drawerAccordionExploreWrap");
  const communityWrap = document.getElementById("drawerAccordionCommunityWrap");
  const exploreBtn = document.getElementById("drawerBtnExplore");
  const communityBtn = document.getElementById("drawerBtnCommunity");

  if (!exploreBtn || !communityBtn) return;

  function toggleAccordion(target) {
    const isExplore = target === "explore";
    const wrap = isExplore ? exploreWrap : communityWrap;
    const btn = isExplore ? exploreBtn : communityBtn;
    const otherWrap = isExplore ? communityWrap : exploreWrap;
    const otherBtn = isExplore ? communityBtn : exploreBtn;

    const willOpen = !wrap?.classList.contains("open");

    // Mutually exclusive: only one section expanded at a time
    otherWrap?.classList.remove("open");
    otherBtn?.setAttribute("aria-expanded", "false");

    wrap?.classList.toggle("open", willOpen);
    btn?.setAttribute("aria-expanded", willOpen ? "true" : "false");
    playHapticSound("click");
  }

  exploreBtn.addEventListener("click", () => toggleAccordion("explore"));
  communityBtn.addEventListener("click", () => toggleAccordion("community"));
}

function setupMobileDrawer() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const closeBtn = document.getElementById("mobileDrawerClose");

  function openDrawer() {
    drawer?.classList.add("open");
    backdrop?.classList.add("open");
    playHapticSound("click");
  }

  function closeDrawer() {
    drawer?.classList.remove("open");
    backdrop?.classList.remove("open");
  }

  menuBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", () => {
    closeDrawer();
    playHapticSound("click");
  });
  backdrop?.addEventListener("click", closeDrawer);

  drawer?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  window.closeMobileDrawer = closeDrawer;
}

function setupPortals() {
  const tabs = document.querySelectorAll(".portal-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".portal-view").forEach(v => {
        v.style.display = v.id === target ? "block" : "none";
      });
      playHapticSound("click");
    });
  });
}

// --------------------------------------------------------------------------
// 4. Live Cognitive Duel Arena Playground
// --------------------------------------------------------------------------
const BENCHMARK_CASES = [
  {
    id: "med",
    profession: "Medicine (Cardiology)",
    title: "Acute LMCA Occlusion with Hyperacute Normal Troponin",
    prompt: "58-year-old male with 45m substernal heaviness. Initial hs-cTnI is 8 ng/L (normal <14). ECG: diffuse ST depression leads I, II, aVF, V4-V6 with 1.2mm ST elevation in lead aVR. BP 98/62.",
    question: "Culprit lesion & immediate protocol?",
    rubric: [
      { text: "Identifies LMCA stenosis / circumferential ischemia", points: 3 },
      { text: "Explains troponin normal due to 45m hyperacute window", points: 2 },
      { text: "Demands immediate emergency catheterization/PCI, NOT serial delay", points: 3 }
    ],
    hash: "0x7c3f9a2eb41d0e91a45712ef0218b958c278912e"
  },
  {
    id: "law",
    profession: "Commercial Law",
    title: "Delaware vs Singapore SaaS Indemnification Conflict",
    prompt: "MSA with Delaware governing law but Singapore SICC exclusive jurisdiction. Section 9.3 contains standard liability cap waiver with 'gross negligence' carve-out under cross-border IP breach.",
    question: "Will SICC enforce uncapped indemnity for reckless breach?",
    rubric: [
      { text: "Separates lex contractus (Delaware) from procedural lex fori", points: 3 },
      { text: "Applies Abry Partners requiring intentional fraud for uncapped waiver", points: 3 },
      { text: "Concludes cap remains enforceable absent scienter", points: 2 }
    ],
    hash: "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
  },
  {
    id: "sw",
    profession: "Software Engineering",
    title: "Go sync.Pool & Finalizer Memory Resurrection",
    prompt: "High-throughput Go 1.23 network buffer recycling via sync.Pool. Buffers register runtime.SetFinalizer for telemetry. Heap grows monotonically despite clear references.",
    question: "Exact root cause of uncollectable heap graph?",
    rubric: [
      { text: "Identifies sync.Pool & SetFinalizer object resurrection cycle", points: 4 },
      { text: "Explains two-phase GC finalization delay pinning memory", points: 3 },
      { text: "Recommends explicit Release/Reset method replacement", points: 3 }
    ],
    hash: "0x3b6c90299fa51e6005d541e8dd2469a5323d190a"
  },
  {
    id: "mech",
    profession: "Trades & Diagnostics",
    title: "Ford VCT Solenoid Temperature-Dependent Oil Starvation",
    prompt: "Ford 3.5L EcoBoost with intermittent P0016 / P0012 over-retard. Timing chain stretch within factory spec; cam & crank sensor waveforms crisp.",
    question: "Culprit mechanical failure inside VCT assembly & no-tear test?",
    rubric: [
      { text: "Identifies VCT solenoid oil control micro-screen restriction", points: 4 },
      { text: "Explains hot oil viscosity drop causing hydraulic advance lag", points: 3 },
      { text: "Specifies bi-directional duty cycle vs camshaft angle lag test", points: 3 }
    ],
    hash: "0x14f92c27c86a8909df2445b8f9a5a6c58def7695"
  },
  {
    id: "tax",
    profession: "Accounting & Tax",
    title: "IRS Notice 2023-55 Crypto Staking Foreign Tax Credit Gap",
    prompt: "US citizen UK resident running validation nodes via hybrid entity. UK taxes at entitlement, US Rev. Rul. 2023-14 taxes at dominion upon unstaking.",
    question: "Interaction with IRC §904 basket limitation & timing cushions?",
    rubric: [
      { text: "Applies IRC §904 foreign branch basket timing mismatch", points: 3 },
      { text: "Applies Rev. Rul. 2023-14 dominion rule vs HMRC entitlement", points: 3 },
      { text: "Explains §904(c) 10-year carryforward resolving double taxation", points: 3 }
    ],
    hash: "0x981a7bf76a8d7c4e857440e21a22a1e297f2997c"
  }
];

function setupLiveArenaPlayground() {
  let activeCase = BENCHMARK_CASES[0];
  const chips = document.querySelectorAll(".case-chip");
  const caseTitle = document.getElementById("activeCaseTitle");
  const casePrompt = document.getElementById("activeCasePrompt");
  const caseQuestion = document.getElementById("activeCaseQuestion");
  const rubricList = document.getElementById("activeRubricList");
  const runDuelBtn = document.getElementById("runDuelBtn");
  const stampOverlay = document.getElementById("terminalStampOverlay");

  renderActiveCase();

  chips.forEach((chip, idx) => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCase = BENCHMARK_CASES[idx];
      renderActiveCase();
      resetDuelTerminal();
      playHapticSound("click");
    });
  });

  function renderActiveCase() {
    if (caseTitle) caseTitle.textContent = activeCase.title;
    if (casePrompt) casePrompt.textContent = activeCase.prompt;
    if (caseQuestion) caseQuestion.textContent = activeCase.question;

    const caseBadge = document.getElementById("activeCaseBadge");
    if (caseBadge) {
      let profKey = "medicine";
      let badgeLabel = "MEDICINE • CARDIOLOGY";
      const profLower = (activeCase.profession || "").toLowerCase();
      if (activeCase.id === "law" || profLower.includes("law")) {
        profKey = "law";
        badgeLabel = "LAW • COMMERCIAL";
      } else if (activeCase.id === "sw" || profLower.includes("software")) {
        profKey = "software";
        badgeLabel = "SOFTWARE • SYSTEMS";
      } else if (activeCase.id === "mech" || profLower.includes("trade") || profLower.includes("diag")) {
        profKey = "trades";
        badgeLabel = "TRADES • DIAGNOSTICS";
      } else if (activeCase.id === "tax" || profLower.includes("tax") || profLower.includes("accounting")) {
        profKey = "accounting";
        badgeLabel = "ACCOUNTING & TAX";
      }
      caseBadge.className = `badge-tag ${profKey}`;
      caseBadge.textContent = badgeLabel;
    }

    const caseHash = document.getElementById("activeCaseHash");
    if (caseHash && activeCase.hash) {
      caseHash.textContent = `Hash: ${activeCase.hash.slice(0, 10)}…${activeCase.hash.slice(-4)}`;
    }

    if (rubricList) {
      rubricList.innerHTML = activeCase.rubric.map(r => `
        <div class="rubric-pill" id="rubric-${r.text.slice(0, 8)}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
          <span>${r.text} (${r.points} pts)</span>
        </div>
      `).join('');
    }
  }

  function resetDuelTerminal() {
    stampOverlay?.classList.remove("active");
    const streamItems = document.querySelectorAll(".stream-model-item");
    streamItems.forEach(item => {
      item.classList.remove("wrong", "active-eval");
      item.querySelector(".stream-confidence-bar i").style.transform = "scaleX(0)";
      item.querySelector(".stream-verdict").textContent = "IDLE";
      item.querySelector(".stream-verdict").style.color = "var(--text-muted)";
    });
  }

  if (runDuelBtn) {
    runDuelBtn.addEventListener("click", async () => {
      runDuelBtn.disabled = true;
      runDuelBtn.textContent = "Cognitive Duel in Progress...";
      resetDuelTerminal();
      playHapticSound("pulse");

      const streamItems = Array.from(document.querySelectorAll(".stream-model-item"));
      
      // Determine randomized model outcomes: either 3 of 5 wrong (2 pass) or 4 of 5 wrong (1 passes)
      const wrongCount = Math.random() < 0.5 ? 3 : 4;
      const passCount = 5 - wrongCount;
      const passingIndices = [];
      while (passingIndices.length < passCount) {
        const candidate = Math.floor(Math.random() * streamItems.length);
        if (!passingIndices.includes(candidate)) {
          passingIndices.push(candidate);
        }
      }

      for (let i = 0; i < streamItems.length; i++) {
        const item = streamItems[i];
        item.classList.add("active-eval");
        playHapticSound("pulse");

        const bar = item.querySelector(".stream-confidence-bar i");
        const verdict = item.querySelector(".stream-verdict");
        
        // Progress bar simulation
        bar.style.transform = "scaleX(0.75)";
        verdict.textContent = "Analyzing Edge Rubric...";
        await new Promise(r => setTimeout(r, 450));

        const isPass = passingIndices.includes(i); 
        if (isPass) {
          bar.style.transform = "scaleX(0.95)";
          verdict.textContent = "[PASSED] (95%)";
          verdict.style.color = "var(--secondary)";
        } else {
          item.classList.add("wrong");
          bar.style.transform = "scaleX(0.28)";
          verdict.textContent = "[FAILED] (Hallucinated standard rule)";
          verdict.style.color = "var(--alert)";
        }
        item.classList.remove("active-eval");
        await new Promise(r => setTimeout(r, 150));
      }

      // Light up rubric checks
      document.querySelectorAll(".rubric-pill").forEach((pill, idx) => {
        if (idx < passCount) pill.classList.add("checked");
        else pill.classList.add("failed");
      });

      // Show Stamp Overlay
      setTimeout(() => {
        const stumpedBadge = stampOverlay?.querySelector(".stumped-badge");
        if (stumpedBadge) {
          stumpedBadge.textContent = `${wrongCount} OF 5 MODELS STUMPED`;
        }
        stampOverlay?.classList.add("active");
        playHapticSound("success");
        runDuelBtn.disabled = false;
        runDuelBtn.textContent = "Re-Run Cognitive Duel";
      }, 300);
    });
  }

  // Interactive Edge Decay Simulation (§13)
  const simEdgeDecayBtn = document.getElementById("simEdgeDecayBtn");
  if (simEdgeDecayBtn) {
    simEdgeDecayBtn.addEventListener("click", async () => {
      simEdgeDecayBtn.disabled = true;
      simEdgeDecayBtn.textContent = "Simulating Frontier AI Evaluation...";
      resetDuelTerminal();
      playHapticSound("pulse");

      const streamItems = Array.from(document.querySelectorAll(".stream-model-item"));
      for (let i = 0; i < streamItems.length; i++) {
        const item = streamItems[i];
        item.classList.add("active-eval");
        playHapticSound("pulse");

        const bar = item.querySelector(".stream-confidence-bar i");
        const verdict = item.querySelector(".stream-verdict");

        bar.style.transform = "scaleX(0.96)";
        verdict.textContent = "[PASSED] BREAKTHROUGH (96%)";
        verdict.style.color = "var(--secondary)";
        await new Promise(r => setTimeout(r, 220));
        item.classList.remove("active-eval");
      }

      document.querySelectorAll(".rubric-pill").forEach(pill => {
        pill.classList.remove("failed");
        pill.classList.add("checked");
      });

      setTimeout(() => {
        if (stampOverlay) {
          stampOverlay.classList.add("active");
          const badge = stampOverlay.querySelector(".stumped-badge");
          if (badge) badge.textContent = "EDGE DECAYED: FRONTIER MODEL SOLVED";
          const p = stampOverlay.querySelector("p");
          if (p) p.textContent = "Advanced frontier reasoning resolved this historical trap. Case retired from active leaderboard while historical $OUTTHINK rewards remain permanently secured.";
        }
        playHapticSound("success");
        simEdgeDecayBtn.disabled = false;
        simEdgeDecayBtn.innerHTML = `${(window.renderIcon ? window.renderIcon('decay', {size: 16}) : '')} Re-Test Edge Decay`;
      }, 300);
    });
  }
}

// --------------------------------------------------------------------------
// 5. Interactive Cognitive Radar / Spider Matrix
// --------------------------------------------------------------------------
function setupCognitiveRadar() {
  const canvas = document.getElementById("cognitiveRadarCanvas");
  const tooltip = document.getElementById("radarTooltip");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const size = 380;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.maxWidth = "100%";
  canvas.style.display = "block";
  ctx.scale(dpr, dpr);

  const center = size / 2;
  const radius = size * 0.38;

  const axes = [
    { label: "Medicine", ai: 0.20, human: 0.96, desc: "AI missed acute aVR elevation; delayed catheterization" },
    { label: "Law", ai: 0.20, human: 0.94, desc: "AI confused Delaware substantive law with Singapore forum" },
    { label: "Software", ai: 0.40, human: 0.92, desc: "AI blamed socket timeout; missed sync.Pool finalizer race" },
    { label: "Mechanics", ai: 0.40, human: 0.90, desc: "AI guessed timing stretch; missed hydraulic mesh screen" },
    { label: "Tax", ai: 0.40, human: 0.88, desc: "AI overlooked IRC §904(c) 10-year carryforward relief" }
  ];

  function drawRadar(hoverIdx = -1) {
    const tokens = getThemeTokens();
    ctx.clearRect(0, 0, size, size);

    // Grid circles
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach(lvl => {
      ctx.beginPath();
      for (let i = 0; i < axes.length; i++) {
        const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
        const x = center + Math.cos(angle) * (radius * lvl);
        const y = center + Math.sin(angle) * (radius * lvl);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = hexToRgba(tokens.border, 0.45);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Radial spokes
    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.strokeStyle = hexToRgba(tokens.border, 0.65);
      ctx.stroke();

      // Axis label
      const lx = center + Math.cos(angle) * (radius + 24);
      const ly = center + Math.sin(angle) * (radius + 24);
      ctx.font = `600 12px ${tokens.body || "sans-serif"}`;
      ctx.fillStyle = i === hoverIdx ? tokens.primary : tokens.textMuted;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axis.label, lx, ly);
    });

    // 1. Human Intuition Polygon (Expert Signature: --primary)
    drawPolygon(axes.map(a => a.human), hexToRgba(tokens.primary, 0.25), tokens.primary, 2.5);

    // 2. AI Model Panel Polygon (Machine AI: --secondary)
    drawPolygon(axes.map(a => a.ai), hexToRgba(tokens.secondary, 0.20), tokens.secondary, 2);

    // Draw active vertex dot
    if (hoverIdx >= 0) {
      const angle = (Math.PI * 2 / axes.length) * hoverIdx - Math.PI / 2;
      const hx = center + Math.cos(angle) * (radius * axes[hoverIdx].human);
      const hy = center + Math.sin(angle) * (radius * axes[hoverIdx].human);
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fillStyle = tokens.primary;
      ctx.fill();
      ctx.strokeStyle = tokens.surface;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawPolygon(values, fill, stroke, width) {
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
      const x = center + Math.cos(angle) * (radius * val);
      const y = center + Math.sin(angle) * (radius * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  drawRadar();
  window.updateRadarTheme = () => drawRadar(-1);

  // Hover detection
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let closestIdx = -1;
    let minDist = 38;

    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
      const x = center + Math.cos(angle) * (radius * axis.human);
      const y = center + Math.sin(angle) * (radius * axis.human);
      const dist = Math.hypot(mx - x, my - y);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });

    drawRadar(closestIdx);

    if (closestIdx >= 0 && tooltip) {
      const tokens = getThemeTokens();
      const a = axes[closestIdx];
      tooltip.innerHTML = `<strong>${a.label} Ground Truth</strong><br><span style="color:${tokens.alert}">AI Fail: ${Math.round((1 - a.ai) * 100)}%</span><br><small style="color:${tokens.textMuted}">${a.desc}</small>`;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const tooltipX = Math.min(clientX + 12, rect.width - 200);
      const tooltipY = Math.min(clientY + 12, rect.height - 80);
      tooltip.style.left = `${Math.max(8, tooltipX)}px`;
      tooltip.style.top = `${Math.max(8, tooltipY)}px`;
      tooltip.classList.add("show");
    } else {
      tooltip?.classList.remove("show");
    }
  });

  canvas.addEventListener("mouseleave", () => {
    drawRadar(-1);
    tooltip?.classList.remove("show");
  });
}

// --------------------------------------------------------------------------
// 6. Holographic Declassification Lens
// --------------------------------------------------------------------------
function setupDeclassificationLens() {
  const slider = document.getElementById("declassSlider");
  const valueLabel = document.getElementById("declassValueLabel");
  const runes = document.querySelectorAll(".rune-cipher");
  const verifyOnchainBtn = document.getElementById("verifyVaultHashBtn");
  const onchainResult = document.getElementById("vaultHashVerifyResult");

  if (slider) {
    slider.addEventListener("input", () => {
      const val = slider.value;
      if (valueLabel) valueLabel.textContent = `${val}% Public Evaluation Rubric`;
      
      const blurPx = Math.max(0, (100 - val) * 0.08);
      document.documentElement.style.setProperty("--declass-blur", `${blurPx}px`);

      runes.forEach(r => {
        r.style.filter = `blur(${blurPx}px)`;
        r.style.opacity = val > 40 ? "1" : "0.5";
      });
    });
  }

  if (verifyOnchainBtn && onchainResult) {
    verifyOnchainBtn.addEventListener("click", () => {
      playHapticSound("pulse");
      onchainResult.style.display = "block";
      onchainResult.innerHTML = `
        <span style="color:var(--text-muted)">Checking Solana RPC...</span>
      `;

      setTimeout(() => {
        playHapticSound("success");
        onchainResult.innerHTML = `
          <span style="color:var(--success);display:inline-flex;align-items:center;gap:4px">${(window.renderIcon ? window.renderIcon('check', {size: 14}) : '')} Block #1,842,912 Verified</span> • Contract: <code>0x3B6C90...190a</code> • State: <strong>TAMPER_PROOF_IMMUTABLE</strong>
        `;
      }, 400);
    });
  }
}

// --------------------------------------------------------------------------
// 7. 3D Viral Share Card Studio with Canvas Download
// --------------------------------------------------------------------------
function setupShareCardStudio() {
  const card = document.getElementById("shareCard3D");
  const canvas = document.getElementById("shareExportCanvas");
  const titleInput = document.getElementById("shareCardRoleInput");
  const modelsInput = document.getElementById("shareCardModelsInput");
  const tierSelect = document.getElementById("shareCardTierSelect");
  const badgeTitle = document.getElementById("sharePreviewBadge");
  const mainTitle = document.getElementById("sharePreviewSub");
  const downloadBtn = document.getElementById("downloadShareCardBtn");

  // Pointer 3D Perspective Tilt with Specular Sheen
  if (card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
      card.style.setProperty("--card-rx", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--card-ry", `${(y + 0.5) * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  // Interactive Live Bindings
  if (titleInput && badgeTitle) {
    titleInput.addEventListener("input", () => {
      badgeTitle.textContent = titleInput.value || "Top 1% Human Edge, Cardiology";
    });
  }

  if (modelsInput && mainTitle) {
    modelsInput.addEventListener("input", () => {
      mainTitle.textContent = `My case beat ${modelsInput.value || "4 of 5"} AI models`;
    });
  }

  // Render & Download High-Res Canvas Card
  if (downloadBtn && canvas) {
    downloadBtn.addEventListener("click", () => {
      playHapticSound("success");
      const tokens = getThemeTokens();
      const ctx = canvas.getContext("2d");
      const w = 1200;
      const h = 630;
      canvas.width = w;
      canvas.height = h;

      // High-contrast branded dark holographic palette ensures crisp exports across all theme modes
      const cardBg1 = "#0B0C10";
      const cardBg2 = "#1E222D";
      const cardBorder = "#2A2F3D";
      const cardText = "#EDEFF5";
      const cardTextMuted = "#8A90A2";
      const cardPrimary = tokens.primary || "#7E5EFF";
      const cardSecondary = tokens.secondary || "#2DD4BF";

      // Card Background Gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, cardBg1);
      grad.addColorStop(1, cardBg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Border outline
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Badge
      ctx.fillStyle = hexToRgba(cardPrimary, 0.22);
      ctx.roundRect(80, 80, 480, 50, 25);
      ctx.fill();
      ctx.fillStyle = cardPrimary;
      ctx.font = `bold 22px ${tokens.mono || "monospace"}`;
      ctx.fillText(badgeTitle?.textContent || "Top 1% Human Edge, Cardiology", 110, 114);

      // Main Text
      ctx.fillStyle = cardText;
      ctx.font = `bold 56px ${tokens.display || "sans-serif"}`;
      ctx.fillText(mainTitle?.textContent || "My case beat 4 of 5 AI models", 80, 240);

      // Subtitle
      ctx.fillStyle = cardTextMuted;
      ctx.font = `30px ${tokens.body || "sans-serif"}`;
      ctx.fillText("Verified on OutThink AI • Private Evaluation Benchmark", 80, 310);

      // Proof badge
      ctx.fillStyle = hexToRgba("#14161D", 0.85);
      ctx.roundRect(80, 440, 720, 60, 12);
      ctx.fill();
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 440, 720, 60);
      ctx.fillStyle = cardSecondary;
      ctx.font = `20px ${tokens.mono || "monospace"}`;
      ctx.fillText("Proof: content hash anchored per case • Solana", 105, 478);

      // Trigger download
      const imageURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imageURL;
      a.download = "OutThink_Human_Edge_Card.png";
      a.click();
    });
  }
}

// --------------------------------------------------------------------------
// 8. Interactive $OUTTHINK Tokenomics Epoch Rebalancer Simulator
// --------------------------------------------------------------------------
function setupTokenomicsSimulator() {
  const medSlider = document.getElementById("simMedSlider");
  const lawSlider = document.getElementById("simLawSlider");
  const sweSlider = document.getElementById("simSweSlider");

  const medPoolBar = document.getElementById("simMedBar");
  const lawPoolBar = document.getElementById("simLawBar");
  const swePoolBar = document.getElementById("simSweBar");

  function rebalance() {
    const medVal = Number(medSlider?.value || 80);
    const lawVal = Number(lawSlider?.value || 80);
    const sweVal = Number(sweSlider?.value || 60);

    const total = medVal + lawVal + sweVal;
    if (total === 0) return;

    if (medPoolBar) medPoolBar.style.width = `${(medVal / total) * 100}%`;
    if (lawPoolBar) lawPoolBar.style.width = `${(lawVal / total) * 100}%`;
    if (swePoolBar) swePoolBar.style.width = `${(sweVal / total) * 100}%`;
  }

  [medSlider, lawSlider, sweSlider].forEach(slider => {
    slider?.addEventListener("input", rebalance);
  });
}

// --------------------------------------------------------------------------
// 9. Case Submission, Live PII Checker & Data Loaders
// --------------------------------------------------------------------------
let uploadedCaseAttachments = [];

function goToView(path) {
  if (window.OutThinkRouter && window.OutThinkRouter.navigate) window.OutThinkRouter.navigate(path);
  else window.location.href = path;
}

/** An already-registered wallet goes straight to the submit form. */
async function refreshOnboardingState() {
  const stateBox = document.getElementById("onboardExistingState");
  const form = document.getElementById("expertOnboardForm");
  const walletInput = document.getElementById("onboardWallet");

  let wallet = "";
  try { wallet = localStorage.getItem("outthink_wallet") || ""; } catch (e) {}
  if (walletInput && wallet) walletInput.value = wallet;

  let token = "";
  try { token = localStorage.getItem("outthink_token") || ""; } catch (e) {}
  if (!stateBox || !form || !token) {
    if (stateBox) stateBox.style.display = "none";
    if (form) form.style.display = "";
    return;
  }

  try {
    const res = await fetch("/api/experts/me", { headers: authHeaders() });
    if (res.status === 200) {
      showToast("Wallet ini sudah terdaftar. Kamu bisa langsung submit kasus.", "success");
      goToView("/submit");
      return;
    }
  } catch (e) {}
  stateBox.style.display = "none";
  form.style.display = "";
}

/** The submit page needs a registered expert; new wallets are sent to onboarding. */
async function ensureSubmitReady() {
  let token = "";
  try { token = localStorage.getItem("outthink_token") || ""; } catch (e) {}
  if (!token) return;
  try {
    const res = await fetch("/api/experts/me", { headers: authHeaders() });
    if (res.status === 404) {
      showToast("Daftar sekali dulu, setelah itu kamu bisa submit kasus berkali-kali.", "info");
      goToView("/onboarding");
    }
  } catch (e) {}
}

/** Opening the submit page must always start clean: no leftover result panel and
    no browser-restored "test" text from an earlier visit. */
function resetCaseSubmitForm() {
  const form = document.getElementById("caseSubmitForm");
  if (form) {
    try { form.reset(); } catch (e) {}
    form.querySelectorAll("input, textarea").forEach(function (el) {
      if (el.type === "file" || el.type === "hidden") return;
      el.value = "";
    });
  }
  const statusBox = document.getElementById("submissionStatusBox");
  if (statusBox) {
    statusBox.style.display = "none";
    statusBox.innerHTML = "";
  }
  const preview = document.getElementById("attachmentListPreview");
  if (preview) preview.innerHTML = "";
  uploadedCaseAttachments = [];
  if (typeof renderAttachList === "function") {
    try { renderAttachList(); } catch (e) {}
  }
}

// Single source of truth for client-side attachment limits (no server limits exist).
const ATTACH_MAX_FILES = 5;
const ATTACH_MAX_BYTES = 10 * 1024 * 1024;
const ATTACH_ALLOWED_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "dcm", "pdf", "txt", "md", "csv", "json", "js", "ts", "py", "sol", "diff", "patch", "wav", "mp3", "zip"];

function escHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatBytes(n) {
  if (!n && n !== 0) return "";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

function fileKindIcon(fileName) {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "dcm"].includes(ext)) return "file_image";
  if (["wav", "mp3"].includes(ext)) return "file_audio";
  if (["js", "ts", "py", "sol", "diff", "patch", "json", "csv"].includes(ext)) return "file_code";
  if (["pdf", "txt", "md"].includes(ext)) return "file_text";
  return "attachment";
}

let selectedAttachFiles = [];
let attachIdSeq = 0;
let attachUploading = false;

function setAttachError(msg) {
  const errDiv = document.getElementById("attachmentError");
  const zone = document.getElementById("attachmentDropzone");
  if (errDiv) errDiv.innerHTML = msg ? `<span>${escHtml(msg)}</span>` : "";
  if (zone) zone.classList.toggle("has-error", !!msg);
}

function resetScanEncryptBtn() {
  const uploadBtn = document.getElementById("uploadAttachmentBtn");
  if (!uploadBtn) return;
  uploadBtn.disabled = false;
  uploadBtn.classList.remove("is-loading", "is-success");
  uploadBtn.innerHTML = "Scan &amp; Encrypt";
}

function renderAttachList() {
  const list = document.getElementById("attachmentListPreview");
  if (!list) return;
  const icon = (n, s) => (window.renderIcon ? window.renderIcon(n, { size: s }) : "");
  list.innerHTML = selectedAttachFiles.map(e => {
    const statusLabel = { queued: "Queued", scanning: "Scanning", encrypted: "Encrypted", failed: "Failed" }[e.status] || e.status;
    return `
    <li class="file-item" data-status="${e.status}">
      <span class="file-item-icon">${icon(fileKindIcon(e.file.name), 18)}</span>
      <span class="file-item-body">
        <span class="file-item-top">
          <span class="file-item-name" title="${escHtml(e.file.name)}">${escHtml(e.file.name)}</span>
          <span class="file-item-size">${formatBytes(e.file.size)}</span>
        </span>
        <span class="file-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${e.progress}" aria-label="Upload progress for ${escHtml(e.file.name)}"><i style="width:${e.progress}%"></i></span>
        <span class="file-item-meta">
          <span class="file-status">${statusLabel}</span>
          ${e.hash ? `<span class="file-hash">${escHtml(e.hash.slice(0, 10))}…</span>` : ""}
          ${e.status === "encrypted" ? `<span class="file-status" style="display:inline-flex;align-items:center;gap:4px">${icon(e.piiClean ? "check" : "alert", 13)} ${e.piiClean ? "Clean" : "Redacted"}</span>` : ""}
        </span>
      </span>
      <button type="button" class="file-remove" data-remove-id="${e.id}" aria-label="Remove ${escHtml(e.file.name)}">${icon("close", 14)}</button>
    </li>`;
  }).join('');
}

function addAttachFiles(files) {
  const zone = document.getElementById("attachmentDropzone");
  setAttachError("");
  const incoming = [...files];
  if (selectedAttachFiles.length + incoming.length > ATTACH_MAX_FILES) {
    setAttachError(`Too many files: max ${ATTACH_MAX_FILES} attachments per case. Remove one to add another.`);
    return;
  }
  for (const file of incoming) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ATTACH_ALLOWED_EXTS.includes(ext)) {
      setAttachError(`"${file.name}" is not an allowed type. Allowed: ${ATTACH_ALLOWED_EXTS.join(", ").toUpperCase()}.`);
      continue;
    }
    if (file.size > ATTACH_MAX_BYTES) {
      setAttachError(`"${file.name}" exceeds 10 MB. Compress the file or split it and retry.`);
      continue;
    }
    if (selectedAttachFiles.some(e => e.file.name === file.name && e.file.size === file.size)) continue;
    selectedAttachFiles.push({ id: ++attachIdSeq, file, status: "queued", progress: 0, hash: "", piiClean: true });
  }
  const fileInput = document.getElementById("caseAttachmentFileInput");
  if (fileInput && window.DataTransfer) {
    const dt = new DataTransfer();
    selectedAttachFiles.forEach(e => dt.items.add(e.file));
    fileInput.files = dt.files;
  }
  if (zone) zone.classList.remove("is-uploading");
  resetScanEncryptBtn();
  renderAttachList();
}

function removeAttachFile(id) {
  const idx = selectedAttachFiles.findIndex(e => e.id === id);
  if (idx === -1) return;
  const [entry] = selectedAttachFiles.splice(idx, 1);
  const attIdx = uploadedCaseAttachments.findIndex(a => a.fileName === entry.file.name);
  if (attIdx !== -1) uploadedCaseAttachments.splice(attIdx, 1);
  const fileInput = document.getElementById("caseAttachmentFileInput");
  if (fileInput && window.DataTransfer) {
    const dt = new DataTransfer();
    selectedAttachFiles.forEach(e => dt.items.add(e.file));
    fileInput.files = dt.files;
  }
  setAttachError("");
  resetScanEncryptBtn();
  renderAttachList();
}

function uploadAttachEntry(entry) {
  return new Promise((resolve) => {
    entry.status = "scanning";
    entry.progress = 25;
    renderAttachList();
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        entry.progress = 60;
        renderAttachList();
        const base64 = (reader.result || "").toString().split(",")[1] || "";
        const res = await signedFetch("/api/attachments/upload", {
          method: "POST",
          body: JSON.stringify({
            fileName: entry.file.name,
            mimeType: entry.file.type || "application/octet-stream",
            dataBase64: base64,
            contentSnippet: entry.file.name
          })
        });
        const data = await res.json();
        if (data.success) {
          uploadedCaseAttachments.push(data.attachment);
          entry.status = "encrypted";
          entry.progress = 100;
          entry.hash = data.attachment.contentHash || "";
          entry.piiClean = data.attachment.piiClean !== false;
          playHapticSound("success");
        } else {
          entry.status = "failed";
          setAttachError(`Upload failed for "${entry.file.name}": ${data.error || "unknown error"}.`);
        }
      } catch (err) {
        entry.status = "failed";
        setAttachError(`Upload failed for "${entry.file.name}": ${err.message}. Check your connection and retry.`);
      }
      renderAttachList();
      resolve();
    };
    reader.onerror = () => {
      entry.status = "failed";
      setAttachError(`Could not read "${entry.file.name}". The file may be locked or corrupt.`);
      renderAttachList();
      resolve();
    };
    reader.readAsDataURL(entry.file);
  });
}

function setupAttachmentUploader() {
  const fileInput = document.getElementById("caseAttachmentFileInput");
  const uploadBtn = document.getElementById("uploadAttachmentBtn");
  const zone = document.getElementById("attachmentDropzone");
  const list = document.getElementById("attachmentListPreview");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files?.length) addAttachFiles(fileInput.files);
      fileInput.value = "";
    });
  }
  if (zone) {
    ["dragenter", "dragover"].forEach(ev => zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    }));
    ["dragleave", "drop"].forEach(ev => zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");
    }));
    zone.addEventListener("drop", (e) => {
      if (e.dataTransfer?.files?.length) addAttachFiles(e.dataTransfer.files);
    });
  }
  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-id]");
      if (btn && !attachUploading) removeAttachFile(Number(btn.getAttribute("data-remove-id")));
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", async () => {
      if (attachUploading) return;
      const pending = selectedAttachFiles.filter(e => e.status === "queued" || e.status === "failed");
      if (!pending.length) {
        const msg = selectedAttachFiles.length
          ? "All files are already encrypted. Add another file or submit the case."
          : "Please select a file to attach (clinical scan, PDF, log trace, code diff).";
        setAttachError(msg);
        if (!selectedAttachFiles.length) showToast(msg, "error");
        return;
      }
      setAttachError("");
      attachUploading = true;
      playHapticSound("pulse");
      uploadBtn.disabled = true;
      uploadBtn.classList.add("is-loading");
      if (zone) zone.classList.add("is-uploading");

      let done = 0;
      for (const entry of pending) {
        if (entry.status === "failed") { entry.status = "queued"; entry.progress = 0; }
        uploadBtn.innerHTML = `Scanning PII &amp; Encrypting ${done + 1}/${pending.length}…`;
        await uploadAttachEntry(entry);
        done++;
      }

      attachUploading = false;
      uploadBtn.disabled = false;
      uploadBtn.classList.remove("is-loading");
      if (zone) zone.classList.remove("is-uploading");
      if (selectedAttachFiles.length && selectedAttachFiles.every(e => e.status === "encrypted")) {
        uploadBtn.classList.add("is-success");
        uploadBtn.innerHTML = `Encrypted`;
      } else {
        resetScanEncryptBtn();
      }
    });
  }
}

function setupCaseSubmission() {
  const form = document.getElementById("caseSubmitForm");
  const promptInput = document.getElementById("casePromptInput");
  const piiAlert = document.getElementById("piiScannerNotice");

  let timeout = null;
  if (promptInput && piiAlert) {
    promptInput.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const text = promptInput.value;
        if (!text) {
          piiAlert.style.display = "none";
          return;
        }
        const res = await fetch("/api/pii-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (data.hasPII) {
          piiAlert.style.display = "flex";
          piiAlert.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px">${(window.renderIcon ? window.renderIcon('shield', {size: 18}) : '')} <strong>PII/PHI Shield Active:</strong></span> Detected ${data.findings.map(f => f.type).join(", ")}. Will be cryptographically redacted before Solana hashing.`;
          playHapticSound("pulse");
        } else {
          piiAlert.style.display = "none";
        }
      }, 300);
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusBox = document.getElementById("submissionStatusBox");
      const submitBtn = document.getElementById("submitCaseBtn");

      submitBtn.disabled = true;
      submitBtn.textContent = "Testing against 5 AI models...";
      statusBox.style.display = "block";
      playHapticSound("pulse");

      const payload = {
        profession: document.getElementById("caseProfessionSelect").value,
        subspecialty: document.getElementById("caseSubspecialtyInput").value || "General",
        title: document.getElementById("caseTitleInput").value,
        prompt: promptInput.value,
        question: document.getElementById("caseQuestionInput").value,
        answer: document.getElementById("caseAnswerInput").value,
        explanation: document.getElementById("caseExplanationInput").value,
        attachments: uploadedCaseAttachments,
        rubric: [
          { criterion: "Key insight accurate", points: 3, mandatory: true },
          { criterion: "Avoids standard AI trap", points: 2, mandatory: true }
        ]
      };

      try {
        const res = await signedFetch("/api/cases", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.status === 409) {
          statusBox.innerHTML = `<div style="padding:16px;border-radius:14px;background:var(--surface-2);border:1px solid var(--alert);color:var(--text)"><h4 style="color:var(--alert);margin-bottom:6px">Case already submitted</h4><p>${data.error || "You already sent this case."}</p></div>`;
          playHapticSound("pulse");
          return;
        }
        if (res.status === 401) {
          statusBox.innerHTML = `<p style="color:var(--alert)">Sign in with your wallet first (connect wallet and approve the signature), then submit again.</p>`;
          return;
        }
        if (res.status === 428) {
          statusBox.innerHTML = `<p style="color:var(--alert)">Finish onboarding with this wallet before submitting a case. <a href="/onboarding">Open onboarding</a></p>`;
          return;
        }
        if (res.status === 503) {
          statusBox.innerHTML = `<p style="color:var(--alert)">${data.error || "The AI panel is not available right now."}</p>`;
          return;
        }
        if (res.status === 400) {
          statusBox.innerHTML = `<p style="color:var(--alert)">${data.error || "Please complete the case fields."}</p>`;
          return;
        }

        if (data.success && data.status === "ai_pending") {
          playHapticSound("success");
          uploadedCaseAttachments = [];
          selectedAttachFiles = [];
          const previewDiv = document.getElementById("attachmentListPreview");
          if (previewDiv) previewDiv.innerHTML = "";
          setAttachError("");
          resetScanEncryptBtn();

          const renderResult = function (record, onchainHash) {
            const tested = Number(record.models_tested_count || 0);
            const failed = Number(record.models_failed_count || 0);
            const rate = Math.round(Number(record.ai_failure_rate || 0) * 100);
            return `
            <div style="padding:18px;border-radius:14px;background:var(--surface-2);border:1px solid var(--border);color:var(--text)">
              <h4 style="color:var(--primary);margin-bottom:8px;display:inline-flex;align-items:center;gap:8px">${caseResultHeadline(record.status)}</h4>
              <p><strong>AI failure rate:</strong> ${tested ? rate + "% (" + failed + "/" + tested + " graded models wrong)" : "no model produced a gradeable answer"}</p>
              <p><strong>Status:</strong> ${String(record.status || "").toUpperCase()}</p>
              ${Number(record.stake_deposited || 0) > 0 ? `<p style="color:var(--text-muted)"><strong>Anti-spam stake:</strong> ${record.stake_deposited} $OUTTHINK locked, refunded on consensus approval</p>` : ""}
              <p style="font-family:var(--mono);font-size:12px;margin-top:6px;word-break:break-all">Content hash: ${record.content_hash}${onchainHash ? "<br>Solana tx: " + onchainHash : ""}</p>
            </div>`;
          };

          statusBox.innerHTML = `<div style="padding:16px;border-radius:14px;background:var(--surface-2);border:1px solid var(--border);color:var(--text)"><p><strong>Case stored.</strong> The five models are answering now. This usually takes one to three minutes; you can leave this page, the result is saved.</p></div>`;

          let tries = 0;
          const poll = async function () {
            tries += 1;
            try {
              const stateRes = await fetch("/api/cases/" + encodeURIComponent(data.caseId));
              const state = await stateRes.json();
              const record = state.case || state;
              if (record && record.status === "ai_failed") {
                statusBox.innerHTML = `<p style="color:var(--alert)">The models did not answer this time. The case is saved but not counted. Please try again later.</p>`;
                return;
              }
              if (record && record.status && record.status !== "ai_pending") {
                const tx = record.onchain_tx_hash ? `<a href="${explorerTxUrl(record.onchain_tx_hash)}" target="_blank" rel="noopener noreferrer">${record.onchain_tx_hash}</a>` : "";
                statusBox.innerHTML = renderResult(record, tx);
                loadLiveStats();
                loadPendingReviews();
                return;
              }
            } catch (e) {}
            if (tries < 40) setTimeout(poll, 5000);
          };
          setTimeout(poll, 4000);
        } else if (data.success) {
          statusBox.innerHTML = `<p style="color:var(--primary)">${data.message || "Request received."}</p>`;
        } else {
          statusBox.innerHTML = `<p style="color:var(--alert)">Error: ${data.error}</p>`;
        }
      } catch (err) {
        statusBox.innerHTML = `<p style="color:var(--alert)">${/wallet|signature|account/i.test(err.message) ? "Connect your wallet and approve the sign-in message first, then submit again." : "Network error: " + err.message}</p>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Run AI Panel & Submit Case";
      }
    });
  }
}

// --------------------------------------------------------------------------
// 10. Data Fetchers
// --------------------------------------------------------------------------
async function loadLiveStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    const ixRows = document.getElementById("ixRowsContainer");
    if (ixRows && data.humanEdgeIndex) {
      ixRows.innerHTML = data.humanEdgeIndex.map((item, idx) => `
        <div class="ix-row">
          <span class="ix-rank">${idx + 1}</span>
          <span style="text-transform: capitalize;">${item.profession.replace('_', ' ')}</span>
          <span class="ix-val">${item.failureRate}%</span>
          <div class="ix-bar"><i style="width: ${item.failureRate}%"></i></div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadLeaderboard() {
  const container = document.getElementById("leaderboardContainer");
  try {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    if (container && data.topExperts) {
      if (data.topExperts.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px">No ranked experts on the leaderboard yet.</p>`;
        return;
      }
      container.innerHTML = data.topExperts.map((exp, idx) => `
        <div class="review-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
          <div style="display:flex;align-items:center;gap:14px">
            <span style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--primary)">#${idx + 1}</span>
            <div>
              <h4 style="font-size:18px;margin:0">${exp.name}</h4>
              <p style="font-size:13px;color:var(--ink-3);margin:2px 0 0">
                <span class="badge-tag ${exp.profession.split('_')[0]}">${exp.subspecialty}</span>
                <span style="margin-left:6px">Tier ${exp.tier} • ${exp.country}</span>
              </p>
            </div>
          </div>
          <div style="display:flex;gap:24px;align-items:center">
            <div style="text-align:right">
              <span style="font-family:var(--display);font-size:18px;font-weight:700;color:var(--machine)">${exp.total_models_beaten}</span>
              <p style="font-size:12px;color:var(--ink-3)">Models beaten</p>
            </div>
            <div style="text-align:right">
              <span style="font-family:var(--display);font-size:18px;font-weight:700;color:var(--primary)">${exp.reputation}</span>
              <p style="font-size:12px;color:var(--ink-3)">Reputation</p>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    if (container) {
      container.innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px">
          <p style="margin-bottom:12px">Unable to load leaderboard standings at this time.</p>
          <button class="btn btn-ghost" style="font-size:13px;padding:6px 16px" onclick="loadLeaderboard()">Retry</button>
        </div>
      `;
    }
  }
}

let userReviewVotes = {};
try {
  userReviewVotes = JSON.parse(localStorage.getItem("outthink_review_votes") || "{}");
} catch (e) {}

let votedCasesCache = {};
try {
  votedCasesCache = JSON.parse(localStorage.getItem("outthink_voted_cases_cache") || "{}");
} catch (e) {}

const knownReviewCases = {};

function setupVotedReviewsToggle() {
  const toggleBtn = document.getElementById("votedReviewsToggle");
  const panel = document.getElementById("votedReviewsPanel");
  const label = document.getElementById("votedToggleLabel");
  if (!toggleBtn || !panel) return;

  if (toggleBtn.dataset.bound === "true") return;
  toggleBtn.dataset.bound = "true";

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    const nextState = !isExpanded;
    toggleBtn.setAttribute("aria-expanded", String(nextState));
    if (nextState) {
      toggleBtn.classList.add("open");
      panel.style.display = "block";
      if (label) label.textContent = "Hide";
      try {
        sessionStorage.setItem("outthink_voted_expanded", "true");
      } catch (e) {}
    } else {
      toggleBtn.classList.remove("open");
      panel.style.display = "none";
      if (label) label.textContent = "Show";
      try {
        sessionStorage.setItem("outthink_voted_expanded", "false");
      } catch (e) {}
    }
  });

  try {
    if (sessionStorage.getItem("outthink_voted_expanded") === "true") {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.classList.add("open");
      panel.style.display = "block";
      if (label) label.textContent = "Hide";
    }
  } catch (e) {}
}

function reviewVoteButtonsHtml(caseId, savedVote, containerId) {
  const boxId = containerId || `review-votes-${caseId}`;
  return `
    <div class="review-vote-actions" id="${boxId}">
      <button type="button" class="btn ${savedVote === 'valid' ? 'btn-human' : 'btn-ghost'} review-vote-btn" data-case-id="${caseId}" data-verdict="valid" aria-pressed="${savedVote === 'valid' ? 'true' : 'false'}" onclick="submitReview('${caseId}', 'valid', this)">
        <outthink-icon name="check" size="14"></outthink-icon>
        <span>Valid</span>
      </button>
      <button type="button" class="btn ${savedVote === 'ambiguous' ? 'btn-human' : 'btn-ghost'} review-vote-btn" data-case-id="${caseId}" data-verdict="ambiguous" aria-pressed="${savedVote === 'ambiguous' ? 'true' : 'false'}" onclick="submitReview('${caseId}', 'ambiguous', this)">
        <outthink-icon name="check" size="14"></outthink-icon>
        <span>Ambiguous</span>
      </button>
      <button type="button" class="btn ${savedVote === 'invalid' ? 'btn-human' : 'btn-ghost'} review-vote-btn" data-case-id="${caseId}" data-verdict="invalid" aria-pressed="${savedVote === 'invalid' ? 'true' : 'false'}" onclick="submitReview('${caseId}', 'invalid', this)">
        <outthink-icon name="check" size="14"></outthink-icon>
        <span>Invalid</span>
      </button>
    </div>`;
}

const OWN_CASE_NOTE = `<p class="review-own-case-note">This is your own case. Peer review must come from another verified wallet.</p>`;

let myExpertLookup = null;
async function getMyExpertId() {
  if (myExpertLookup) return myExpertLookup;
  myExpertLookup = (async () => {
    let token = "";
    try { token = localStorage.getItem("outthink_token") || ""; } catch (e) {}
    if (!token) return null;
    try {
      const res = await fetch("/api/experts/me", { headers: authHeaders() });
      if (res.status !== 200) return null;
      const data = await res.json();
      return data && data.expert ? data.expert.id : null;
    } catch (e) {
      return null;
    }
  })();
  return myExpertLookup;
}

window.scrollToReviewCard = function(caseId) {
  const actionsEl = document.getElementById(`review-votes-${caseId}`);
  const card = actionsEl?.closest(".review-card");
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.style.borderColor = "var(--primary)";
    card.style.boxShadow = "0 0 0 2px var(--ring)";
    setTimeout(() => {
      card.style.borderColor = "";
      card.style.boxShadow = "";
    }, 2000);
  } else {
    showToast("This case is completed or not in the active pending queue.", "info");
  }
};

function renderVotedReviews() {
  const countBadge = document.getElementById("votedCountBadge");
  const listContainer = document.getElementById("votedReviewsList");
  if (!listContainer) return;

  const votedIds = Object.keys(userReviewVotes);
  const count = votedIds.length;

  if (countBadge) {
    countBadge.textContent = count;
    countBadge.setAttribute("aria-label", `${count} voted review${count === 1 ? '' : 's'}`);
    if (count > 0) {
      countBadge.classList.add("has-votes");
    } else {
      countBadge.classList.remove("has-votes");
    }
  }

  if (count === 0) {
    listContainer.innerHTML = `
      <div class="voted-empty-state">
        <div class="voted-empty-icon-wrap">
          <outthink-icon name="review_queue" size="24"></outthink-icon>
        </div>
        <h3 class="voted-empty-title">No Voted Reviews Yet</h3>
        <p class="voted-empty-desc">When you vote on pending cases in the queue above, your review history and consensus tracking will appear here.</p>
      </div>
    `;
    if (window.OutThinkIcons?.upgrade) {
      window.OutThinkIcons.upgrade();
    }
    return;
  }

  // Backfill case details from /api/cases if any are missing
  if (votedIds.some(id => !votedCasesCache[id]?.title && !knownReviewCases[id]?.title)) {
    fetch("/api/cases")
      .then(r => r.json())
      .then(cases => {
        if (Array.isArray(cases)) {
          let updated = false;
          cases.forEach(c => {
            if (userReviewVotes[c.id]) {
              votedCasesCache[c.id] = {
                ...(votedCasesCache[c.id] || {}),
                ...c,
                verdict: userReviewVotes[c.id],
                voted_at: votedCasesCache[c.id]?.voted_at || new Date().toISOString()
              };
              updated = true;
            }
          });
          if (updated) {
            try {
              localStorage.setItem("outthink_voted_cases_cache", JSON.stringify(votedCasesCache));
            } catch (e) {}
            renderVotedReviews();
          }
        }
      })
      .catch(() => {});
  }

  listContainer.innerHTML = votedIds.map(caseId => {
    const verdict = userReviewVotes[caseId] || "valid";
    const cached = votedCasesCache[caseId] || knownReviewCases[caseId] || {};
    const title = cached.title || `Case #${caseId.slice(0, 8)}`;
    const profession = (cached.profession || "benchmark").toLowerCase();
    const profClass = profession.split('_')[0];
    const subspecialty = cached.subspecialty || "Peer Review";
    const prompt = cached.prompt || "";
    const answer = cached.answer || "";
    const aiFail = typeof cached.ai_failure_rate === 'number' ? Math.round(cached.ai_failure_rate * 100) : 80;
    const verdictLabel = verdict === 'valid' ? 'Valid' : (verdict === 'ambiguous' ? 'Ambiguous' : 'Invalid');
    const votedDate = cached.voted_at ? new Date(cached.voted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recorded';

    return `
      <div class="voted-review-card" data-case-id="${caseId}">
        <div class="voted-review-card-top">
          <div class="voted-review-meta">
            <span class="badge-tag ${profClass}">${profession.toUpperCase()} • ${subspecialty}</span>
            <span class="voted-ai-fail">AI Fail: ${aiFail}%</span>
          </div>
          <div class="voted-verdict-pill ${verdict}">
            <outthink-icon name="check" size="13"></outthink-icon>
            <span>Verdict: ${verdictLabel}</span>
          </div>
        </div>
        <h3 class="voted-review-title">${title}</h3>
        ${prompt ? `<p class="voted-review-prompt"><strong>Scenario:</strong> ${prompt}</p>` : ''}
        ${answer ? `<div class="voted-review-answer"><strong>Author Answer:</strong> ${answer}</div>` : ''}
        <div class="voted-review-footer">
          <span class="voted-timestamp">Vote recorded: ${votedDate}</span>
          <div class="voted-card-actions">
            <span class="voted-status-chip">Consensus Tracked</span>
            <button type="button" class="btn btn-ghost voted-card-jump-btn" onclick="openCaseDetail('${caseId}')">View Details</button>
            <button type="button" class="btn btn-ghost voted-card-jump-btn" onclick="scrollToReviewCard('${caseId}')">View in Queue</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.OutThinkIcons?.upgrade) {
    window.OutThinkIcons.upgrade();
  }
}

async function loadPendingReviews() {
  const container = document.getElementById("reviewsQueueContainer");
  setupVotedReviewsToggle();
  try {
    const res = await fetch("/api/reviews");
    const pendingCases = await res.json();
    if (Array.isArray(pendingCases)) {
      pendingCases.forEach(c => {
        knownReviewCases[c.id] = c;
        if (userReviewVotes[c.id]) {
          votedCasesCache[c.id] = {
            id: c.id,
            title: c.title,
            profession: c.profession,
            subspecialty: c.subspecialty,
            prompt: c.prompt,
            answer: c.answer,
            ai_failure_rate: c.ai_failure_rate,
            verdict: userReviewVotes[c.id],
            voted_at: votedCasesCache[c.id]?.voted_at || new Date().toISOString()
          };
        }
      });
      try {
        localStorage.setItem("outthink_voted_cases_cache", JSON.stringify(votedCasesCache));
      } catch (e) {}
    }
    renderVotedReviews();
    if (container) {
      if (!Array.isArray(pendingCases) || pendingCases.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px">No pending cases in review queue right now.</p>`;
        return;
      }
      const myId = await getMyExpertId();
      container.innerHTML = pendingCases.map(c => {
        const savedVote = userReviewVotes[c.id];
        const isOwnCase = !!myId && c.expert_id === myId;
        return `
        <div class="review-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="badge-tag ${c.profession.split('_')[0]}">${c.profession.toUpperCase()} • ${c.subspecialty}</span>
            ${c.is_demo ? '<span class="badge-tag" style="background:var(--surface-2);color:var(--text-muted);border:1px solid var(--border);margin-left:8px">DEMO</span>' : ''}
            <span style="font-family:var(--mono);font-size:12px;color:var(--machine)">AI Fail: ${Math.round(c.ai_failure_rate * 100)}%</span>
          </div>
          <h4 style="font-size:18px;margin-bottom:8px">${c.title}</h4>
          <p style="font-size:14px;color:var(--ink-2);margin-bottom:10px"><strong>Scenario:</strong> ${c.prompt}</p>
          <div style="background:var(--surface-2);border:1px solid var(--border);padding:12px;border-radius:10px;margin-bottom:14px;font-size:13px">
            <strong>Author Answer:</strong> ${c.answer}
          </div>
          <div class="review-vote-section">
            <div class="review-vote-head">
              <span class="review-vote-label">Your Vote</span>
              <button type="button" class="btn btn-ghost review-detail-btn" onclick="openCaseDetail('${c.id}')" aria-label="Open full case details">
                <outthink-icon name="search" size="13"></outthink-icon>
                <span>View Full Case</span>
              </button>
            </div>
            ${isOwnCase ? OWN_CASE_NOTE : reviewVoteButtonsHtml(c.id, savedVote)}
          </div>
        </div>
      `;
      }).join('');
      if (window.OutThinkIcons?.upgrade) {
        window.OutThinkIcons.upgrade();
      }
    }
  } catch (e) {
    renderVotedReviews();
    if (container) {
      container.innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px">
          <p style="margin-bottom:12px">Unable to load pending review queue at this time.</p>
          <button class="btn btn-ghost" style="font-size:13px;padding:6px 16px" onclick="loadPendingReviews()">Retry</button>
        </div>
      `;
    }
  }
}

function applyVoteState(caseId, verdict) {
  document.querySelectorAll(`.review-vote-btn[data-case-id="${caseId}"]`).forEach(b => {
    const active = b.dataset.verdict === verdict;
    b.classList.toggle("btn-human", active);
    b.classList.toggle("btn-ghost", !active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

/* The click paints the button before the server answers, so a refused vote has
   to be painted back out again instead of being left looking recorded. */
function revertOptimisticVote(caseId, previousVote, previousCacheEntry) {
  if (previousVote) userReviewVotes[caseId] = previousVote;
  else delete userReviewVotes[caseId];
  if (previousCacheEntry) votedCasesCache[caseId] = previousCacheEntry;
  else delete votedCasesCache[caseId];
  try {
    localStorage.setItem("outthink_review_votes", JSON.stringify(userReviewVotes));
    localStorage.setItem("outthink_voted_cases_cache", JSON.stringify(votedCasesCache));
  } catch (e) {}
  applyVoteState(caseId, previousVote);
  renderVotedReviews();
}

const REVIEW_ERRORS = {
  self_review: "This is your own case. A different verified wallet has to review it.",
  duplicate_review: "This wallet already reviewed this case.",
  onboarding_required: "Finish onboarding before voting on cases.",
  tier_too_low: "Verify your profession first to vote."
};

window.submitReview = async function(caseId, verdict, btn) {
  // Update every copy of this case's vote UI: queue card and detail modal.
  if (!btn && typeof document !== 'undefined') {
    btn = document.querySelector(`.review-vote-btn[data-case-id="${caseId}"][data-verdict="${verdict}"]`);
  }
  const previousVote = userReviewVotes[caseId] || null;
  const previousCacheEntry = votedCasesCache[caseId] ? { ...votedCasesCache[caseId] } : null;
  applyVoteState(caseId, verdict);

  userReviewVotes[caseId] = verdict;
  try {
    localStorage.setItem("outthink_review_votes", JSON.stringify(userReviewVotes));
  } catch (e) {}

  const c = knownReviewCases[caseId] || votedCasesCache[caseId];
  if (c) {
    votedCasesCache[caseId] = {
      id: caseId,
      title: c.title || `Case #${caseId.slice(0, 8)}`,
      profession: c.profession || "benchmark",
      subspecialty: c.subspecialty || "Peer Review",
      prompt: c.prompt || "",
      answer: c.answer || "",
      ai_failure_rate: c.ai_failure_rate ?? 0.8,
      verdict,
      voted_at: new Date().toISOString()
    };
  } else {
    votedCasesCache[caseId] = {
      id: caseId,
      title: `Case #${caseId.slice(0, 8)}`,
      profession: "benchmark",
      subspecialty: "Peer Review",
      prompt: "Evaluated practitioner benchmark case.",
      answer: "Verified by expert peer.",
      ai_failure_rate: 0.8,
      verdict,
      voted_at: new Date().toISOString()
    };
  }
  try {
    localStorage.setItem("outthink_voted_cases_cache", JSON.stringify(votedCasesCache));
  } catch (e) {}

  renderVotedReviews();

  try {
    playHapticSound("pulse");
    const res = await signedFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        verdict,
        notes: `Peer review verdict: ${verdict.toUpperCase()}`
      })
    });
    const data = await res.json();
    if (data.success) {
      playHapticSound("success");
      showToast(`Review recorded! Consensus verdict: ${data.consensus.verdict}`, "success");
      loadPendingReviews();
      loadLiveStats();
    } else {
      revertOptimisticVote(caseId, previousVote, previousCacheEntry);
      showToast(REVIEW_ERRORS[data.code] || data.error || "Review submission failed", "error");
    }
  } catch (e) {
    revertOptimisticVote(caseId, previousVote, previousCacheEntry);
    showToast("Network error submitting review", "error");
  }
};

// --------------------------------------------------------------------------
// 9c. Case detail modal (full case read-out from /api/cases/:id)
// --------------------------------------------------------------------------
const caseDetailState = { id: null };

function caseStatusLabel(status) {
  const map = {
    submitted: "Submitted",
    ai_pending: "AI panel running",
    ai_tested: "Panel finished",
    in_review: "In peer review",
    accepted: "Accepted",
    rejected: "Rejected",
    ai_failed: "AI panel failed"
  };
  return map[status] || String(status || "submitted").replace(/_/g, " ");
}

/** Headline for the submit result card. Must follow the stored status: a case is
 *  only "accepted" after peer review, never right after the AI panel. */
function caseResultHeadline(status) {
  const s = String(status || "").toLowerCase();
  if (s === "accepted") return "Case accepted";
  if (s === "in_review") return "Case submitted (in peer review)";
  if (s === "rejected") return "Case rejected by peer review";
  if (s === "ai_tested") return "Case submitted (panel finished)";
  if (s === "ai_failed") return "Case saved (panel could not grade it)";
  return "Case submitted";
}

function renderCaseDetail(data) {
  const c = (data && data.case) || {};
  const aiResults = Array.isArray(data && data.aiResults) ? data.aiResults : [];
  const reviews = Array.isArray(data && data.reviews) ? data.reviews : [];
  const id = String(c.id || "");
  const profession = String(c.profession || "benchmark").toLowerCase();
  const profClass = profession.split("_")[0];
  const failPct = Math.round((Number(c.ai_failure_rate) || 0) * 100);
  const tested = Number(c.models_tested_count) || aiResults.length;
  const failed = Number(c.models_failed_count) || aiResults.filter(r => !r.graded_correct).length;
  const savedVote = userReviewVotes[id];
  const validCount = reviews.filter(r => r.verdict === "valid").length;
  const ambiguousCount = reviews.filter(r => r.verdict === "ambiguous").length;
  const invalidCount = reviews.filter(r => r.verdict === "invalid").length;
  const submittedAt = c.created_at
    ? new Date(c.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Not recorded";
  const stake = Number(c.stake_deposited) || 0;

  const metaItem = (label, value) => `
    <div class="case-detail-meta-item">
      <span class="case-detail-meta-label">${label}</span>
      <span class="case-detail-meta-value">${value}</span>
    </div>`;

  const section = (title, body, extraClass = "") => body
    ? `<div class="case-detail-section ${extraClass}"><h4>${title}</h4>${body}</div>`
    : "";

  const aiRows = aiResults.length
    ? `<div class="case-detail-list">${aiResults.map(r => `
        <div class="ai-row">
          <div class="ai-row-main">
            <div class="ai-row-name">${escHtml(r.model_name || "Model")}</div>
            ${r.grader_notes ? `<p class="ai-row-notes">${escHtml(r.grader_notes)}</p>` : ""}
          </div>
          <span class="ai-chip ${r.graded_correct ? "correct" : "wrong"}">${r.graded_correct ? "Correct" : "Wrong"}</span>
        </div>`).join("")}</div>`
    : `<p class="case-detail-muted">No model results recorded for this case yet.</p>`;

  const reviewRows = reviews.length
    ? `<div class="case-detail-list">${reviews.map(r => `
        <div class="ai-row">
          <div class="ai-row-main">
            <div class="ai-row-name">${escHtml(r.reviewer_name || "Peer reviewer")}</div>
            <p class="ai-row-notes">${escHtml(String(r.reviewer_profession || "expert").replace(/_/g, " "))}${r.reviewer_tier ? ` &middot; Tier ${escHtml(String(r.reviewer_tier))}` : ""}</p>
          </div>
          <span class="ai-chip ${r.verdict === "valid" ? "correct" : (r.verdict === "invalid" ? "wrong" : "neutral")}">${escHtml(String(r.verdict || "pending"))}</span>
        </div>`).join("")}</div>`
    : `<p class="case-detail-muted">No peer reviews yet. ${validCount} valid vote${validCount === 1 ? "" : "s"} of the 2 required were recorded.</p>`;

  const myWallet = (() => {
    try { return String(localStorage.getItem("outthink_wallet") || "").toLowerCase(); } catch (e) { return ""; }
  })();
  const isOwnCase = !!myWallet && String(c.author_wallet || "").toLowerCase() === myWallet;
  const voteBlock = c.status !== "in_review" ? `
    <p class="case-detail-hint" style="margin-top:18px">Voting is closed because this case is ${escHtml(caseStatusLabel(c.status).toLowerCase())}, not in peer review.</p>` : isOwnCase ? `
    <div class="review-vote-section case-detail-vote">
      <span class="review-vote-label">Your Vote</span>
      ${OWN_CASE_NOTE}
    </div>` : `
    <div class="review-vote-section case-detail-vote">
      <span class="review-vote-label">Your Vote</span>
      ${reviewVoteButtonsHtml(id, savedVote, `review-votes-modal-${id}`)}
      <p class="case-detail-hint">Your vote here is the same vote as on the card behind this window. Two valid votes from different wallets move the case to Accepted.</p>
    </div>`;

  // No anchor row at all until a real transaction exists: a "pending" label in
  // the result reads like an error to the reader.
  const onchain = c.onchain_tx_hash
    ? `<div class="case-detail-integrity-row">
        <span class="case-detail-meta-label">On-chain anchor</span>
        <span class="case-detail-hash">${escHtml(c.onchain_tx_hash)}</span>
      </div>`
    : "";

  return `
    <div class="case-detail-head">
      <span class="badge-tag ${escHtml(profClass)}">${escHtml(profession.toUpperCase())} &bull; ${escHtml(c.subspecialty || "General")}</span>
      <span class="case-detail-status">${escHtml(caseStatusLabel(c.status))}</span>
      <span class="case-detail-fail">AI Fail: ${failPct}%</span>
    </div>
    <h2 class="case-detail-title" id="caseDetailTitle">${escHtml(c.title || "Untitled case")}</h2>
    <p class="case-detail-sub">${failed} of ${tested} models answered incorrectly on this case.</p>

    <div class="case-detail-meta">
      ${metaItem("Author", escHtml(c.author_name || "Verified expert") + (c.author_tier ? ` <span class="case-detail-tier">Tier ${escHtml(String(c.author_tier))}</span>` : ""))}
      ${metaItem("Country", escHtml(c.author_country || "Not recorded"))}
      ${metaItem("Submitted", escHtml(submittedAt))}
      ${metaItem("AI Panel", `${tested} models tested`)}
      ${metaItem("Author Stake", stake > 0 ? `${stake} $OUTTHINK` : "No stake recorded")}
      ${metaItem("Peer Reviews", `${validCount} valid &middot; ${ambiguousCount} ambiguous &middot; ${invalidCount} invalid`)}
    </div>

    ${section("Scenario", `<p class="case-detail-body-text">${escHtml(c.prompt || "No scenario recorded.")}</p>`)}
    ${section("Core Question for the AI Panel", c.question ? `<p class="case-detail-body-text">${escHtml(c.question)}</p>` : "")}
    ${section("Expert Answer", `<div class="case-detail-answer"><p class="case-detail-body-text">${escHtml(c.answer || "No answer recorded.")}</p></div>`)}
    ${section("Why Standard Models Fail", c.explanation ? `<p class="case-detail-body-text">${escHtml(c.explanation)}</p>` : "")}
    ${section("AI Panel Results", aiRows)}
    ${section("Peer Reviews", reviewRows)}
    ${section("Integrity", `
      <div class="case-detail-integrity">
        <div class="case-detail-integrity-row">
          <span class="case-detail-meta-label">Content hash</span>
          <span class="case-detail-hash">${escHtml(c.content_hash || "Not recorded")}</span>
        </div>
        ${onchain}
      </div>`)}

    ${voteBlock}

    <div class="case-detail-foot">
      <span class="case-detail-muted">Case ID <span class="case-detail-hash">${escHtml(id)}</span></span>
      <button type="button" class="btn btn-ghost" onclick="closeCaseDetail()">Close</button>
    </div>
  `;
}

window.openCaseDetail = function(caseId) {
  const overlay = document.getElementById("caseDetailOverlay");
  const body = document.getElementById("caseDetailBody");
  if (!overlay || !body || !caseId) return;
  caseDetailState.id = caseId;
  body.innerHTML = `<div class="case-detail-loading">Loading case details\u2026</div>`;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-scroll-lock");
  const closeBtn = document.getElementById("caseDetailClose");
  if (closeBtn) closeBtn.focus();

  fetch(`/api/cases/${encodeURIComponent(caseId)}`)
    .then(res => res.ok
      ? res.json()
      : Promise.reject(new Error(res.status === 404 ? "This case is no longer available." : "Could not load this case right now.")))
    .then(data => {
      if (caseDetailState.id !== caseId) return;
      body.innerHTML = renderCaseDetail(data);
      if (window.OutThinkIcons?.upgrade) window.OutThinkIcons.upgrade();
    })
    .catch(err => {
      if (caseDetailState.id !== caseId) return;
      body.innerHTML = `
        <div class="case-detail-error">
          <p>${escHtml(err.message || "Could not load this case right now.")}</p>
          <button type="button" class="btn btn-ghost" onclick="closeCaseDetail()">Close</button>
        </div>`;
    });
};

window.closeCaseDetail = function() {
  const overlay = document.getElementById("caseDetailOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-scroll-lock");
  caseDetailState.id = null;
};

(function bindCaseDetailModal() {
  const overlay = document.getElementById("caseDetailOverlay");
  if (!overlay) return;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCaseDetail();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeCaseDetail();
  });
})();

// --------------------------------------------------------------------------
// 10. AI Labs & Private Buyer Evaluation Catalog (§11)
// --------------------------------------------------------------------------
function getCatalogProfessionMeta(profession) {
  const norm = (profession || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (norm.includes("med")) return { icon: "medicine", label: "Medicine", sublabel: "Clinical diagnosis & lab trap benchmark" };
  if (norm.includes("law")) return { icon: "law", label: "Jurisprudence", sublabel: "Cross-border litigation & statutory analysis" };
  if (norm.includes("soft") || norm.includes("eng")) return { icon: "software", label: "Systems & Software", sublabel: "Distributed systems & kernel debugging" };
  if (norm.includes("trade") || norm.includes("mech")) return { icon: "trades", label: "Diagnostics & Trades", sublabel: "Electromechanical diagnostics & field traps" };
  if (norm.includes("tax") || norm.includes("account")) return { icon: "tax", label: "Financial & Tax", sublabel: "Entity structuring & multi-jurisdiction tax" };
  return { icon: "benchmark", label: (profession || "").replace(/_/g, " ").toUpperCase(), sublabel: "Domain benchmark evaluation dataset" };
}

async function loadBuyerCatalog() {
  const catalogGrid = document.getElementById("buyerCatalogGrid");
  try {
    const res = await fetch("/api/buyers/catalog");
    const data = await res.json();
    if (catalogGrid && data.catalog) {
      if (data.catalog.length === 0) {
        catalogGrid.innerHTML = `
          <div style="grid-column:1/-1;padding:48px 24px;text-align:center;color:var(--text-muted);background:var(--surface-2);border:1px dashed var(--border);border-radius:16px">
            <h3 style="font-size:18px;margin-bottom:8px;color:var(--text)">No Evaluation Datasets Available Yet</h3>
            <p style="font-size:14px;max-width:440px;margin:0 auto 16px;color:var(--text-muted)">Datasets populate automatically as expert cases reach consensus and complete model benchmark runs.</p>
            <a href="/onboarding" class="btn btn-primary" style="display:inline-flex">Submit an Evaluation Case</a>
          </div>
        `;
        return;
      }
      catalogGrid.innerHTML = data.catalog.map(cat => {
        const meta = getCatalogProfessionMeta(cat.profession);
        const failRate = Math.round((cat.avg_difficulty || 0.7) * 100);
        return `
        <div class="panel catalog-panel">
          <div class="catalog-panel-top">
            <span class="catalog-domain-badge badge-tag">
              <outthink-icon name="${meta.icon}" size="14"></outthink-icon>
              <span>${escHtml(meta.label)}</span>
            </span>
            <span class="catalog-security-badge" title="Cryptographically watermarked per licensee">
              <outthink-icon name="shield" size="12"></outthink-icon>
              <span>HMAC SHA-256</span>
            </span>
          </div>

          <div class="catalog-panel-header">
            <h3 class="catalog-panel-title">${cat.case_count} <span class="catalog-title-unit">Verified Cases</span></h3>
            <p class="catalog-panel-desc">${escHtml(meta.sublabel)}</p>
          </div>

          <div class="catalog-metrics-grid">
            <div class="catalog-metric-card">
              <span class="catalog-metric-label">AI Failure Rate</span>
              <span class="catalog-metric-val">${failRate}%</span>
              <div class="catalog-metric-bar" role="progressbar" aria-valuenow="${failRate}" aria-valuemin="0" aria-valuemax="100" aria-label="AI Failure Rate: ${failRate}%">
                <div class="catalog-metric-fill" style="width:${failRate}%"></div>
              </div>
            </div>
            <div class="catalog-metric-card">
              <span class="catalog-metric-label">Specialties</span>
              <span class="catalog-metric-val">${cat.subspecialties_count} <span class="catalog-metric-sub">Tracks</span></span>
              <span class="catalog-metric-pill">Peer Consensus</span>
            </div>
          </div>

          <div class="catalog-panel-footnote">
            <outthink-icon name="verify" size="13"></outthink-icon>
            <span>Unique cryptographic fingerprint per licensee</span>
          </div>

          <div class="catalog-panel-footer">
            <button type="button" class="btn btn-human catalog-action-btn" onclick="requestLicense('${escHtml(cat.profession)}')">
              <outthink-icon name="download" size="14"></outthink-icon>
              <span>License &amp; Download Set</span>
            </button>
          </div>
        </div>
      `;
      }).join('');
      if (window.OutThinkIcons?.upgrade) {
        window.OutThinkIcons.upgrade();
      }
    }
  } catch (e) {
    if (catalogGrid) {
      catalogGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px">
          <p style="margin-bottom:12px">Unable to load evaluation catalog at this time.</p>
          <button class="btn btn-ghost" style="font-size:13px;padding:6px 16px" onclick="loadBuyerCatalog()">Retry</button>
        </div>
      `;
    }
  }
}

window.requestLicense = async function(profession) {
  const org = "Anthropic Frontier Eval";
  try {
    playHapticSound("pulse");
    showToast(`Generating watermarked license for ${org}...`, "info");
    const res = await fetch("/api/buyers/license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org,
        email: "eval-lead@" + org.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
        profession
      })
    });
    const data = await res.json();
    if (data.success && data.status === "request_received") {
      playHapticSound("success");
      showToast("Access request received. Our team reviews it before any dataset is released.", "success");
    } else if (data.success) {
      const exportJson = JSON.stringify(data.license, null, 2);
      const blob = new Blob([exportJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OutThink_${profession}_watermarked_dataset.json`;
      a.click();
      showToast(`License issued for ${org}! Watermarked dataset exported.`, "success");
    } else {
      showToast(data.error || "Licence request failed.", "error");
    }
  } catch (e) {
    showToast("Failed to request license. Please try again.", "error");
  }
};

// --------------------------------------------------------------------------
// 11. Expert Onboarding & Multi-Tier Verification Flow (§5 & §6)
// --------------------------------------------------------------------------
function setupOnboardingFlow() {
  const form = document.getElementById("expertOnboardForm");
  const tierSelect = document.getElementById("onboardTierSelect");
  const tier1Fields = document.getElementById("tier1Fields");
  const tier2Fields = document.getElementById("tier2Fields");
  const statusBox = document.getElementById("onboardStatusBox");
  const submitBtn = document.getElementById("onboardSubmitBtn");

  const card0 = document.getElementById("tierCard0");
  const card1 = document.getElementById("tierCard1");
  const card2 = document.getElementById("tierCard2");

  const step1 = document.getElementById("stepperStep1");
  const step2 = document.getElementById("stepperStep2");

  function setStepperStep(num) {
    if (!step1 || !step2) return;
    if (num === 1) {
      step1.classList.add("active");
      step1.classList.remove("done");
      step1.setAttribute("aria-current", "step");
      step2.classList.remove("active");
      step2.removeAttribute("aria-current");
    } else if (num === 2) {
      step1.classList.remove("active");
      step1.classList.add("done");
      step1.removeAttribute("aria-current");
      step2.classList.add("active");
      step2.setAttribute("aria-current", "step");
    }
  }

  function updateTierSelection() {
    const val = Number(tierSelect?.value || 0);
    if (tier1Fields) tier1Fields.style.display = val === 1 ? "block" : "none";
    if (tier2Fields) tier2Fields.style.display = val === 2 ? "block" : "none";

    [card0, card1, card2].forEach((c, idx) => {
      if (c) c.style.opacity = idx === val ? "1" : "0.5";
    });
  }

  tierSelect?.addEventListener("change", () => {
    updateTierSelection();
    setStepperStep(1);
  });
  tierSelect?.addEventListener("focus", () => setStepperStep(1));
  updateTierSelection();

  [card0, card1, card2].forEach((c, idx) => {
    if (c) {
      c.style.cursor = "pointer";
      c.addEventListener("click", () => {
        if (tierSelect) {
          tierSelect.value = String(idx);
          updateTierSelection();
          setStepperStep(1);
        }
      });
    }
  });

  [
    "onboardName", "onboardWallet", "onboardEmail", "onboardProfession", 
    "onboardSubspecialty", "onboardCountry", "onboardLinkedIn", "onboardLicense", "onboardIssuingBody"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("focus", () => setStepperStep(1));
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      playHapticSound("pulse");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Anchoring on Solana...";
      }

      const tier = Number(tierSelect.value || 0);
      let verificationSource = "";
      if (tier === 1) {
        const link = document.getElementById("onboardLinkedIn")?.value;
        verificationSource = link || document.getElementById("onboardEmail")?.value;
      } else if (tier === 2) {
        const lic = document.getElementById("onboardLicense")?.value;
        const body = document.getElementById("onboardIssuingBody")?.value;
        verificationSource = `license:${lic}:${body}`;
      }

      const payload = {
        name: document.getElementById("onboardName").value,
        email: document.getElementById("onboardEmail").value,
        profession: document.getElementById("onboardProfession").value,
        subspecialty: document.getElementById("onboardSubspecialty").value,
        country: document.getElementById("onboardCountry").value || "US",
        license_number: document.getElementById("onboardLicense")?.value || null,
        verification_source: verificationSource || null
      };

      try {
        const res = await signedFetch("/api/experts/onboard", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          playHapticSound("success");
          setStepperStep(2);
          localStorage.setItem("outthink_expert_id", data.expertId);
          localStorage.setItem("outthink_expert_tier", data.tier);
          showToast("Registration complete! Welcome to the Arena.", "success");
          if (statusBox) {
            statusBox.style.display = "block";
            statusBox.innerHTML = `
              <div style="padding:16px;border-radius:14px;background:var(--surface-2);border:1px solid var(--border);color:var(--text)">
                <h4 style="color:var(--primary);margin-bottom:6px;display:inline-flex;align-items:center;gap:8px">${(window.renderIcon ? window.renderIcon('check', {size: 18}) : '')} Welcome to the Arena, Verified Expert!</h4>
                <p style="font-size:14px">Tier: <strong>Tier ${data.tier}</strong> (${data.tier === 2 ? '2.5x' : data.tier === 1 ? '1.5x' : '1.0x'} Mining Multiplier)</p>
                <p style="font-size:13px;color:var(--text-muted);margin:6px 0">Earned Badges: ${data.badges.map(b => `<span style="background:var(--surface);border:1px solid var(--border);color:var(--text);padding:2px 8px;border-radius:6px;margin-right:4px">${b}</span>`).join('')}</p>
                <p style="font-family:var(--mono);font-size:11px;color:var(--text-muted);margin-top:6px">Expert ID: ${data.expertId}</p>
              </div>
            `;
          }
          loadLeaderboard();
          if (window.OutThinkRouter) {
            window.OutThinkRouter.navigate("/submit");
          } else {
            window.location.href = "/submit";
          }
        } else {
          if (statusBox) {
            statusBox.style.display = "block";
            const friendly = data.code === "wallet_taken"
              ? "This wallet is already registered. Go straight to the submit page, or connect the wallet you registered with."
              : data.error || "Registration failed";
            statusBox.innerHTML = `<p style="color:var(--alert)">${friendly}</p>`;
            if (data.code === "wallet_taken") refreshOnboardingState();
          }
        }
      } catch (err) {
        if (statusBox) {
          statusBox.style.display = "block";
          statusBox.innerHTML = `<p style="color:var(--alert)">${/wallet|signature|account/i.test(err.message) ? "Approve the sign-in message in your wallet first, then complete registration again." : "Network error: " + err.message}</p>`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Complete Registration & Join Arena";
        }
      }
    });
  }
}

// --------------------------------------------------------------------------
// 12. Monthly PR Benchmark Intelligence Report (§7)
// --------------------------------------------------------------------------
let cachedMonthlyReport = null;

async function loadMonthlyReport() {
  const metricsGrid = document.getElementById("reportMetricsGrid");
  const archetypesList = document.getElementById("reportArchetypesList");
  try {
    const res = await fetch("/api/reports/monthly");
    const report = await res.json();
    cachedMonthlyReport = report;

    const titleEl = document.getElementById("reportModalTitle");
    const headlineEl = document.getElementById("reportModalHeadline");
    const execSummary = document.getElementById("reportExecSummary");

    if (titleEl) titleEl.textContent = report.title;
    if (headlineEl) headlineEl.textContent = report.headline;
    if (execSummary) execSummary.textContent = report.executiveSummary;

    if (metricsGrid && report.metrics) {
      metricsGrid.innerHTML = `
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
          <span style="font-family:var(--display);font-size:26px;color:var(--primary);font-weight:700">${report.metrics.overallAiFailureRate}%</span>
          <p style="font-size:12px;color:var(--ink-3);margin-top:4px">Overall AI Failure Rate</p>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
          <span style="font-family:var(--display);font-size:26px;color:var(--machine);font-weight:700">${report.metrics.verifiedCasesCount}</span>
          <p style="font-size:12px;color:var(--ink-3);margin-top:4px">Verified Ground Truth Cases</p>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
          <span style="font-family:var(--display);font-size:26px;color:var(--ink);font-weight:700">${report.metrics.verifiedExpertCount}</span>
          <p style="font-size:12px;color:var(--ink-3);margin-top:4px">Licensed Practitioners</p>
        </div>
      `;
    }

    if (archetypesList && report.failureArchetypes) {
      archetypesList.innerHTML = report.failureArchetypes.map(a => `
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="color:var(--ink);font-size:15px">${a.category}</strong>
            <span style="font-family:var(--mono);font-size:12px;color:var(--primary);font-weight:600">${a.prevalence}</span>
          </div>
          <p style="font-size:13px;color:var(--ink-2);margin-bottom:6px">${a.description}</p>
          <small style="font-size:12px;color:var(--machine)"><strong>Root Cause:</strong> ${a.whyAiFailed}</small>
        </div>
      `).join('');
    }

    const copyBtn = document.getElementById("copyPressReleaseBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        playHapticSound("success");
        const releaseText = `PRESS RELEASE: OUTTHINK BENCHMARK (${report.month})\n\n${report.headline}\n\n${report.executiveSummary}\n\nTop AI Failure Rate: ${report.metrics.overallAiFailureRate}% across ${report.metrics.verifiedCasesCount} verified edge cases.\n\nLearn more: https://outthink.up.railway.app`;
        navigator.clipboard?.writeText(releaseText);
        showToast("Press release summary copied to clipboard!", "success");
      });
    }

    const downloadBtn = document.getElementById("downloadReportJsonBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        playHapticSound("success");
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OutThink_Public_Report_${report.month.replace(" ", "_")}.json`;
        a.click();
      });
    }
  } catch (e) {
    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px">
          <p style="margin-bottom:12px">Unable to load monthly intelligence report at this time.</p>
          <button class="btn btn-ghost" style="font-size:13px;padding:6px 16px" onclick="loadMonthlyReport()">Retry</button>
        </div>
      `;
    }
  }
}

// --------------------------------------------------------------------------
// 13. Bounty Sprints & Custom Eval Challenges (§9 & §13)
// --------------------------------------------------------------------------
async function loadSprints() {
  const container = document.getElementById("sprintsContainer");
  try {
    const res = await fetch("/api/sprints");
    const sprints = await res.json();
    if (container && Array.isArray(sprints)) {
      if (sprints.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:24px">No active custom eval sprints at this moment.</p>`;
        return;
      }
      container.innerHTML = sprints.map(s => `
        <div class="panel" style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="badge-tag ${s.target_profession?.split('_')[0] || 'medicine'}">${(s.target_profession || 'Medicine').toUpperCase()}</span>
            <span style="font-size:12px;color:var(--success, var(--secondary));font-weight:700">ACTIVE BOUNTY</span>
          </div>
          <h4 style="font-size:18px;margin:0">${s.title}</h4>
          <p style="font-size:13px;color:var(--ink-2)">Sponsor: <strong>${s.sponsor_name}</strong> • Domain: ${s.domain}</p>
          <div style="display:flex;gap:16px;background:var(--surface-2);border:1px solid var(--border);padding:12px;border-radius:12px;margin-top:auto">
            <div>
              <span style="font-family:var(--display);font-size:18px;font-weight:700;color:var(--primary)">${(s.prize_pool_edge || 0).toLocaleString()}</span>
              <p style="font-size:11px;color:var(--ink-3)">$OUTTHINK Pool</p>
            </div>
            <div>
              <span style="font-family:var(--display);font-size:18px;font-weight:700;color:var(--machine)">$${(s.prize_pool_usdc || 0).toLocaleString()}</span>
              <p style="font-size:11px;color:var(--ink-3)">USDC Pool</p>
            </div>
          </div>
          <button class="btn btn-human" style="min-height:38px;font-size:13px" onclick="window.OutThinkRouter ? window.OutThinkRouter.navigate('/onboarding') : window.location.href='/onboarding'">Submit Case to Sprint</button>
        </div>
      `).join('');
    }
  } catch (e) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px">
          <p style="margin-bottom:12px">Unable to load active bounty sprints at this time.</p>
          <button class="btn btn-ghost" style="font-size:13px;padding:6px 16px" onclick="loadSprints()">Retry</button>
        </div>
      `;
    }
  }
}

function setupSprintsFlow() {
  const form = document.getElementById("createSprintForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      playHapticSound("pulse");

      const payload = {
        sponsor_name: document.getElementById("sprintSponsorName").value,
        title: document.getElementById("sprintTitle").value,
        domain: document.getElementById("sprintDomain").value,
        target_profession: document.getElementById("sprintProfession").value,
        prize_pool_edge: Number(document.getElementById("sprintPrizeEdge").value || 100000),
        prize_pool_usdc: Number(document.getElementById("sprintPrizeUsdc").value || 15000),
        deadline: "2026-12-31"
      };

      try {
        const res = await fetch("/api/sprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          playHapticSound("success");
          showToast("Sprint bounty pool funded & published to OutThink AI Arena!", "success");
          form.reset();
          loadSprints();
        }
      } catch (err) {}
    });
  }
}

// --------------------------------------------------------------------------
// 14. Web3 Wallet Integration (Solana Mainnet)
// --------------------------------------------------------------------------
function authHeaders(extra) {
  let token = "";
  try { token = localStorage.getItem("outthink_token") || ""; } catch (e) {}
  const headers = Object.assign({ "Content-Type": "application/json" }, extra || {});
  if (token) headers.Authorization = "Bearer " + token;
  return headers;
}

function tokenStillValid(token) {
  try {
    const payload = token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(payload));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch (e) {
    return false;
  }
}

/** Signs the wallet again whenever the session token is missing or expired. */
// Solana wallet (Phantom/Solflare) detection and base58 transport for signatures.
function solanaWallet() {
  const phantom = window.phantom && window.phantom.solana;
  if (phantom && phantom.isPhantom) return phantom;
  if (window.solana && window.solana.isPhantom) return window.solana;
  return null;
}

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bs58Encode(bytes) {
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) { digits.push(carry % 58); carry = (carry / 58) | 0; }
  }
  let out = "";
  for (let k = 0; k < bytes.length && bytes[k] === 0; k++) out += "1";
  for (let q = digits.length - 1; q >= 0; q--) out += B58_ALPHABET[digits[q]];
  return out;
}

async function connectWalletAccount() {
  // Solana is the primary network for OutThink AI ($OUTTHINK on pump.fun)
  const sol = solanaWallet();
  if (sol) {
    const res = await sol.connect();
    const key = res && res.publicKey ? res.publicKey : sol.publicKey;
    if (!key) throw new Error("No Solana account selected");
    return { address: key.toString(), kind: "solana" };
  }
  if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts && accounts[0]) return { address: accounts[0], kind: "evm" };
  }
  throw new Error("No Solana wallet found. Please install Phantom, Solflare, or Backpack.");
}

async function signMessageWith(kind, account, message) {
  if (kind === "solana") {
    const sol = solanaWallet();
    const signed = await sol.signMessage(new TextEncoder().encode(message), "utf8");
    const sig = signed && signed.signature ? signed.signature : signed;
    return bs58Encode(Uint8Array.from(sig));
  }
  return window.ethereum.request({ method: "personal_sign", params: [message, account] });
}

async function ensureSignedIn(force, preconnected) {
  let token = "";
  try { token = localStorage.getItem("outthink_token") || ""; } catch (e) {}
  if (!force && token && tokenStillValid(token)) return token;
  try { localStorage.removeItem("outthink_token"); } catch (e) {}

  const wallet = preconnected || await connectWalletAccount();
  const verified = await signedIn(wallet.address, wallet.kind);
  return verified.token;
}

/** Any write: make sure the wallet signed, then retry once if the token expired. */
async function signedFetch(url, options) {
  await ensureSignedIn(false);
  let res = await fetch(url, Object.assign({}, options, { headers: authHeaders() }));
  if (res.status === 401) {
    await ensureSignedIn(true);
    res = await fetch(url, Object.assign({}, options, { headers: authHeaders() }));
  }
  return res;
}

// Explorer links must match the network the server actually writes to.
let chainInfoPromise = null;
function loadChainInfo() {
  if (!chainInfoPromise) {
    chainInfoPromise = fetch("/api/health")
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.chain) || null; })
      .catch(function () { return null; });
  }
  return chainInfoPromise;
}

function explorerTxUrl(hash) {
  if (!hash) return "";
  if (/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    var base = (window.__chainInfo && window.__chainInfo.evm && window.__chainInfo.evm.explorerUrl) || "https://solscan.io";
    return base.replace(/\/$/, "") + "/tx/" + hash;
  }
  const cluster = (window.__chainInfo && window.__chainInfo.solana && window.__chainInfo.solana.cluster) || "mainnet-beta";
  return "https://explorer.solana.com/tx/" + hash + (cluster === "devnet" ? "?cluster=devnet" : "");
}

loadChainInfo().then(function (info) { window.__chainInfo = info; });

function signedIn(account, kind) {
  return fetch("/api/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: account })
  })
    .then(function (r) { return r.json(); })
    .then(function (nonce) {
      if (!nonce.message) throw new Error(nonce.error || "Sign-in could not start");
      return signMessageWith(kind || "evm", account, nonce.message);
    })
    .then(function (signature) {
      return fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature: signature })
      });
    })
    .then(function (r) { return r.json(); })
    .then(function (verified) {
      if (!verified.token) throw new Error(verified.error || "Signature rejected");
      try {
        localStorage.setItem("outthink_token", verified.token);
        localStorage.setItem("outthink_expert_id", verified.expert && verified.expert.id ? verified.expert.id : "");
      } catch (e) {}
      return verified;
    });
}

function setupWeb3Wallet() {
  const btn = document.getElementById("connectWalletBtn");
  const label = document.getElementById("walletBtnText");
  const autoFillBtn = document.getElementById("onboardConnectWalletBtn");
  const onboardWalletInput = document.getElementById("onboardWallet");
  const navSubmitBtn = document.getElementById("navSubmitCaseBtn");
  const drawerSubmitBtn = document.getElementById("drawerSubmitCaseBtn") || document.querySelector("#drawerCtaSection a");
  const drawerConnectBtn = document.getElementById("drawerConnectWalletBtn");
  const drawerCtaSection = document.getElementById("drawerCtaSection");
  const drawerConnectSection = document.getElementById("drawerConnectSection");

  // Chain parameters come from /api/health (chain.solana)
  const SOL_FALLBACK = {
    chainName: "Solana Mainnet",
    explorerUrl: "https://solscan.io"
  };

  function rhChainParams() {
    const chain = (window.__chainInfo && window.__chainInfo.solana) || {};
    return {
      chainName: chain.name || SOL_FALLBACK.chainName,
      explorerUrl: chain.explorerUrl || SOL_FALLBACK.explorerUrl
    };
  }

  function solanaChainParams() {
    const c = rhChainParams();
    return {
      chainName: c.chainName,
      blockExplorerUrls: [c.explorerUrl]
    };
  }

  let currentAccount = localStorage.getItem("outthink_wallet") || null;

  function updateWalletUI(account, isWrongNetwork = false) {
    if (!btn || !label) return;
    if (account) {
      document.body.classList.remove("wallet-disconnected");
      document.body.classList.add("wallet-connected");
      btn.classList.add("connected");
      btn.classList.remove("main-cta", "wrong-network");
      btn.title = `Connected: ${account} (Click to disconnect)`;
      const truncated = `${account.slice(0, 6)}...${account.slice(-4)}`;
      label.textContent = truncated;
      if (navSubmitBtn) {
        navSubmitBtn.style.display = "inline-flex";
      }
      if (drawerCtaSection) {
        drawerCtaSection.style.display = "block";
      }
      if (drawerConnectSection) {
        drawerConnectSection.style.display = "none";
      }
      if (drawerSubmitBtn) {
        drawerSubmitBtn.style.display = "flex";
      }
      if (drawerConnectBtn) {
        drawerConnectBtn.style.display = "none";
      }
      if (onboardWalletInput && !onboardWalletInput.value) {
        onboardWalletInput.value = account;
      }
    } else {
      document.body.classList.add("wallet-disconnected");
      document.body.classList.remove("wallet-connected");
      btn.classList.remove("connected", "wrong-network");
      btn.classList.add("main-cta");
      btn.title = "Connect Wallet (Phantom / Solflare on Solana)";
      label.textContent = "Connect Wallet";
      if (navSubmitBtn) {
        navSubmitBtn.style.display = "none";
      }
      if (drawerCtaSection) {
        drawerCtaSection.style.display = "none";
      }
      if (drawerConnectSection) {
        drawerConnectSection.style.display = "block";
      }
      if (drawerSubmitBtn) {
        drawerSubmitBtn.style.display = "none";
      }
      if (drawerConnectBtn) {
        drawerConnectBtn.style.display = "flex";
      }
    }

    if (isWrongNetwork) {
      btn.classList.add("wrong-network");
      label.textContent = "Wrong Net";
      btn.title = "Please switch your wallet to Solana Mainnet.";
    }
  }

  // Initialize UI state immediately on boot
  updateWalletUI(currentAccount);

  async function checkNetwork() {
    // Solana wallet is primary
    return true;
  }

  async function switchNetwork() {
    return true;
  }

  // Shown when the browser has no injected wallet: give the visitor a way forward.
  function openWalletHelp() {
    playHapticSound("click");
    const existing = document.getElementById("walletHelpSheet");
    if (existing) { existing.classList.add("open"); return; }
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const host = location.host + location.pathname;
    const options = mobile
      ? [
          ["MetaMask", "Mobile app", "https://metamask.app.link/dapp/" + host],
          ["Phantom", "Solana fallback", "https://phantom.app/download"]
        ]
      : [
          ["MetaMask", "Browser extension", "https://metamask.io/download/"],
          ["Rabby", "Browser extension", "https://rabby.io/download"],
          ["Phantom", "Solana fallback", "https://phantom.app/download"]
        ];
    const chevron = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    const sheet = document.createElement("div");
    sheet.id = "walletHelpSheet";
    sheet.className = "wallet-sheet";
    sheet.innerHTML =
      '<div class="wallet-sheet-card" role="dialog" aria-modal="true" aria-labelledby="walletSheetTitle">' +
        '<button class="wallet-sheet-x" type="button" aria-label="Close">&#10005;</button>' +
        '<span class="wallet-kicker">Connect</span>' +
        '<h3 id="walletSheetTitle">Choose a wallet</h3>' +
        '<p>No Web3 wallet was found in this browser. Pick one below, then open OutThink AI inside it.</p>' +
        '<div class="wallet-sheet-list">' +
          options.map(function (o, i) {
            return '<a class="wallet-opt" style="--i:' + i + '" href="' + o[2] + '" target="_blank" rel="noopener noreferrer">' +
              '<span class="wallet-badge">' + o[0].charAt(0) + '</span>' +
              '<span class="wallet-meta"><b>' + o[0] + '</b><small>' + o[1] + '</small></span>' +
              '<span class="wallet-go">' + chevron + '</span></a>';
          }).join("") +
        '</div>' +
        '<small class="wallet-note">Already installed? Reload this page after installing.</small>' +
      '</div>';
    document.body.appendChild(sheet);
    sheet.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".wallet-opt")) playHapticSound("click");
      if (e.target === sheet || (e.target.closest && e.target.closest(".wallet-sheet-x"))) sheet.classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") sheet.classList.remove("open");
    });
    requestAnimationFrame(function () { sheet.classList.add("open"); });
  }

  async function connect() {
    const sol = solanaWallet();
    if (!sol && typeof window.ethereum === "undefined") {
      openWalletHelp();
      return;
    }

    try {
      if (label) label.textContent = "Connecting...";
      btn.disabled = true;

      const wallet = await connectWalletAccount();
      currentAccount = wallet.address;
      localStorage.setItem("outthink_wallet", currentAccount);

      try {
        await ensureSignedIn(true, wallet);
      } catch (signErr) {
        const reason = String((signErr && signErr.message) || "Sign-in failed");
        // A server-side setup problem (missing or short AUTH_SECRET) is not the
        // visitor's fault: keep the wallet connected and say what is wrong
        // instead of blaming a rejected signature.
        if (/not configured|disabled|AUTH_SECRET|could not start/i.test(reason)) {
          updateWalletUI(currentAccount);
          showToast("Sign-in is disabled on the server: " + reason, "error");
          return;
        }
        currentAccount = null;
        try { localStorage.removeItem("outthink_wallet"); } catch (e) {}
        updateWalletUI(null);
        showToast("Signature rejected. Connect again and approve the sign-in message.", "error");
        return;
      }

      // Signing a login message works on any chain and the on-chain anchor is
      // written by the server wallet, so a wrong network must never block a user.
      updateWalletUI(currentAccount, false);
      showToast(`Wallet connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`, "success");
      refreshOnboardingState();
    } catch (err) {
      if (err.code === 4001) {
        showToast("Wallet connection rejected by user.", "error");
      } else {
        showToast("Wallet connection error: " + (err.message || err), "error");
      }
      updateWalletUI(null);
    } finally {
      btn.disabled = false;
    }
  }

  function disconnect() {
    currentAccount = null;
    localStorage.removeItem("outthink_wallet");
    localStorage.removeItem("outthink_token");
    localStorage.removeItem("outthink_expert_id");
    updateWalletUI(null);
    showToast("Wallet disconnected.", "info");
    const currentPath = window.location.pathname;
    if (currentPath === "/review-queue" || currentPath === "/onboarding" || currentPath === "/submit") {
      navigateTo("/", true);
    }
  }

  if (btn) {
    btn.addEventListener("click", () => {
      if (currentAccount) {
        disconnect();
      } else {
        connect();
      }
    });
  }

  if (drawerConnectBtn) {
    drawerConnectBtn.addEventListener("click", () => {
      if (window.closeMobileDrawer) window.closeMobileDrawer();
      if (!currentAccount) {
        connect();
      }
    });
  }

  if (autoFillBtn) {
    autoFillBtn.addEventListener("click", () => {
      if (currentAccount) {
        if (onboardWalletInput) onboardWalletInput.value = currentAccount;
        showToast("Auto-filled wallet: " + currentAccount.slice(0, 6) + "...", "success");
      } else {
        connect().then(() => {
          if (currentAccount && onboardWalletInput) {
            onboardWalletInput.value = currentAccount;
          }
        });
      }
    });
  }

  if (window.ethereum) {
    window.ethereum.on?.("accountsChanged", (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
      } else {
        currentAccount = accounts[0];
        localStorage.setItem("outthink_wallet", currentAccount);
        updateWalletUI(currentAccount);
      }
    });
    window.ethereum.on?.("chainChanged", async () => {
      const isCorrect = await checkNetwork();
      updateWalletUI(currentAccount, !isCorrect);
    });
  }

  if (currentAccount) {
    updateWalletUI(currentAccount);
  }
}


/* X shortcut: on phones and tablets open the X app, on desktop open x.com */
(function () {
  var user = "outthinkai";
  var web = "https://x.com/" + user;
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a.social-x-btn") : null;
    if (!el) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var touch = matchMedia("(max-width: 1023px)").matches || "ontouchstart" in window;
    if (!touch) return;
    e.preventDefault();
    var done = false;
    var t = setTimeout(function () {
      if (done) return;
      done = true;
      location.href = web;
    }, 900);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { done = true; clearTimeout(t); }
    }, { once: true });
    var link = document.createElement("a");
    link.href = "twitter://user?screen_name=" + user;
    link.click();
  });
})();
