import { AUTHOR, REPOSITORY } from "../../const";

import BoardDiagram from "./BoardDiagram";

import "./Instructions.css";

const Instructions = () => {
  return (
    <div className="instructions">
      <header>
        <h1>Jump-start your conversion</h1>
        <p>
          Generate a starting ESPHome config for a Xiaomi device from its MIoT
          specification, using the{" "}
          <a href={`https://github.com/${AUTHOR}/${REPOSITORY}`}>
            <code>esphome-miot</code>
          </a>{" "}
          component.
        </p>
      </header>

      <figure>
        <BoardDiagram />
        <figcaption>
          <code>esphome-miot</code> only works on devices with two separate
          chips. The ESP32/ESP8266 handles Wi-Fi and runs this config, the MCU
          handles the actual hardware.
        </figcaption>
      </figure>

      <section>
        <h2>How to use</h2>
        <ol className="steps">
          <li>
            <span>
              Search for a device by name or model string, for example{" "}
              <code>zhimi.airpurifier.ma4</code>.
            </span>
          </li>
          <li>
            <span>Click a device to view its config.</span>
          </li>
          <li>
            <span>
              Pick the ESP module on your board and adjust the UART pins if
              needed.
            </span>
          </li>
          <li>
            <span>
              Use the config as a starting point for your reverse engineering.
            </span>
          </li>
        </ol>
      </section>

      <section>
        <h2>Caveats</h2>
        <ul className="caveats">
          <li>
            We grey out devices we know are incompatible (Bluetooth-only,
            gateway sub-devices, virtual devices). For the rest, the spec
            doesn't say what's inside, so open it up and good luck.
          </li>
          <li>
            The config may not work out of the box if the spec is incomplete or
            incorrect.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Instructions;
