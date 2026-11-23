"use client";

import { Archivo_Narrow } from "next/font/google";
import { FluidParticleText } from "@workspace/ui/components/fluid-particle-text";

/* Reference fixture: Archivo Narrow 700, true viewport-filling stage.
   Fidelity is judged here — detached from the docs column layout. */
const archivoNarrow = Archivo_Narrow({ weight: "700", subsets: ["latin"] });

export default function FluidParticleTextDemoPage() {
  return (
    <main
      className={archivoNarrow.className}
      style={{
        width: "100vw",
        height: "100svh",
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <FluidParticleText
        preset="showcase"
        text="INK"
        fontFamily={archivoNarrow.style.fontFamily}
        className="h-full w-full"
        style={{ height: "100%", minHeight: "100vh" }}
      />
    </main>
  );
}
