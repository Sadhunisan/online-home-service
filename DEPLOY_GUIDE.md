# Deploying Fixly — step by step

You have two pieces now:
- `index.html` — the frontend (static site)
- `fixly-backend.zip` — the Spring Boot API (Java, JWT auth, bookings)

## Part 1 — Run it locally first (5 min, confirms everything works)

1. Unzip `fixly-backend.zip`, open a terminal in `fixly-backend/`, run:
   ```
   mvn spring-boot:run
   ```
   This starts the API at `http://localhost:8080` on an in-memory database —
   no Postgres install needed to test.
2. Open `index.html` directly in your browser (or serve it with VS Code's
   "Live Server" extension). It already points at `http://localhost:8080`
   by default, so sign up, log in, and book a service to confirm the whole
   flow works end to end.

## Part 2 — Put the backend online (Render, free)

1. Create a GitHub repo and push the unzipped `fixly-backend/` folder to it.
2. On [render.com](https://render.com) → **New → PostgreSQL** → create a free
   database. Copy the host, database name, username, and password it gives you.
3. **New → Web Service** → connect that GitHub repo.
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/fixly-backend-1.0.0.jar`
4. Add environment variables on the service:
   - `DATABASE_URL` = `jdbc:postgresql://<host>:5432/<dbname>`
   - `DATABASE_USERNAME`, `DATABASE_PASSWORD` = from step 2
   - `DATABASE_DRIVER` = `org.postgresql.Driver`
   - `JWT_SECRET` = any long random string (32+ characters)
   - `CORS_ORIGINS` = your frontend URL (you'll get this in Part 3 — you can
     come back and set this after)
5. Deploy. You'll get a URL like `https://fixly-backend.onrender.com` —
   that's your live API.

Free-tier note: Render's free web services sleep after 15 minutes of no
traffic and take ~30–50 seconds to wake up on the next request. Fine for a
student project/demo; upgrade to a paid instance later if that matters.

## Part 3 — Put the frontend online (Vercel or Netlify, free)

1. Open `index.html` and change this line near the top of the `<script>` tag:
   ```js
   const API_BASE = window.FIXLY_API_BASE || "http://localhost:8080";
   ```
   to your Render URL:
   ```js
   const API_BASE = window.FIXLY_API_BASE || "https://fixly-backend.onrender.com";
   ```
2. Push `index.html` to its own GitHub repo (or the same one, in a `/frontend` folder).
3. On [vercel.com](https://vercel.com) → **Add New → Project** → import that
   repo → deploy. You'll get a free URL like `https://fixly.vercel.app`.
4. Go back to Render and set `CORS_ORIGINS` to that exact URL, then redeploy
   the backend so it accepts requests from your live frontend.

At this point the whole system is live and free — just on Vercel/Render
subdomains rather than your own domain name.

## Part 4 — Your own domain name

Here's the honest picture: **hosting can be free, but a real custom domain
name (like `fixly.com` or `fixly.in`) generally costs money** — roughly
$1–15/year depending on the extension and registrar. There isn't a reliable
free way to get a real domain anymore. Two paths:

**Option A — get a cheap domain (~$1–12/year)**
1. Buy one from [Namecheap](https://namecheap.com) or [Porkbun](https://porkbun.com)
   — search for `fixly.in`, `getfixly.com`, `fixlyhome.com`, etc.
2. In Vercel: **Project → Settings → Domains** → add your domain → Vercel
   shows you DNS records to add.
3. In your registrar's DNS settings, add those records (usually an `A` record
   and a `CNAME`). Propagation takes anywhere from a few minutes to ~24 hours.
4. Update `CORS_ORIGINS` on Render to your new domain once it's live.

**Option B — stick with the free subdomain for now**
`fixly.vercel.app` is completely fine for a portfolio/academic project — it's
free, has HTTPS built in, and you can add a real domain later without
rebuilding anything.

## What I'll need from you to go further

If you want me to actually walk through any of this live with you (e.g.
debug a Render deploy error, pick a domain name, or extend the API — payments,
provider dashboards, an admin panel), just paste the error or tell me what's
next and I'll keep going with you step by step.
