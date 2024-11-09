import searchDevices from "./api/miot-spec/searchDevices";

import "./App.css";

function App() {
  async function debugSearchDevice() {
    const devices = await searchDevices("mmgg.feeder.fi1");
    console.log(devices);
  }

  return (
    <>
      <h1>MIoT ➠ ESPHome</h1>
      <button onClick={() => debugSearchDevice()}>Test!</button>
    </>
  );
}

export default App;
