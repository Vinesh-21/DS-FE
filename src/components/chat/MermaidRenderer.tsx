import mermaid from "mermaid";
import { useEffect, useRef } from "react";

let idCounter = 0;

export default function MermaidRenderer({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const id = `mermaid-${idCounter++}`;

    mermaid.initialize({ startOnLoad: false });

    ref.current.innerHTML = "";

    setTimeout(() => {
      mermaid.render(id, chart).then((res) => {
        if (ref.current) {
          ref.current.innerHTML = res.svg;
        }
      });
    }, 0);
  }, [chart]);

  return (
    <div className="w-full overflow-x-auto">
      <div ref={ref} className="min-w-[500px]" />
    </div>
  );
}
