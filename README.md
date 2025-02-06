# MIoT to ESPHome conversion utility

This utility attempts to generate a plausible ESPHome configuration YAML
using the [`esphome-miot`](https://github.com/dhewg/esphome-miot) custom
component, based on the MIoT specification of a device.

All data is fetched by the browser from [miot-spec.com](https://home.miot-spec.com/)

[Open in GitHub Pages](https://cristianchelu.github.io/miot2esphome/)

# Caveats

- The `esphome-miot` component only works for devices with two separate MCUs.
  One ESP32/ESP8266 Chip handling WiFi (this configuration) and a separate
  chip handling the actual hardware.

- There is no way for this utility to know if a device is using an ESP chip,
  and will happily generate a configuration for any type of device.

- There is no guarantee that the generated configuration will work out of the
  box, if the specification is incomplete or incorrect.
