# Connect the enquiry form to Google Sheets

Enquiries from your website are saved to a **Google Sheet** tab called `Enquiries`. Uploaded bills are stored in a **Google Drive** folder `SSRE Bill Uploads` with shareable links in the sheet.

You do **not** send passwords or Google login to anyone — you set this up in your own Google account.

---

## What I need from you (after you finish setup)

Share **only** these with your developer (or paste them yourself into `js/config.js`):

| Item | Where you get it |
|------|------------------|
| **Web App URL** | Apps Script → Deploy → Web app → URL ending in `/exec` |
| **Form secret** (optional) | Any long random string you choose; same value in Apps Script `FORM_SECRET` and `js/config.js` `FORM_SECRET` |

You keep private:

- Your Google account login  
- The spreadsheet itself (unless you choose to share edit access with your team)

---

## Step-by-step (≈10 minutes)

### 1. Create the spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**.
2. Name it e.g. `SSRE Website Enquiries`.

### 2. Add the script

1. **Extensions** → **Apps Script**.
2. Delete any sample code and paste the full contents of  
   `google-apps-script/Code.gs` from this project.
3. (Recommended) Set `FORM_SECRET` at the top of `Code.gs` to a random string, e.g. `ssre-xK9m2-patel-2026`.
4. **Save** the project (name it `SSRE Form`).

### 3. Create sheet headers

1. In Apps Script, select function **`setupSheet`** in the toolbar dropdown.
2. Click **Run** → approve permissions (Google will warn “unverified” — this is your own script; choose Advanced → Go to … → Allow).
3. In the spreadsheet, confirm tab **`Enquiries`** exists with column headers.

### 4. Deploy as web app

1. **Deploy** → **New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me  
4. **Who has access:** Anyone  
5. **Deploy** → copy the **Web app URL** (must end with `/exec`).

### 5. Connect the website

1. Open `js/config.js` in this project.
2. Set:

   ```js
   window.SSRE_CONFIG = {
     GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/...../exec",
     FORM_SECRET: "same-secret-as-in-Code.gs",
   };
   ```

3. Re-deploy / refresh your GitHub Pages site.

### 6. Test

1. Open the live (or local) site → fill the enquiry form → submit.
2. A new row should appear in `Enquiries`; bill files appear as links in the last columns.

---

## Sheet columns

| Column | Content |
|--------|---------|
| Submitted At | Date/time |
| Name | Customer name |
| Phone | Mobile number |
| Bill Period | Current month / Last 2 months |
| Solar Capacity | Optional |
| Notes | Optional message |
| Bill Current (Link) | Drive link |
| Bill Previous (Link) | Drive link (if uploaded) |
| Page URL | Where they submitted from |

---

## Troubleshooting

- **Unauthorized** — `FORM_SECRET` must match in `Code.gs` and `js/config.js`, or leave both empty.
- **CORS / failed fetch** — Redeploy web app as **Anyone**; use the `/exec` URL, not `/dev`.
- **Large bills** — Keep uploads under **8 MB** each (Apps Script time limits).
- **Permission denied on Run** — Run `setupSheet` again and accept OAuth scopes for Sheets + Drive.