import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";

/**
 * Returns true if a device is supported by `esphome-miot`, false otherwise.
 *
 * Note: This function is a work in progress and may not be accurate.
 */
export default function isDeviceSupported(device: MiotDeviceSummary): boolean {
  // Legacy `Miio` protocol devices are not supported by `esphome-miot` (yet?)
  if (device.protocolLabel === "MiIO") return false;

  // TODO: Check if there's a way to filter bluetooth/BLE only devices
  // TODO: Check if there's a way to tell if a device uses ESP chips

  return true;
}
