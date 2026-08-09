import React, { useEffect, useState } from "react";

import searchDevices, {
  MiotDeviceSummary,
} from "../../api/miot-spec/searchDevices";
import getDeviceVersions from "../../api/miot-spec/getDeviceVersions";
import getSpec, { MiotDevice } from "../../api/miot-spec/getSpec";

import parseSpec from "../../lib/miot/parseSpec";
import { EspModule } from "../../lib/esp/modules";

import Button from "../button/Button";
import CopyButton from "../copy-button/CopyButton";
import DeviceSummaryCard from "../device-summary/DeviceSummaryCard";
import EspModulePicker from "../esp-module-picker/EspModulePicker";
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
  const [miotDevice, setMiotDevice] = useState<MiotDevice | null>(null);
  const [spec, setSpec] = useState<string | null>(null);

  const [espModule, setEspModule] = useState<EspModule | null>(null);
  const [rxPin, setRxPin] = useState<number | null>(null);
  const [txPin, setTxPin] = useState<number | null>(null);
  const [browsingModules, setBrowsingModules] = useState(false);

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
    if (!selectedDevice) {
      setMiotDevice(null);
      return;
    }

    let cancelled = false;
    const device = selectedDevice;

    (async function () {
      setMiotDevice(null);
      try {
        const specs =
          device.specs.length > 0
            ? device.specs
            : await getDeviceVersions(device.model, device.specHref);
        if (cancelled) return;

        const urn = specs[specs.length - 1]?.type;
        if (!urn) {
          throw new Error(`No MiOT URN found for ${device.model}`);
        }

        const response = await getSpec(urn);
        if (cancelled) return;
        setMiotDevice(response);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setMiotDevice(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDevice]);

  useEffect(() => {
    if (!selectedDevice || !miotDevice) {
      setSpec(null);
      return;
    }

    setSpec(
      parseSpec(selectedDevice, miotDevice, {
        module: espModule,
        rxPin,
        txPin,
      })
    );
  }, [selectedDevice, miotDevice, espModule, rxPin, txPin]);

  const isSearchDisabled = /* !modelStringRegex.test(search) ||  */ loading;

  function resetEspConfig() {
    setEspModule(null);
    setRxPin(null);
    setTxPin(null);
    setBrowsingModules(false);
  }

  function handleDeviceSelect(device: MiotDeviceSummary) {
    resetEspConfig();
    setSelectedDevice(device);
  }

  function handlePinsChange(rx: number | null, tx: number | null) {
    setRxPin(rx);
    setTxPin(tx);
  }

  const handleBackClick = () => {
    setSelectedDevice(null);
    setMiotDevice(null);
    setSpec(null);
    resetEspConfig();
  };

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
      onClick={handleDeviceSelect}
    />
  ));

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
            <div
              className={
                browsingModules ? "device-config browsing" : "device-config"
              }
            >
              {!browsingModules && (
                <DeviceSummaryCard device={selectedDevice} />
              )}
              <EspModulePicker
                module={espModule}
                rxPin={rxPin}
                txPin={txPin}
                browsing={browsingModules}
                onBrowsingChange={setBrowsingModules}
                onModuleChange={setEspModule}
                onPinsChange={handlePinsChange}
              />
              {!browsingModules && spec && <CopyButton spec={spec} />}
            </div>
          ) : (
            searchResults
          )}
        </Sidebar.Body>
        {browsingModules ? null : (
          <Sidebar.Footer>
            <AppTitle />
            <AppFooter />
          </Sidebar.Footer>
        )}
      </Sidebar>
      <main>{spec ? <YamlView yaml={spec} /> : <Instructions />}</main>
    </>
  );
}

export default App;
