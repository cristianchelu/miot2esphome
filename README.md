# MIoT to ESPHome conversion utility

This utility attempts to generate a plausible ESPHome configuration YAML
using the [`esphome-miot`](https://github.com/dhewg/esphome-miot) custom
component, based on the MIoT specification of a device.

All data is fetched by the browser: device search, names and images from the
[home.miot-spec.com](https://home.miot-spec.com/) community catalogue
([API](https://home.miot-spec.com/api)), and specifications from
[miot-spec.org](https://miot-spec.org/).

[Open in GitHub Pages](https://cristianchelu.github.io/miot2esphome/)

# Caveats

- The `esphome-miot` component only works for devices with two separate MCUs.
  One ESP32/ESP8266 Chip handling WiFi (this configuration) and a separate
  chip handling the actual hardware.

- We grey out devices we know are incompatible (Bluetooth-only, gateway
  sub-devices, virtual devices). For the rest, the spec doesn't say what's
  inside, so open it up and good luck.

- There is no guarantee that the generated configuration will work out of the
  box, if the specification is incomplete or incorrect.
