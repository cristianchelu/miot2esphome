import React, { useEffect, useState } from "react";
import searchDevices, {
  MiotDeviceSummary,
} from "../../api/miot-spec/searchDevices";

import Button from "../button/Button";
import Input from "../input/Input";
import DeviceSummaryCard from "../device-summary/DeviceSummaryCard";

import SearchIcon from "../../icons/search.svg?react";
import LoadingIcon from "../../icons/loading.svg?react";

import "./App.css";
import Sidebar from "../sidebar/Sidebar";
import YamlView from "../yaml-view/YamlView";
import getSpec, { MiotDevice } from "../../api/miot-spec/getSpec";
import parseSpec from "../../lib/miot/parseSpec";

const AppTitle = () => <h1>MIoT ➠ ESPHome</h1>;
const AppFooter = () => (
  <>
    data from <a href="https://home.miot-spec.com/">miot-spec.com</a>
  </>
);

function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [devices, setDevices] = useState<MiotDeviceSummary[]>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<MiotDeviceSummary | null>(null);
  const [spec, setSpec] = useState<MiotDevice | null>(null);

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

  useEffect(() => {
    if (!selectedDevice) return;

    (async function () {
      const response = await getSpec(
        selectedDevice.specs[selectedDevice.specs.length - 1].type
      );
      setSpec(response);
    })();
  }, [selectedDevice]);

  const isSearchDisabled = /* !modelStringRegex.test(search) ||  */ loading;

  const searchForm = (
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
  );
  const searchResults = devices.map((device) => (
    <DeviceSummaryCard
      key={device.model}
      device={device}
      onClick={setSelectedDevice}
    />
  ));
  const deviceRow = selectedDevice ? (
    <DeviceSummaryCard
      device={selectedDevice}
      onClick={() => {
        setSelectedDevice(null);
        setSpec(null);
      }}
    />
  ) : null;

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <AppTitle />
          {selectedDevice ? deviceRow : searchForm}
        </Sidebar.Header>
        <Sidebar.Body>{selectedDevice ? null : searchResults}</Sidebar.Body>
        <Sidebar.Footer>
          <AppFooter />
        </Sidebar.Footer>
      </Sidebar>
      <main>
        {spec && selectedDevice && (
          <YamlView yaml={parseSpec(selectedDevice, spec) as string} />
        )}
      </main>
    </>
  );
}

export default App;
