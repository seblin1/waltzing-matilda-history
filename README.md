# Waltzing Matilda History — website

The website for *Waltzing Matilda — Australia's Accidental Anthem*. Static HTML with one serverless function that saves newsletter signups to Supabase. Hosts on Vercel with **no build step**.

```
.
├── index.html          # Home (story, book, characters, recordings teaser, signup, contact)
├── recordings.html     # Searchable recordings archive (624 versions)
├── api/
│   └── subscribe.js    # Serverless function: saves an email to Supabase
├── supabase.sql        # One-time table setup
├── .env.example        # Which environment variables you need
└── .gitignore
```

---

## 1. Put it on GitHub

In a terminal, from inside this folder:

```bash
git init
git add .
git commit -m "Initial commit — Waltzing Matilda History site"
```

Create an empty repo on GitHub (github.com → New repository — don't add a README/.gitignore, this repo already has them), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/waltzing-matilda-history.git
git branch -M main
git push -u origin main
```

## 2. Set up the Supabase table

1. In your Supabase project: **SQL Editor → New query**.
2. Paste the contents of `supabase.sql` and click **Run**. This creates the `subscribers` table (locked down with Row Level Security).
3. Go to **Project Settings → API** and copy two values:
   - **Project URL** → this is `SUPABASE_URL`
   - **`service_role` secret key** (under "Project API keys") → this is `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ The `service_role` key is a secret. It only ever lives in Vercel's environment variables and in the server-side function — never in the browser, never committed to git.

## 3. Deploy on Vercel

1. vercel.com → **Add New… → Project → Import** your GitHub repo.
2. Framework preset: **Other** (it's plain static + a function). No build command, no output directory needed.
3. Before (or right after) deploying, add **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role secret |

4. Deploy. Your site is live at `your-project.vercel.app`. (If you add env vars after the first deploy, hit **Redeploy** so the function picks them up.)

## 4. Point your domain (optional)

In Vercel → Project → **Settings → Domains**, add `waltzingmatildahistory.com.au` and follow the DNS instructions.

## 5. Test the signup

Open the live site, enter an email in the newsletter box, click **Sign Up**. Then in Supabase → **Table Editor → subscribers** you should see the row. Export anytime as CSV from there.

---

### Notes
- **Local preview:** opening `index.html` directly from your computer works for everything except the signup form (there's no server running `/api`). The form only stores emails once deployed to Vercel. To test locally with the function, install the Vercel CLI and run `vercel dev`.
- **Duplicate emails** are handled — signing up twice won't error or create duplicates.
- **Spam:** a hidden honeypot field quietly blocks basic bots. If you later get spam, consider adding a captcha.
- **Using the emails later:** when you're ready, export the `subscribers` table to CSV, or connect Supabase to your email tool of choice.
