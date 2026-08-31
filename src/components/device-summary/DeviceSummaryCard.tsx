import { MouseEvent } from "react";
import cn from "classnames";

import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";

import "./DeviceSummaryCard.css";

interface DeviceSummaryCardProps {
  device: MiotDeviceSummary;
  onClick?: (device: MiotDeviceSummary) => void;
}

function DeviceSummaryCard({ device, onClick }: DeviceSummaryCardProps) {
  const isClickable = !!onClick;

  function _handleClick(event: MouseEvent) {
    event.preventDefault();
    if (isClickable) onClick(device);
  }

  return (
    <div
      className={cn("device-summary", { clickable: isClickable })}
      onClick={_handleClick}
    >
      <a
        aria-disabled={!isClickable}
        tabIndex={isClickable ? 0 : -1}
        href={isClickable ? `#${device.model}` : undefined}
        className="card-title"
      >
        <code>{device.model}</code>
      </a>
    </div>
  );
}

export default DeviceSummaryCard;
