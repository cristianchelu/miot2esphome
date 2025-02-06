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
  const isClickable = !isUnsupported && !!onClick;

  function _handleClick(event: React.MouseEvent) {
    event.preventDefault();
    if (isClickable) onClick(device);
  }

  return (
    <div
      className={cn("device-summary", {
        unsupported: isUnsupported,
        clickable: isClickable,
      })}
      onClick={_handleClick}
    >
      <img src={device.icon_real} alt={device.name} loading="lazy" />
      <div className="card-content">
        <a
          aria-disabled={isClickable}
          tabIndex={isClickable ? 0 : -1}
          href={isClickable ? `#${device.model}` : undefined}
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
