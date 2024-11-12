import cn from "classnames";

import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";

import "./DeviceSummaryCard.css";

interface DeviceSummaryCardProps {
  device: MiotDeviceSummary;
  onClick?: (device: MiotDeviceSummary) => void;
}

function DeviceSummaryCard({ device, onClick }: DeviceSummaryCardProps) {
  const isUnsupported = device.hass_tags.includes("miio2miot");

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
        <a href={`#${device.model}`} className="card-title">
          {device.name}
        </a>
        <div className="card-subtitle">
          <code>{device.model}</code>
          {device.hass_tags.map((tag) => (
            <span className="hass-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeviceSummaryCard;
