/** Pin offsets along each side of the MCU package. */
const PINS = [59, 72, 85, 98, 111];
const PIN_X = [314, 327, 340, 353, 366];
const PERIPHERALS = [
  { y: 45, label: "Buttons" },
  { y: 85, label: "Sensors" },
  { y: 125, label: "Motors" },
];

const mcuPins = [
  ...PINS.map((y) => `M290 ${y}h10M380 ${y}h10`),
  ...PIN_X.map((x) => `M${x} 35v10M${x} 125v10`),
].join("");

/** ESP module talking UART to the MCU, which drives the hardware. */
const BoardDiagram = () => (
  <svg
    className="board-diagram"
    viewBox="0 0 572 170"
    role="img"
    aria-label="ESP32 or ESP8266 module connected over UART to an MCU, which drives buttons, sensors and motors"
  >
    <defs>
      <marker
        id="uart-arrow"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0L8 4L0 8z" fill="currentColor" />
      </marker>
    </defs>

    {/* ESP module: PCB antenna on top, shield can below */}
    <rect className="esp" x="8" y="20" width="184" height="130" rx="8" />
    <path
      className="antenna"
      d="M30 50V32h16v14h16V32h16v14h16V32h16v14h16V32h16v18"
    />
    <rect className="part" x="22" y="60" width="156" height="78" rx="4" />
    <text className="label" x="100" y="96">
      ESP32 / ESP8266
    </text>
    <text className="sub" x="100" y="120">
      this config
    </text>

    {/* UART, one line each way */}
    <path className="wire" d="M194 72H286" markerEnd="url(#uart-arrow)" />
    <path className="wire" d="M194 98H286" markerStart="url(#uart-arrow)" />
    <text className="tiny" x="240" y="90">
      UART
    </text>

    {/* MCU package */}
    <path className="wire" d={mcuPins} />
    <rect className="part" x="300" y="45" width="80" height="80" rx="4" />
    <circle className="dot" cx="311" cy="56" r="2.5" />
    <text className="label" x="340" y="90">
      MCU
    </text>

    {/* Hardware the MCU drives */}
    <path
      className="wire"
      d={`M390 85H420M420 45V125${PERIPHERALS.map(({ y }) => `M420 ${y}H452`).join("")}`}
    />
    {PERIPHERALS.map(({ y, label }) => (
      <g key={label}>
        <rect
          className="part"
          x="452"
          y={y - 15}
          width="112"
          height="30"
          rx="15"
        />
        <text className="sub" x="508" y={y + 5}>
          {label}
        </text>
      </g>
    ))}
  </svg>
);

export default BoardDiagram;
