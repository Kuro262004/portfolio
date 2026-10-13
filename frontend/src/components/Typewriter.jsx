import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Types the text out one character at a time. Screen readers get the full text immediately. */
export default function Typewriter({ text, className = "", speed = 70, startDelay = 300 }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let id;
    const start = setTimeout(() => {
      id = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, speed, startDelay, reduce]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span className="blink text-signal-lime">_</span>
      </span>
    </span>
  );
}
