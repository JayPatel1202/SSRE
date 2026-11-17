# Connect the enquiry form to Google Sheets

Enquiries from your website are saved to a **Google Sheet** tab called `Enquiries`.

You do **not** send passwords or Google login to anyone — you set this up in your own Google account.

---

## What I need from you (after you finish setup)

Share **only** these (or paste into `js/config.js` yourself):

| Item | Where you get it |
|------|------------------|
| **Web App URL** | Apps Script → Deploy → Web app → URL ending in `/exec` |
| **Form secret** (optional) | Same value in Apps Script `FORM_SECRET` and `js/config.js` `FORM_SECRET` |

---

## Step-by-step

### 1. Create the spreadsheet

[Google Sheets](https://sheets.google.com) → blank spreadsheet → name e.g. `SSRE Website Enquiries`.

### 2. Add the script

**Extensions** → **Apps Script** → paste `google-apps-script/Code.gs` → set `FORM_SECRET` → Save.

### 3. Create sheet headers

Run **`setupSheet`** once in Apps Script (approve permissions). Confirm tab **`Enquiries`** has headers.

### 4. Deploy as web app

**Deploy** → **Web app** → Execute as **Me** → **Anyone** → copy `/exec` URL.

### 5. Connect the website

Paste URL and secret in `js/config.js` → redeploy GitHub Pages.

### 6. Test

Submit the form on the live site → new row in `Enquiries`.

---

## Sheet columns

| Column | Content |
|--------|---------|
| Submitted At | Date/time |
| Name | Customer name |
| Phone | Mobile number |
| Average Bill (₹) | Optional average monthly bill |
| Solar Capacity | Optional |
| Notes | Optional message |
| Page URL | Where they submitted from |

**Existing sheet with old columns?** Add **Average Bill (₹)** (or rename an amount column), paste updated `Code.gs`, deploy new Web app version. Old columns can stay unused.

---

## Troubleshooting

- **Unauthorized** — `FORM_SECRET` must match in `Code.gs` and `js/config.js`, or leave both empty.
- **CORS / failed fetch** — Redeploy web app as **Anyone**; use `/exec` URL.