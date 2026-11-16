// Visitor analytics. Fill in the three IDs below; anything left empty stays off.
// See README.md, "Turn on analytics", for where to find each ID.

var ANALYTICS = {
  // GoatCounter site code: the first part of yourcode.goatcounter.com
  goatcounter: "alexa8star",

  // Google Analytics 4 measurement ID. It must start with "G-", for example
  // G-AB12CD34EF.
  ga4: "G-7HSKXRFGQ8",

  // Microsoft Clarity project ID, a short string of letters and numbers
  clarity: "zesbjyw0o9"
};

(function () {
  "use strict";

  var CONSENT_KEY = "analytics-consent";
  var needsConsent = Boolean(ANALYTICS.ga4 || ANALYTICS.clarity);
  var optionalLoaded = false;

  // Remembering the visitor's choice --------------------------------------------
  function readConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      if (value) window.localStorage.setItem(CONSENT_KEY, value);
      else window.localStorage.removeItem(CONSENT_KEY);
    } catch (e) {
      /* storage unavailable: the banner simply shows again next visit */
    }
  }

  function addScript(src, attributes) {
    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    Object.keys(attributes || {}).forEach(function (name) {
      script.setAttribute(name, attributes[name]);
    });
    document.head.appendChild(script);
    return script;
  }

  // GoatCounter: no cookies, no personal data, so it runs without asking ---------
  var goatQueue = [];
  var goatReady = false;

  if (ANALYTICS.goatcounter) {
    var goat = addScript("https://gc.zgo.at/count.js", {
      "data-goatcounter": "https://" + ANALYTICS.goatcounter + ".goatcounter.com/count"
    });
    goat.addEventListener("load", function () {
      goatReady = true;
      goatQueue.forEach(sendToGoat);
      goatQueue = [];
    });
  }

  function sendToGoat(event) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: event.name, title: event.label, event: true });
    }
  }

  // Google Analytics and Clarity: use cookies, so they wait for a yes ------------
  function loadOptional() {
    if (optionalLoaded) return;
    optionalLoaded = true;

    if (ANALYTICS.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      window.gtag("js", new Date());
      window.gtag("config", ANALYTICS.ga4);
      addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ANALYTICS.ga4));
    }

    if (ANALYTICS.clarity) {
      window.clarity =
        window.clarity ||
        function () {
          (window.clarity.q = window.clarity.q || []).push(arguments);
        };
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
      addScript("https://www.clarity.ms/tag/" + encodeURIComponent(ANALYTICS.clarity));
    }
  }

  // Withdrawing consent: tell both services, then delete the cookies they set ----
  function withdrawOptional() {
    if (window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    if (ANALYTICS.ga4) {
      window["ga-disable-" + ANALYTICS.ga4] = true;
    }
    if (window.clarity) {
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
    }

    var host = window.location.hostname;
    var parts = host.split(".");
    var domains = ["", host];
    for (var i = 0; i < parts.length - 1; i++) {
      domains.push("." + parts.slice(i).join("."));
    }

    document.cookie.split(";").forEach(function (pair) {
      var name = pair.split("=")[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_clck|_clsk)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie =
          name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (domain ? "; domain=" + domain : "");
      });
    });
  }

  // One function to record an event everywhere that is switched on ---------------
  function track(name, label) {
    var event = { name: name, label: label || name };

    if (ANALYTICS.goatcounter) {
      if (goatReady) sendToGoat(event);
      else goatQueue.push(event);
    }
    if (optionalLoaded && window.gtag) {
      window.gtag("event", name.replace(/[^a-z0-9]+/gi, "_").toLowerCase(), { label: event.label });
    }
    if (optionalLoaded && window.clarity) {
      window.clarity("event", name);
    }
  }

  // Which sections people actually read ------------------------------------------
  // A section counts as read once it has been in the middle of the screen for
  // two seconds, and is counted once per page view.
  function watchSections() {
    var sections = document.querySelectorAll("main section[id]");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var timers = {};
    var counted = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id;
          if (counted[id]) return;

          if (entry.isIntersecting) {
            timers[id] = window.setTimeout(function () {
              counted[id] = true;
              observer.unobserve(entry.target);
              track("read-" + id, "Read section: " + id);
            }, 2000);
          } else {
            window.clearTimeout(timers[id]);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // Clicks worth knowing about ----------------------------------------------------
  function watchClicks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) return;

      var href = link.getAttribute("href");
      if (link.hasAttribute("download")) {
        track("download-resume", "Downloaded résumé");
      } else if (/^https?:\/\//i.test(href) && link.hostname !== window.location.hostname) {
        track("outbound-" + link.hostname.replace(/^www\./, ""), "Outbound link: " + href);
      } else if (/contact\.html$/.test(href)) {
        track("open-contact", "Opened the contact page");
      }
    });

    document.addEventListener("message-sent", function () {
      track("message-sent", "Sent a contact message");
    });
  }

  // Consent banner ------------------------------------------------------------------
  function showBanner() {
    if (document.getElementById("consent-banner")) return;

    var banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.className = "consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Analytics choice");

    var text = document.createElement("p");
    text.appendChild(
      document.createTextNode(
        "May I use Google Analytics and Microsoft Clarity to see how this site is used? They set cookies and record clicks and scrolling. "
      )
    );
    var more = document.createElement("a");
    more.href = "privacy.html";
    more.textContent = "Read the privacy note";
    text.appendChild(more);

    var buttons = document.createElement("div");
    buttons.className = "consent-actions";

    var allow = document.createElement("button");
    allow.type = "button";
    allow.className = "button quiet";
    allow.textContent = "Allow analytics";

    var decline = document.createElement("button");
    decline.type = "button";
    decline.className = "button quiet";
    decline.textContent = "No thanks";

    allow.addEventListener("click", function () {
      saveConsent("granted");
      banner.remove();
      loadOptional();
    });
    decline.addEventListener("click", function () {
      saveConsent("denied");
      banner.remove();
    });

    buttons.appendChild(allow);
    buttons.appendChild(decline);
    banner.appendChild(text);
    banner.appendChild(buttons);
    document.body.appendChild(banner);
  }

  // "Change my choice" button on the privacy page ------------------------------------
  function watchReset() {
    var reset = document.querySelector("[data-consent-reset]");
    if (!reset) return;

    var note = document.getElementById("consent-state");
    var choice = readConsent();
    if (note) {
      note.textContent = !needsConsent
        ? "No optional analytics are switched on for this site right now."
        : choice === "granted"
        ? "You allowed analytics cookies on this device. Changing your choice switches them off and deletes them."
        : choice === "denied"
        ? "You declined analytics cookies on this device."
        : "You haven't made a choice on this device yet.";
    }

    reset.addEventListener("click", function () {
      var wasGranted = readConsent() === "granted";
      saveConsent(null);
      if (!needsConsent) return;

      if (wasGranted) {
        // Switch analytics off, remove its cookies, and start the page clean.
        // The choice box appears again after the reload.
        withdrawOptional();
        window.location.reload();
        return;
      }
      showBanner();
      if (note) note.textContent = "Choose again in the box at the bottom of the page.";
    });
  }

  // Start --------------------------------------------------------------------------
  if (needsConsent) {
    var choice = readConsent();
    if (choice === "granted") loadOptional();
    else if (choice !== "denied") showBanner();
  }

  watchSections();
  watchClicks();
  watchReset();
})();
