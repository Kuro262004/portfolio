import sys

from sqlalchemy import delete, select

from .config import settings
from .database import SessionLocal
from .models import Project, Skill, User
from .security import hash_password

# Seed content, taken from Justin H. Sales' resume. Edit it here, or manage projects at /admin.
PROJECTS = [
    dict(
        title="AIKO — AI Telephone Operator",
        summary="An AI telephone operator that answers inquiries and takes F&B orders by chat and voice.",
        description=(
            "Technical Lead & Lead Full-Stack Developer at GOLI Company.\n\n"
            "Built a real-time web platform with live updates and voice streaming over WebSockets, secured with JWT login. "
            "Integrated Groq AI and Whisper, Fish Audio voice, Hotelogix bookings, FIUU payments, and Telavi click-to-call. "
            "Also responsible for testing, deployment, documentation, cost planning, and design implementation."
        ),
        category="ai",
        tags=["React 19", "Tailwind CSS", "FastAPI", "SQLAlchemy", "WebSockets", "Groq", "Whisper", "Fish Audio", "Supabase", "Vercel"],
        featured=True,
    ),
    dict(
        title="Body Cam Face Detection & Blurring",
        summary="Automatic face detection and blurring for body-cam footage, to protect people's privacy.",
        description="In progress at GOLI Company: integrating face detection with automatic blurring into body-cam footage.",
        category="ai",
        tags=["Computer vision", "Face detection", "Privacy"],
    ),
    dict(
        title="Hotel Scan-to-Order System",
        summary="Guests scan a QR code on the room TV to order and track their bill in real time.",
        description=(
            "Built during the Agentic AI Bootcamp of the Bayanaihan AI para sa Bayan program, where I was Team Leader & Lead Developer.\n\n"
            "Replaced phone-based room service with self-service ordering and full billing transparency."
        ),
        category="ai",
        tags=["Claude", "Qwen", "Qoder", "Workflow automation", "Agentic AI"],
        featured=True,
    ),
    dict(
        title="DamAiyan — AI for Rural Health Units",
        summary="An AI system that helps Rural Health Units manage healthcare services more efficiently.",
        description=(
            "Hackathon project from the AI Intensive Workshop. I was Backend Developer, AI Logic Developer & System Tester.\n\n"
            "Integrated four LLMs (Claude, DeepSeek, Qwen, GPT) using the PRIME Method for intelligent responses."
        ),
        category="ai",
        tags=["Claude", "DeepSeek", "Qwen", "GPT", "PRIME Method"],
    ),
    dict(
        title="BOTPOINTS — Bottle Recycling Rewards",
        summary="An IoT system that rewards proper plastic-bottle disposal with redeemable QR-based points.",
        description=(
            "Capstone project with the LGU of Galimuyod. I was Assistant Developer & Technical Writer."
        ),
        category="developer",
        tags=["JavaScript", "PHP", "MySQL", "Bootstrap", "IoT"],
        featured=True,
    ),
]

AIKO = "AIKO — AI Telephone Operator"
BODYCAM = "Body Cam Face Detection & Blurring"
HOTEL = "Hotel Scan-to-Order System"
DAMAIYAN = "DamAiyan — AI for Rural Health Units"
BOTPOINTS = "BOTPOINTS — Bottle Recycling Rewards"

