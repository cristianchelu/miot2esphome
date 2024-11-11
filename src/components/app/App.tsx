import { useState } from "react";
import searchDevices, {
  SearchDeviceResponse,
} from "../../api/miot-spec/searchDevices";
import Button from "../button/Button";
import Input from "../input/Input";
import SearchIcon from "../../icons/search.svg?react";
import LoadingIcon from "../../icons/loading.svg?react";

import "./App.css";

const modelStringRegex =
  /(?<brand>[a-zA-Z0-9]+)\.(?<type>[a-zA-Z0-9]+)\.(?<model>[a-zA-Z0-9]+)/;

function App() {
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<SearchDeviceResponse[]>([]);
  const [loading, setLoading] = useState(false);

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

  const isSearchDisabled = !modelStringRegex.test(search) || loading;

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
            pattern={modelStringRegex.source}
          />
          <Button disabled={isSearchDisabled} className="icon" type="submit">
            {loading ? <LoadingIcon /> : <SearchIcon />}
          </Button>
        </form>
      </aside>
      <main></main>
    </>
  );
}

export default App;
