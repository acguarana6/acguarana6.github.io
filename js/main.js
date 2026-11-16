// Personal site script. No libraries, nothing to build.

// Keep the footer year current -------------------------------------------------
document.querySelectorAll("[data-year]").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Highlight the section you are reading in the top menu (home page) ------------
(function () {
  var links = document.querySelectorAll('.site-nav a[href^="#"]');
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  links.forEach(function (link) {
    byId[link.getAttribute("href").slice(1)] = link;
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.removeAttribute("aria-current");
        });
        byId[entry.target.id].setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  Object.keys(byId).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();

// Contact form: check the fields, send through Web3Forms, report the result ----
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var button = form.querySelector('button[type="submit"]');
  var fields = ["name", "email", "message"];

  var problems = {
    name: "Enter your name.",
    email: "Enter an email address like name@example.com.",
    message: "Write a message before sending."
  };

  function check(id) {
    var input = document.getElementById(id);
    var note = document.getElementById(id + "-problem");
    var ok = input.value.trim() !== "" && input.checkValidity();
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    note.textContent = ok ? "" : problems[id];
    return ok;
  }

  function say(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  // Clear a field's error once the visitor fixes it
  fields.forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (this.getAttribute("aria-invalid") === "true") check(id);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    say("");

    var firstBad = null;
    fields.forEach(function (id) {
      if (!check(id) && !firstBad) firstBad = document.getElementById(id);
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    if (form.elements.access_key.value === "YOUR_ACCESS_KEY_HERE") {
      say("This form isn't connected yet. Add your Web3Forms access key in contact.html (see README.md).", "bad");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";

    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.success) {
            throw new Error(data.message || "The message was not accepted.");
          }
        });
      })
      .then(function () {
        form.reset();
        document.dispatchEvent(new CustomEvent("message-sent"));
        say("Message sent. Thank you, I'll reply by email.", "ok");
      })
      .catch(function () {
        say("Your message wasn't sent. Check your connection and send it again. Your text is still in the form.", "bad");
      })
      .then(function () {
        button.disabled = false;
        button.textContent = "Send message";
      });
  });
})();
