import "./DeviceSummaryList.css";

function DeviceSummaryList({ children }: { children?: React.ReactNode }) {
  return <ul className="device-summary-list">{children}</ul>;
}

export default DeviceSummaryList;
