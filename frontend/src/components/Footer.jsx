import { Link } from "react-router-dom";
import { profile } from "../lib/profile";

export default function Footer() {
  return (
    <footer className="border-t-2 border-copper-dark bg-board-950 text-sm text-silk/60">
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-8">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React &amp; FastAPI.{" "}
          <span className="font-display text-xs uppercase tracking-widest text-signal-lime">GND</span>
        </p>
        <Link to="/admin" className="hover:text-signal-lime">
          Admin
        </Link>
      </div>
    </footer>
  );
}
