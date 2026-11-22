import { MouseEvent } from "react";
import cn from "classnames";

import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";
import { getUnsupportedReason } from "../../lib/miot/isDeviceSupported";
import ProtocolTag from "../protocol-tag/ProtocolTag";

import "./DeviceSummaryCard.css";

interface DeviceSummaryCardProps {
  device: MiotDeviceSummary;
  onClick?: (device: MiotDeviceSummary) => void;
}

function DeviceSummaryCard({ device, onClick }: DeviceSummaryCardProps) {
  const unsupportedReason = onClick ? getUnsupportedReason(device) : null;
  const isUnsupported = unsupportedReason !== null;
  const isClickable = !isUnsupported && !!onClick;

  function _handleClick(event: MouseEvent) {
    event.preventDefault();
    if (isClickable) onClick(device);
  }

  return (
    <div
      className={cn("device-summary", {
        unsupported: isUnsupported,
        clickable: isClickable,
      })}
      title={unsupportedReason ?? undefined}
      onClick={_handleClick}
    >
      <img src={device.image} alt={device.name} loading="lazy" />
      <div className="card-content">
        <a
          aria-disabled={!isClickable}
          tabIndex={isClickable ? 0 : -1}
          href={isClickable ? `#${device.model}` : undefined}
          className="card-title"
        >
          {device.name}
        </a>
        <div className="card-subtitle">
          <code>{device.model}</code>
          <ProtocolTag device={device} />
        </div>
      </div>
    </div>
  );
}

export default DeviceSummaryCard;
