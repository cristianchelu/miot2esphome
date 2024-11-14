const UNIT_MAP: Record<string, string | undefined> = {
  celsius: "°C",
  percent: "%",
  seconds: "s",
  minutes: "m",
  hours: "h",
  days: "d",
  none: undefined,
};

export default function prettifyUnit(unit?: string): string | undefined {
  return (unit && UNIT_MAP[unit]) ?? undefined;
}
