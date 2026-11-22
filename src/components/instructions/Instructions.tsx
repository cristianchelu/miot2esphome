import { AUTHOR, REPOSITORY } from "../../const";

import "./Instructions.css";

const Instructions = () => {
  return (
    <div className="instructions">
      <h1>Jump-start your conversion</h1>
      <p>
        This utility attempts to generate a plausible ESPHome configuration YAML
        using the{" "}
        <a href={`https://github.com/${AUTHOR}/${REPOSITORY}`}>
          <code>esphome-miot</code>
        </a>{" "}
        custom component, based on the MIoT specification of a device.
      </p>
      <h1>How to use</h1>
      <p>
        To get started, search for a device by name or model string (for
        example <code>zhimi.airpurifier.ma4</code>) using the search bar on the
        left;
      </p>
      <p>Click on a device to view the boilerplate config;</p>
      <p>
        Pick the ESP module that matches what you see on the board, and adjust
        the UART pins if needed;
      </p>
      <p>Use it as a starting point for your reverse engineering process.</p>
      <h1>Caveats</h1>
      <p>
        The <code>esphome-miot</code> component only works for devices with two
        separate MCUs. One ESP32/ESP8266 Chip handling WiFi (this configuration)
        and a separate chip handling the actual hardware.
      </p>
      <p>
        Bluetooth-only, gateway sub-devices and virtual devices are greyed out
        in the search results. Beyond that, there is no way for this utility to
        know if a device is using an ESP chip, and will happily generate a
        configuration for any other type of device.
      </p>
      <p>
        Device search, names and images are provided by the{" "}
        <a href="https://home.miot-spec.com/">home.miot-spec.com</a> community
        catalogue; specifications come from{" "}
        <a href="https://miot-spec.org/">miot-spec.org</a>.
      </p>
      <p>
        There is no guarantee that the generated configuration will work out of
        the box, if the specification is incomplete or incorrect.
      </p>
    </div>
  );
};

export default Instructions;
