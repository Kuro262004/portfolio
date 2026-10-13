# Portfolio

Full-stack portfolio covering developer, designer and professional work.

- **Frontend** (`frontend/`): React 19, Vite, Tailwind CSS, Radix UI, Framer Motion, Lucide, TanStack Query, Zustand, React Router, React Hook Form + Zod, Recharts, QR code.
- **Backend** (`backend/`): FastAPI, SQLAlchemy, Alembic, Pydantic, WebSockets, JWT + bcrypt, APScheduler.

## Run it

Backend (http://localhost:8000, docs at `/docs`):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env      # then edit SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
.\.venv\Scripts\uvicorn app.main:app --reload
```

On startup it applies the Alembic migration, seeds sample projects/skills and creates the admin user from `.env`.

**Before deploying:** set `ENVIRONMENT=production`, a strong `SECRET_KEY` (32+ characters), and your own `ADMIN_EMAIL` / `ADMIN_PASSWORD` as environment variables. In production mode the backend refuses to start with the default credentials from `.env.example`. Also set `CORS_ORIGINS` to your site's URL and build the frontend with `VITE_API_URL` pointing at the API.

Frontend (http://localhost:5173) — requires [Node.js 20+](https://nodejs.org):

```powershell
cd frontend
npm install
npm run dev
```

## The Circuit Board

The page is a green PCB. A copper trunk trace runs down the left edge with a branch into every section, and each section is an IC package with pins and a power LED. As you scroll, a glowing signal travels down the trunk; when it reaches a branch, that trace lights up and the chip powers on (and powers back off if you scroll up).

- `components/Board.jsx` measures every chip and routes the traces; `components/Section.jsx` is the chip frame (`ChipFrame`). To add a section, wrap it in `<Section id refdes label title>` and place it inside `<Board>` in `pages/Home.jsx`: the trace to it is automatic.
- `lib/circuit.js` + the `.chip` rules in `index.css` share one geometry (the pin the trace attaches to). If you change pin spacing or size, update `PIN_Y` and `pinLength()` too.
- The skills section is a powered network: pick a net (Developer / Designer / Professional) and power flows down the tree tier by tier; a node only powers after its parent. Click a powered node to see **the project where that skill was earned**; project cards link back to the skills they taught.
- Skills live in the database: each has a `parent_id` (the tree), a `project_id` (the project it was earned in), a 0-100 `level` (shown as 1-5 pips) and a short description.
- Edit the tree in `backend/app/seed.py` (`TREE`): nested tuples of `(name, level, description, project title, children)`. The seed only runs on an empty skills table, so to re-seed delete `backend/portfolio.db` and restart the backend.
- `lib/tree.js` lays the skill tree out. Deleting a project in `/admin` keeps its skills but clears their project link.
- Motion respects `prefers-reduced-motion` (the traveling pulses switch off; the lit/unlit states remain).
- Upgrading from an older version: the `0002` migration clears the old flat skill list, and the tree is seeded on the next start.

## Content

The projects, skills, experience, certifications and links come from Justin H. Sales' resume.

- Four nets: **AI**, **Developer**, **Designer**, **Professional**. Skill levels in `backend/app/seed.py` are estimates, so adjust them. A skill with no project (Photoshop) shows "learned off the clock".
- The seed only fills empty tables. To replace what's already in your database with the seed content, run `cd backend; .\.venv\Scripts\python -m app.seed --reset` (it replaces projects and skills; your admin user and messages are kept).
- Your phone number is on the resume but is deliberately not on the site; the email, GitHub and LinkedIn are in `frontend/src/lib/profile.js`.

## Make it yours

- `frontend/src/lib/profile.js` — name, bio, stats, experience, social links.
- `backend/app/seed.py` — sample projects and skills (only used on an empty database), or manage projects at `/admin`.
- `frontend/src/index.css` / `tailwind.config.js` — colors and fonts.

## What the backend does

- `GET /api/projects?category=`, `GET /api/skills` — public.
- `POST /api/messages` — contact form. Messages older than 90 days are purged nightly (APScheduler).
- `POST /api/auth/login` → JWT; `POST/PUT/DELETE /api/projects`, `GET /api/messages` require it.
- `WS /ws/live` — live visitor count and "new project" notifications.

Tests: `cd backend; .\.venv\Scripts\python -m pytest tests`
