import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-white">
      <div
        className="absolute z-0"
        style={{ top: "300px", inset: "auto 0 0 0" }}
      >
        <img
          src="/hero.jpg"
          alt=""
          className="h-full w-full object-cover"
          style={{
            opacity: 0.55,
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          }}
        />
      </div>

      <section
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: "calc(8rem - 75px)", paddingBottom: "10rem" }}
      >
        <h1
          className="animate-fade-rise max-w-7xl font-normal text-5xl sm:text-7xl md:text-8xl"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            lineHeight: 0.95,
            letterSpacing: "-2.46px",
            color: "#000000",
          }}
        >
          Beyond{" "}
          <em className="italic" style={{ color: "#000000" }}>
            the recipe,
          </em>{" "}
          we cook{" "}
          <em className="italic" style={{ color: "#000000" }}>
            the unforgettable.
          </em>
        </h1>

        <p
          className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: "#000000" }}
        >
          Built for curious cooks, bold makers, and patient palates. Through the
          chaos of weeknight dinners, we craft a calm space for honest food and
          slow rituals.
        </p>

        <Link
          href="/recipes"
          className="animate-fade-rise-delay-2 mt-12 inline-block rounded-full px-14 py-5 text-base transition-transform hover:scale-[1.03]"
          style={{ background: "#000000", color: "#FFFFFF" }}
        >
          Begin Cooking
        </Link>
      </section>
    </main>
  );
}
