const lineCount = 34;

const waveLines = Array.from({ length: lineCount }, (_, index) => {
  const position = (index - (lineCount - 1) / 2) / ((lineCount - 1) / 2);
  const edge = 360 + position * 500;
  const shoulder = 360 + position * 380;
  const fold = 360 + position * 190;
  const channel = 360 + position * 18;

  return {
    accent: index % 6 === 0,
    delay: `${index * 18}ms`,
    d: [
      `M -80 ${edge.toFixed(2)}`,
      `C 110 ${edge.toFixed(2)}, 260 ${shoulder.toFixed(2)}, 430 ${shoulder.toFixed(2)}`,
      `C 555 ${shoulder.toFixed(2)}, 575 ${fold.toFixed(2)}, 650 ${(360 + position * 102).toFixed(2)}`,
      `C 704 ${(360 + position * 54).toFixed(2)}, 720 ${channel.toFixed(2)}, 760 ${channel.toFixed(2)}`,
    ].join(" "),
  };
});

function WaveBand({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <g className="hero-wave-band" transform={mirrored ? "translate(1600 0) scale(-1 1)" : undefined}>
      {waveLines.map((line, index) => (
        <path
          className={line.accent ? "hero-wave-line hero-wave-line-accent" : "hero-wave-line"}
          d={line.d}
          key={index}
          pathLength="1"
          style={{ animationDelay: line.delay }}
        />
      ))}
    </g>
  );
}

export function HeroWaveField() {
  return (
    <div className="hero-wave-field" aria-hidden="true">
      <svg
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1600 720"
        xmlns="http://www.w3.org/2000/svg"
      >
        <WaveBand />
        <WaveBand mirrored />
      </svg>
    </div>
  );
}
