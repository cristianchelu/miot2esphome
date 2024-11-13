import { useState } from "react";
import searchDevices, {
  MiotDeviceSummary,
} from "../../api/miot-spec/searchDevices";

import Button from "../button/Button";
import Input from "../input/Input";
import DeviceSummaryCard from "../device-summary/DeviceSummaryCard";

import SearchIcon from "../../icons/search.svg?react";
import LoadingIcon from "../../icons/loading.svg?react";

import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [devices, setDevices] = useState<MiotDeviceSummary[]>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<MiotDeviceSummary | null>(null);

  async function debugSearchDevice(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    try {
      const response = await searchDevices(search);
      setDevices(response);
      console.log(response);
    } finally {
      setLoading(false);
    }
  }

  const isSearchDisabled = /* !modelStringRegex.test(search) ||  */ loading;

  return (
    <>
      <aside>
        <h1>MIoT ➠ ESPHome</h1>
        <form id="device-search" onSubmit={debugSearchDevice}>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search device..."
          />
          <Button disabled={isSearchDisabled} className="icon" type="submit">
            {loading ? <LoadingIcon /> : <SearchIcon />}
          </Button>
        </form>
        <div className="list-container">
          <div className="device-summary-list" tabIndex={-1}>
            {devices.map((device) => (
              <DeviceSummaryCard
                key={device.model}
                device={device}
                onClick={setSelectedDevice}
              />
            ))}
          </div>
        </div>
        <p className="disclaimer">
          All data from{" "}
          <a href={`https://home.miot-spec.com/s/${search}`}>miot-spec.com</a>
        </p>
      </aside>
      <main></main>
    </>
  );
}

export default App;
