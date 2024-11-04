import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import searchDevices from './api/miot-spec/searchDevices'

function App() {

  async function debugSearchDevice() {
    const devices = await searchDevices("mmgg.feeder.fi1");
    console.log(devices);
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => debugSearchDevice()}>
          Test!
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
