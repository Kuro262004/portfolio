/**
 * An IC package. Every page section is a chip: the Board routes a copper trace to its left pin and
 * powers it (lighting the LED and pins) when the scroll signal arrives.
 */
export function ChipFrame({ id, refdes, children, className = "" }) {
  return (
    <div className={`chip ${className}`} data-chip-body data-chip-id={id} data-ref={refdes}>
      <span className="chip-notch" aria-hidden="true" />
      <span className="chip-pin1" aria-hidden="true" />
      {children}
    </div>
  );
}

export default function Section({ id, refdes, label, title, children }) {
  return (
    <section id={id} className="relative scroll-mt-24 py-8 sm:py-12">
      <div className="container-page">
        <ChipFrame id={id} refdes={refdes}>
          <div className="p-5 pt-8 sm:p-8 sm:pt-10">
            <header className="mb-8 flex items-start justify-between gap-3">
              <div>
                <p className="silk">
                  {refdes} · {label}
                </p>
                <h2 className="etch mt-1 text-3xl sm:text-5xl">{title}</h2>
              </div>
              <span className="chip-led mt-1.5 shrink-0" role="img" aria-label="Power indicator: lights up when the signal reaches this chip" />
            </header>
            {children}
          </div>
        </ChipFrame>
      </div>
    </section>
  );
}
