import { useState } from "react";
import searchDevices, {
  MiotDeviceSummary,
} from "../../api/miot-spec/searchDevices";

import Button from "../button/Button";
import Input from "../input/Input";
import DeviceSummaryCard from "../device-summary/DeviceSummaryCard";
import DeviceSummaryList from "../device-summary/DeviceSummaryList";

import SearchIcon from "../../icons/search.svg?react";
import LoadingIcon from "../../icons/loading.svg?react";

import "./App.css";

const modelStringRegex =
  /(?<brand>[a-zA-Z0-9]+)\.(?<type>[a-zA-Z0-9]+)\.(?<model>[a-zA-Z0-9]+)/;

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
        <form className="searchbar" onSubmit={debugSearchDevice}>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="brand.type.model"
            // pattern={modelStringRegex.source}
          />
          <Button disabled={isSearchDisabled} className="icon" type="submit">
            {loading ? <LoadingIcon /> : <SearchIcon />}
          </Button>
        </form>
        <DeviceSummaryList>
          {devices.map((device) => (
            <li key={device.model}>
              <DeviceSummaryCard device={device} onClick={setSelectedDevice} />
            </li>
          ))}
        </DeviceSummaryList>
      </aside>
      <main></main>
    </>
  );
}

export default App;
