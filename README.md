# alexandrachin.github.io

A small static site: plain HTML, CSS and JavaScript. Nothing to install or build.

```
index.html        Home: intro, about, experience, projects, papers, awards
contact.html      Contact form (sends email through Web3Forms)
privacy.html      What the site records about visits
404.html          Shown for broken links
css/style.css     All styling; colours and fonts are at the top
js/main.js        Menu highlight and contact form
js/analytics.js   GoatCounter, Google Analytics and Clarity (IDs at the top)
fonts/            The two typefaces, served from your own site
assets/           Résumé PDF and the social preview image
.well-known/security.txt   How to report a security problem
```

## 1. Edit your content

Open `index.html` in any text editor. To add a job, project or paper, copy one
`<li>…</li>` block and change the text.

The "Download résumé" button serves `assets/Alexandra_Chin_Resume.pdf`. Replace
that file (keep the name) whenever your résumé changes.

## 2. Contact form

The form sends through Web3Forms using the access key already in
`contact.html`. Messages go to the email address you created that key with.
The key is meant to be public, so it is safe to commit.

## 3. Turn on analytics

All three services are switched on with your IDs, set at the top of
`js/analytics.js`. Clear an ID there to switch that service off.

| Service | Where to get the ID | What you paste |
| --- | --- | --- |
| GoatCounter | Sign up at https://www.goatcounter.com and pick a code | the code, e.g. `alexandrachin` |
| Google Analytics 4 | https://analytics.google.com → Admin → Data streams → Web | the Measurement ID, e.g. `G-AB12CD34EF` |
| Microsoft Clarity | https://clarity.microsoft.com → new project → Settings → Overview | the Project ID |

How they behave on the site:

- **GoatCounter** runs for every visitor. It sets no cookies.
- **Google Analytics and Clarity** set cookies, so visitors see a small box
  asking "Allow analytics" or "No thanks". They load only after a yes.
  Expect them to show fewer visitors than GoatCounter for that reason.
- The site also records these events in all three: each section a visitor reads
  (in view for two seconds), résumé downloads, clicks on outside links such as
  LinkedIn and the papers, opening the contact page, and a sent message.
- In GoatCounter they appear as events named `read-about`, `read-experience`,
  `read-projects`, `read-papers`, `read-awards`, `download-resume`,
  `outbound-…`, `open-contact` and `message-sent`.

If a visitor later withdraws consent on the privacy page, both services are
switched off and their cookies on this site are deleted.

`privacy.html` describes all of this to visitors. It says Google Analytics keeps
visitor-level data for 2 months: in Google Analytics, check Admin → Data
collection and modification → Data retention is set to 2 months so that stays
true. Update the "Last updated" date there when you change the page. If you switch a service off
for good, remove its paragraph there.

## 4. Publish on GitHub Pages

1. On GitHub, signed in as `alexandrachin`, create a public repository named
   exactly `alexandrachin.github.io`.
2. Upload everything in this folder, keeping the folder structure. On
   github.com: **Add file → Upload files**, drag the contents in, then
   **Commit changes**. Folders starting with a dot (`.well-known`) are easy to
   miss when dragging; the terminal route below includes them automatically:

   ```
   git init
   git add .
   git commit -m "Add personal website"
   git branch -M main
   git remote add origin https://github.com/alexandrachin/alexandrachin.github.io.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages**. Under "Build and deployment",
   choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute or two the site is live at https://alexandrachin.github.io.
   On the same settings page, make sure **Enforce HTTPS** is ticked.

## 5. Adding a custom domain later (optional)

If you buy a domain one day: add a file named `CNAME` containing just the
domain, replace `https://alexandrachin.github.io/` with the new address in
`index.html`, `contact.html` and `.well-known/security.txt`, verify the domain
in your GitHub account settings, and follow
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
for the DNS records.

## 6. Security checklist

A static site has no server, database or login for an attacker to break into.
The realistic ways it could be changed are through your GitHub account, your
domain, or a third-party script. No site is impossible to attack, but these
steps close the usual routes.

Already built into the files:

- A Content Security Policy on every page: browsers will only run this site's
  own scripts and the three analytics services, and only send form data to
  Web3Forms. If you add another outside service, add its address to the
  `Content-Security-Policy` line near the top of each HTML file.
- Fonts are served from your own site, so there is one less outside party.
- No passwords or secrets anywhere in the files. Keep it that way: the Web3Forms
  key and analytics IDs are public by design, but never commit anything else.
- A hidden spam trap on the contact form.
- `.well-known/security.txt`. Renew its `Expires` date once a year.

For you to do:

- **GitHub account:** turn on two-factor authentication (a passkey or
  authenticator app), save the recovery codes, and remove access tokens, SSH
  keys and authorised apps you don't use.
- **Repository:** keep yourself as the only collaborator. Under
  Settings → Branches (or Rules), protect `main` against force pushes and
  deletion.
- **Address:** `alexandrachin.github.io` belongs to your GitHub username, so
  keep that account and don't rename it; a renamed or deleted account frees
  the address for someone else. Keep Enforce HTTPS ticked.
- **Analytics accounts:** two-factor login on GoatCounter, Google and
  Microsoft too; whoever controls those can see your visitor data.
- **Email:** the inbox that receives contact messages can reset your other
  accounts, so protect it the same way. Treat links in contact-form messages
  with the usual caution.

## Changing the look

All colours and fonts are variables at the top of `css/style.css`. Change
`--accent` to recolour links and buttons everywhere.

To refresh the social preview image after changing the intro, replace
`assets/social-preview.png` with a 1200 × 630 image.
