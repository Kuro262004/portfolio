import Hud from "../components/Hud";
import Board from "../components/Board";
import Hero from "../components/Hero";
import Character from "../components/Character";
import SkillTree from "../components/SkillTree";
import Projects from "../components/Projects";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hud />
      <Board>
        <main>
          <Hero />
          <Character />
          <SkillTree />
          <Projects />
          <Contact />
        </main>
      </Board>
    </>
  );
}
