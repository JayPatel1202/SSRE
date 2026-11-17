# Surya Shakti Solar — Static Website

Marketing site for **Surya Shakti Solar Renewable Energy (SSRE)**, Tarapur. Built as plain HTML/CSS/JS for [GitHub Pages](https://pages.github.com/).

## What's included

- Hero, featured **₹1.58 L / 3.24 kW** quotation (Adani/Waaree, Polycab inverter & cables)
- Warranties: **8 yr** Polycab inverter, **30 yr** panel performance, **5 yr** free service
- Enquiry form → **Google Sheet** (+ bill files in Google Drive)
- Contact: Jay Patel **8866551202**
- Uses your `Symbol.jpeg` logo

## Run locally

```bash
cd "/Users/jaypatel/Desktop/Surya Shakti Renewable Energy"
python3 -m http.server 8080
```

Visit http://localhost:8080

## Google Sheets integration (required for live form)

Follow **`SETUP-GOOGLE-SHEET.md`** in this folder.

Quick summary — you will:

1. Create a Google Sheet  
2. Paste `google-apps-script/Code.gs` in **Extensions → Apps Script**  
3. Run `setupSheet`, deploy as **Web app** (**Anyone** can access)  
4. Put the `/exec` URL in **`js/config.js`** → `GOOGLE_SCRIPT_URL`

### What details you need to share (after setup)

Only paste into `js/config.js` (not passwords):

- **Web App URL** from Apps Script deployment  
- Optional **FORM_SECRET** (same string in `Code.gs` and `config.js`)

Your Google login and sheet stay private in your account.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder.  
2. **Settings → Pages → branch `main` / root**.  
3. Ensure `js/config.js` has your live `GOOGLE_SCRIPT_URL` before customers use the form.

`.nojekyll` is included so GitHub does not strip assets.

## Customisation

- Copy and pricing: `index.html`
- Colours and layout: `css/style.css`
- Form endpoint: `js/config.js`
- Form behaviour: `js/main.js`
- Sheet script: `google-apps-script/Code.gs`

## License

Content and branding © Surya Shakti Renewable Energy.