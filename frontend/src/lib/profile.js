// Content for the page, taken from Justin H. Sales' resume. Projects and skills live in the backend
// (see backend/app/seed.py, or manage projects at /admin); everything else on the page comes from here.
export const profile = {
  name: "Justin H. Sales",
  role: "Full-Stack Developer · AI Automation & Agentic AI",
  status: "Technical Lead @ GOLI", // shown in the boot log on the hero chip
  tagline: "I build AI-powered web systems end to end, from database to interface.",
  about: [
    "IT graduate who builds AI-powered web systems end to end. I'm currently technical lead at GOLI Company on AIKO, an AI telephone operator with voice and F&B ordering, and I'm building face detection with blurring for body-cam footage.",
    "I trained in agentic AI through the Bayanaihan AI para sa Bayan program, and I work in English, Filipino and Ilocano.",
  ],
  email: "justinsales76@gmail.com",
  location: "Philippines",
  socials: {
    github: "https://github.com/Kuro262004",
    linkedin: "https://linkedin.com/in/sales-justin-h-8808a7257",
  },
  languages: ["English", "Filipino", "Ilocano"],
  // pct drives the gauge (0-100); value is the text shown.
  stats: [
    { label: "Projects built", value: "5", pct: 50 },
    { label: "LLM APIs integrated", value: "5", pct: 70 },
    { label: "Languages spoken", value: "3", pct: 45 },
  ],
  // The changelog: newest first.
  experience: [
    {
      version: "v3.0",
      role: "Technical Lead & Lead Full-Stack Developer",
      company: "GOLI Company",
      period: "Present",
      summary:
        "Leading the build of AIKO, an AI telephone operator that takes F&B orders by chat and voice, and integrating face detection with automatic blurring into body-cam footage. I handle testing, deployment, documentation, cost planning and design implementation.",
    },
    {
      version: "v2.0",
      role: "Agentic AI Bootcamp & AI Intensive Workshop",
      company: "Bayanaihan AI para sa Bayan (OJT)",
      period: "5-day bootcamp + 3-day workshop",
      summary:
        "Led the team building the Hotel Scan-to-Order system, and built the backend and AI logic for DamAiyan, a hackathon project for Rural Health Units.",
    },
    {
      version: "v1.0",
      role: "BS Information Technology, Web and Mobile Development",
      company: "Ilocos Sur Polytechnic State College, Candon Campus",
      period: "Graduated May 2026",
      summary: "Capstone: BOTPOINTS, an IoT bottle-recycling rewards system built with the LGU of Galimuyod.",
    },
  ],
  certifications: [
    { title: "Cybersecurity and Ethical Hacking", issuer: "Great Eastern Hotel, Quezon City", date: "Nov 2024" },
    { title: "Basic Java Programming", issuer: "DICT Pangasinan", date: "Oct 2023" },
  ],
};

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "developer", label: "Developer" },
  { id: "designer", label: "Designer" },
  { id: "professional", label: "Professional" },
];

// One signal color per net (class): used for powered traces, nodes, chips and project covers.
export const CATEGORY_COLORS = {
  developer: "#38e8ff",
  ai: "#b388ff",
  designer: "#ff6bd6",
  professional: "#ffd447",
};

export const CLASS_INFO = {
  ai: { label: "AI", blurb: "Agents, LLMs and voice." },
  developer: { label: "Developer", blurb: "Builds the machine." },
  designer: { label: "Designer", blurb: "Shapes how it feels." },
  professional: { label: "Professional", blurb: "Leads and delivers." },
};
