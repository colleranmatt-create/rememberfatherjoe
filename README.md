# Remember Father Joe

A memorial site where people share memories, photos and stories of Father Joe Marchese.
Next.js on Vercel, with Supabase for the database and photo storage.

- `/` shows the tribute, the service details and the memory wall (approved memories, newest first)
- `/share` is the share form: up to 5 photos, an optional YouTube link and an optional private email
- `/admin` is where submissions are approved, behind a password

## Launch checklist

### 1. Supabase (database and photos), about 5 minutes
1. Create a free project at https://supabase.com/dashboard. Pick a region near most visitors.
2. Open **SQL Editor** and run each file in `supabase/migrations/` in order (oldest first): paste its contents and click **Run**.
   This creates the `memories` table and the `memory-photos` storage bucket.
3. Go to **Project Settings → API** (or **API Keys**) and copy:
   - the Project URL, which becomes `SUPABASE_URL`
   - the `service_role` key (or a **secret** key starting `sb_secret_`), which becomes `SUPABASE_SERVICE_ROLE_KEY`

### 2. Vercel (hosting), about 5 minutes
1. At https://vercel.com/new, import this GitHub repo. The framework is detected as Next.js.
2. Before deploying, add these **Environment Variables**:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from step 1.3 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1.3 |
   | `ADMIN_PASSWORD` | a long password for `/admin` |
   | `NEXT_PUBLIC_SITE_URL` | `https://rememberfatherjoe.com` (the real domain) |

3. Deploy. Every push to `main` redeploys automatically.

### 3. Domain
1. In Vercel go to **Project → Settings → Domains**, add the domain, and also add the `www.` version. Vercel offers to redirect one to the other.
2. Vercel shows the DNS records to create (usually an `A` record for the bare domain and a `CNAME` for `www`). Add them at the registrar (Namecheap: **Domain List → Manage → Advanced DNS**; GoDaddy: **My Products → DNS**).
3. Optional: add `fatherjoemarchese.com` as another domain in the same project and set it to **Redirect to** the main domain.

### 4. Content (edit `site.config.ts`)
Everything marked `TODO` there:
- **Photo:** put the image in `public/` (e.g. `public/father-joe.jpg`), then set `photo: "/father-joe.jpg"`. A roughly square, well-lit portrait works best. It's also used in the link preview.
- **Tribute paragraph(s)**, **lifespan**, **college name**
- **Services:** title, date, time, place and an optional map link

Commit and push; Vercel redeploys in about a minute.

### 5. Before sharing the link
- Submit a test memory with a photo from your phone, approve it at `/admin`, check it on the wall, then hide and delete it.
- Paste the link into a text to yourself to see the preview. To refresh Facebook's cached preview, use https://developers.facebook.com/tools/debug/.

## Moderating
Visit `/admin` and sign in with `ADMIN_PASSWORD`.
- **Waiting:** new submissions. Approve or Hide.
- **On the wall:** approved memories. Take one down if needed.
- **Hidden:** rejected memories. Delete forever removes the memory and its photos.

Approving a memory refreshes the public page right away. Emails show only on the admin page.

## How it's put together
- `site.config.ts` holds all the words on the site and the "How did you know him?" options
- `app/page.tsx` is the home page and wall; `app/share/` is the form and its server actions; `app/admin/` is moderation
- Photos are resized in the browser to 1600px JPEGs, then uploaded straight to Supabase Storage through one-time signed URLs (this avoids Vercel's 4.5 MB request limit)
- The `memories` table has row level security on with no policies, so the public Supabase API can't read it. Only the site's server, using the service role key, can read or write it.
- Photo files sit in a public bucket under random, unguessable names. Someone who had the exact URL of a photo in a submission that hasn't been approved yet could see it, but nothing lists those URLs.

## Local development
```bash
npm install
npx supabase start        # local Postgres + Storage (needs Docker)
cp .env.example .env.local  # fill in the local URL and key from `npx supabase status`
npm run dev
```

## Phase 2 ideas
The data model is already in place for: wall filters by touch point (`relationships`) and decade (`year_from` / `year_to`), AI tags and "memories like this" (add a `pgvector` column), a map from `location`, opt-in contact between people from the same years, and direct video uploads.