# The skill tree. Each node: (name, level 0-100, description, project title it was earned in, children).
# A node unlocks after its parent; each list is the roots of one net. Levels are estimates: adjust them.
TREE = {
    "developer": [
        ("Frontend", 85, "React 19, Vite, Tailwind CSS, Radix UI, Framer Motion, TanStack Query, Zustand, Zod, Bootstrap.", AIKO, [
            ("React 19", 88, "Component architecture, real-time UIs and data fetching with TanStack Query and Zustand.", AIKO, []),
            ("Tailwind CSS", 85, "Design systems and responsive layouts built with Tailwind and Radix UI.", AIKO, []),
        ]),
        ("Python Backend", 85, "Python, FastAPI, SQLAlchemy, Alembic, Pydantic, JWT auth, plus PHP and JavaScript.", AIKO, [
            ("FastAPI", 85, "REST APIs with validation, migrations and JWT-secured login.", AIKO, []),
            ("WebSockets", 80, "Live updates and voice streaming in real time.", AIKO, []),
        ]),
        ("Data & DevOps", 75, "PostgreSQL (Supabase), MySQL, Docker, Podman, Vercel, Git & GitHub.", AIKO, [
            ("PostgreSQL", 75, "Relational data on Supabase.", AIKO, []),
            ("MySQL & PHP", 65, "Classic web stack used for the BOTPOINTS capstone.", BOTPOINTS, []),
        ]),
    ],
    "ai": [
        ("Agentic AI", 85, "Trained in agentic AI through the Bayanaihan AI para sa Bayan program.", HOTEL, [
            ("Prompt Engineering", 85, "Designing prompts and workflows that keep agents on task.", HOTEL, []),
            ("Workflow Automation", 80, "Automating multi-step flows with AI agents and APIs.", HOTEL, []),
        ]),
        ("LLM APIs", 85, "Groq, Claude, GPT, DeepSeek, Qwen, and local models with Ollama.", DAMAIYAN, [
            ("Multi-LLM Integration", 85, "Combined four LLMs (Claude, DeepSeek, Qwen, GPT) using the PRIME Method.", DAMAIYAN, []),
            ("Groq API", 80, "Fast LLM responses for a live phone assistant.", AIKO, []),
        ]),
        ("Voice & Vision", 70, "Speech and vision models for real-world products.", AIKO, [
            ("Speech AI", 75, "Whisper for speech-to-text and Fish Audio for voice.", AIKO, []),
            ("Face Detection", 55, "Detecting and blurring faces in body-cam footage (in progress).", BODYCAM, []),
        ]),
    ],
    "designer": [
        ("UI Design", 70, "Figma and Photoshop.", AIKO, [
            ("Figma", 70, "Interface design and handoff.", AIKO, []),
            ("Photoshop", 60, "Image editing and graphics.", None, []),
        ]),
        ("Design Implementation", 75, "Turning designs into polished, animated interfaces.", AIKO, [
            ("Framer Motion", 70, "Motion and interaction in React.", AIKO, []),
            ("Radix UI", 75, "Accessible UI primitives, styled to the design.", AIKO, []),
        ]),
    ],
    "professional": [
        ("Leadership", 80, "Leading teams and technical direction.", AIKO, [
            ("Technical Lead", 80, "Technical Lead on AIKO: architecture, testing, deployment and cost planning.", AIKO, []),
            ("Team Leadership", 80, "Led the team that built the Hotel Scan-to-Order system.", HOTEL, []),
        ]),
        ("Communication", 80, "English, Filipino and Ilocano.", BOTPOINTS, [
            ("Technical Writing", 75, "Wrote the documentation for the BOTPOINTS capstone.", BOTPOINTS, []),
            ("Documentation", 75, "Project documentation and handoff for AIKO.", AIKO, []),
        ]),
    ],
}


def _add_skills(db, nodes, category, parent_id, project_ids) -> None:
    for name, level, description, project_title, children in nodes:
        skill = Skill(
            name=name, level=level, category=category, description=description,
            parent_id=parent_id, project_id=project_ids.get(project_title),
        )
        db.add(skill)
        db.flush()  # assigns skill.id so children can reference it
        _add_skills(db, children, category, skill.id, project_ids)


def seed(reset: bool = False) -> None:
    """Fill empty tables. With reset=True, first replace all projects and skills (users and messages are kept)."""
    with SessionLocal() as db:
        if reset:
            db.execute(delete(Skill))
            db.execute(delete(Project))
            db.flush()
        if not db.scalar(select(User).limit(1)):
            db.add(User(email=settings.admin_email, hashed_password=hash_password(settings.admin_password)))
        if not db.scalar(select(Project).limit(1)):
            db.add_all(Project(**p) for p in PROJECTS)
        db.flush()
        if not db.scalar(select(Skill).limit(1)):
            project_ids = {p.title: p.id for p in db.scalars(select(Project))}
            for category, roots in TREE.items():
                _add_skills(db, roots, category, None, project_ids)
        db.commit()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
    print("Seeded." if "--reset" not in sys.argv else "Replaced projects and skills with the seed content.")
