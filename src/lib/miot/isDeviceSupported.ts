import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";

/**
 * Protocols that can't run `esphome-miot`, keyed by the stable
 * home.miot-spec.com protocol slug.
 */
const UNSUPPORTED_PROTOCOLS: Record<string, string> = {
  // Note: `miio` is Xiaomi's raw protocol id 0 (generic Wi-Fi), which also
  // covers native MIoT devices, so it can't be used to detect legacy MiIO.
  // TODO: Detect legacy MiIO (`miio2miot`) devices once the catalogue exposes it.

  // No Wi-Fi module to replace with an ESP
  bluetooth: "Bluetooth-only device",
  "ble-mesh": "Bluetooth-only device",
  subdevice: "Gateway sub-device",
  "virtual-device": "Virtual device",
  "virtual-group": "Virtual device group",
  ir: "Virtual IR remote",
};

/**
 * Returns the reason a device is not supported by `esphome-miot`,
 * or `null` if it (probably) is.
 *
 * Note: This function is a work in progress and may not be accurate.
 */
export function getUnsupportedReason(device: MiotDeviceSummary): string | null {
  if (device.protocol && device.protocol in UNSUPPORTED_PROTOCOLS) {
    return UNSUPPORTED_PROTOCOLS[device.protocol];
  }

  if (device.specs.length === 0) {
    return "No MIoT specification available";
  }

  // TODO: Check if there's a way to tell if a device uses ESP chips

  return null;
}

/**
 * Returns true if a device is supported by `esphome-miot`, false otherwise.
 */
export default function isDeviceSupported(device: MiotDeviceSummary): boolean {
  return getUnsupportedReason(device) === null;
}
