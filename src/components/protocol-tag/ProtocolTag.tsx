import { ComponentType, SVGProps } from "react";

import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";

import BluetoothIcon from "../../icons/bluetooth.svg?react";
import CellTowerIcon from "../../icons/cell-tower.svg?react";
import CloudIcon from "../../icons/cloud.svg?react";
import DeployedCodeIcon from "../../icons/deployed-code.svg?react";
import ExtensionIcon from "../../icons/extension.svg?react";
import HubIcon from "../../icons/hub.svg?react";
import SettingsRemoteIcon from "../../icons/settings-remote.svg?react";
import WifiIcon from "../../icons/wifi.svg?react";

import "./ProtocolTag.css";

interface Protocol {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Display info for every protocol slug the home.miot-spec.com catalogue
 * returns. Unknown slugs fall back to the catalogue's own label, no icon.
 */
const PROTOCOLS: Record<string, Protocol> = {
  // `miio` is Xiaomi's protocol id 0, generic Wi-Fi rather than legacy MiIO
  miio: { label: "Wi-Fi", Icon: WifiIcon },
  wifi: { label: "Wi-Fi", Icon: WifiIcon },
  bluetooth: { label: "Bluetooth", Icon: BluetoothIcon },
  "ble-mesh": { label: "BLE Mesh", Icon: BluetoothIcon },
  subdevice: { label: "Sub-device", Icon: HubIcon },
  "virtual-device": { label: "Virtual", Icon: DeployedCodeIcon },
  "virtual-group": { label: "Virtual Group", Icon: DeployedCodeIcon },
  cloud: { label: "Cloud", Icon: CloudIcon },
  "third-device": { label: "Third Party", Icon: ExtensionIcon },
  "4g": { label: "4G", Icon: CellTowerIcon },
  "nb-iot": { label: "NB-IoT", Icon: CellTowerIcon },
  ir: { label: "IR", Icon: SettingsRemoteIcon },
};

interface ProtocolTagProps {
  device: MiotDeviceSummary;
}

function ProtocolTag({ device }: ProtocolTagProps) {
  const protocol = device.protocol ? PROTOCOLS[device.protocol] : undefined;
  const label = protocol?.label ?? device.protocolLabel;
  if (!label) {
    return null;
  }

  const Icon = protocol?.Icon;
  return (
    <small className="protocol-tag">
      {Icon && <Icon aria-hidden="true" />}
      {label}
    </small>
  );
}

export default ProtocolTag;
