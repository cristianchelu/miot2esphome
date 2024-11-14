import { ESPHomeDeviceClass } from "../esphome/types";

export type UnitTuple = [string | undefined, ESPHomeDeviceClass | undefined];

const UNIT_MAP: Record<string, UnitTuple> = {
  celsius: ["°C", "temperature"],
  percent: ["%", undefined],
  seconds: ["s", "duration"],
  minutes: ["m", "duration"],
  hours: ["h", "duration"],
  days: ["d", "duration"],
  none: [undefined, undefined],
};

export function parseUnit(unit?: string): UnitTuple {
  return unit && UNIT_MAP[unit] ? UNIT_MAP[unit] : [undefined, undefined];
}
