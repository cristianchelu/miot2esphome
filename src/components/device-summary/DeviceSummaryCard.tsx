import cn from "classnames";

import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";
import isDeviceSupported from "../../lib/miot/isDeviceSupported";

import "./DeviceSummaryCard.css";

interface DeviceSummaryCardProps {
  device: MiotDeviceSummary;
  onClick?: (device: MiotDeviceSummary) => void;
}

function DeviceSummaryCard({ device, onClick }: DeviceSummaryCardProps) {
  const isUnsupported = !isDeviceSupported(device);

  function _handleClick(event: React.MouseEvent) {
    event.preventDefault();
    onClick?.(device);
  }

  return (
    <div
      className={cn("device-summary", {
        unsupported: isUnsupported,
      })}
      onClick={_handleClick}
    >
      <img src={device.icon_real} alt={device.name} />
      <div className="card-content">
        <a
          aria-disabled={isUnsupported}
          tabIndex={isUnsupported ? -1 : 0}
          href={isUnsupported ? undefined : `#${device.model}`}
          className="card-title"
        >
          {device.name}
        </a>
        <div className="card-subtitle">
          <code>{device.model}</code>
        </div>
      </div>
    </div>
  );
}

export default DeviceSummaryCard;
