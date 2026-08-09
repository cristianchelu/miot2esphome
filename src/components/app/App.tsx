import React, { useEffect, useState } from "react";

import searchDevices, {
  MiotDeviceSummary,
} from "../../api/miot-spec/searchDevices";
import getDeviceVersions from "../../api/miot-spec/getDeviceVersions";
import getSpec from "../../api/miot-spec/getSpec";

import parseSpec from "../../lib/miot/parseSpec";

import Button from "../button/Button";
import CopyButton from "../copy-button/CopyButton";
import DeviceSummaryCard from "../device-summary/DeviceSummaryCard";
import Instructions from "../instructions/Instructions";
import Input from "../input/Input";
import Sidebar from "../sidebar/Sidebar";
import YamlView from "../yaml-view/YamlView";

import SearchIcon from "../../icons/search.svg?react";
import LoadingIcon from "../../icons/loading.svg?react";

import "./App.css";

const AppTitle = () => <h1>MIoT ➠ ESPHome</h1>;
const AppFooter = () => (
  <>
    <p>
      view source on{" "}
      <a href="https://github.com/cristianchelu/miot2esphome">GitHub</a>
    </p>
    <p>
      data from <a href="https://home.miot-spec.com/">miot-spec.com</a>
    </p>
  </>
);

function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [devices, setDevices] = useState<MiotDeviceSummary[]>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<MiotDeviceSummary | null>(null);
  const [spec, setSpec] = useState<string | null>(null);

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

    let cancelled = false;

    (async function () {
      setSpec(null);
      try {
        const specs =
          selectedDevice.specs.length > 0
            ? selectedDevice.specs
            : await getDeviceVersions(
                selectedDevice.model,
                selectedDevice.specHref
              );
        if (cancelled) return;

        const urn = specs[specs.length - 1]?.type;
        if (!urn) {
          throw new Error(`No MiOT URN found for ${selectedDevice.model}`);
        }

        const response = await getSpec(urn);
        if (cancelled) return;
        setSpec(parseSpec({ ...selectedDevice, specs }, response));
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setSpec(null);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const handleBackClick = () => {
    setSelectedDevice(null);
    setSpec(null);
  };

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          {selectedDevice ? (
            <Button onClick={handleBackClick}>Back</Button>
          ) : (
            searchForm
          )}
        </Sidebar.Header>
        <Sidebar.Body>
          {selectedDevice ? (
            <>
              <DeviceSummaryCard device={selectedDevice} />
              {spec && <CopyButton spec={spec} />}
            </>
          ) : (
            searchResults
          )}
        </Sidebar.Body>
        <Sidebar.Footer>
          <AppTitle />
          <AppFooter />
        </Sidebar.Footer>
      </Sidebar>
      <main>{spec ? <YamlView yaml={spec} /> : <Instructions />}</main>
    </>
  );
}

export default App;
