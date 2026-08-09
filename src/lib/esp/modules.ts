const MODULE_IMAGE_BASE =
  "https://www.espressif.com/sites/default/files/modules";

export type UartPreset = {
  id: string;
  label: string;
  rx: number;
  tx: number;
};

export type EspModule = {
  id: string;
  name: string;
  platform: "esp32" | "esp8266";
  board: string;
  framework?: "esp-idf" | "arduino";
  /** Espressif product art URL; omit for custom / empty placeholder */
  imageUrl?: string;
  uartPresets: UartPreset[];
  /** Free-form board / platform entry */
  isCustom?: boolean;
};

/** Classic ESP32 (WROOM / WROVER / MINI / SOLO / PICO) */
const UART_ESP32: UartPreset[] = [
  { id: "uart2", label: "UART2 · GPIO16/17", rx: 16, tx: 17 },
  { id: "uart0", label: "UART0 · GPIO3/1", rx: 3, tx: 1 },
];

/** ESP32-C3 / ESP8685 */
const UART_C3: UartPreset[] = [
  { id: "uart0", label: "UART0 · GPIO20/21", rx: 20, tx: 21 },
  { id: "alt", label: "GPIO6/7", rx: 6, tx: 7 },
];

/** ESP32-S3 */
const UART_S3: UartPreset[] = [
  { id: "uart0", label: "UART0 · GPIO44/43", rx: 44, tx: 43 },
  { id: "alt", label: "GPIO17/18", rx: 17, tx: 18 },
];

/** ESP32-C6 */
const UART_C6: UartPreset[] = [
  { id: "uart0", label: "UART0 · GPIO17/16", rx: 17, tx: 16 },
  { id: "alt", label: "GPIO4/5", rx: 4, tx: 5 },
];

/** ESP8266 */
const UART_ESP8266: UartPreset[] = [
  { id: "uart0", label: "UART0 · GPIO3/1", rx: 3, tx: 1 },
  { id: "swap", label: "GPIO13/15", rx: 13, tx: 15 },
];

function moduleImage(filename: string) {
  return `${MODULE_IMAGE_BASE}/${filename}`;
}

function esp32(
  id: string,
  name: string,
  board: string,
  image: string,
  uartPresets: UartPreset[]
): EspModule {
  return {
    id,
    name,
    platform: "esp32",
    board,
    framework: "esp-idf",
    imageUrl: moduleImage(image),
    uartPresets,
  };
}

function esp8266(
  id: string,
  name: string,
  board: string,
  image: string
): EspModule {
  return {
    id,
    name,
    platform: "esp8266",
    board,
    imageUrl: moduleImage(image),
    uartPresets: UART_ESP8266,
  };
}

/**
 * Modules commonly found as the Wi‑Fi MCU in Xiaomi dual-MCU products.
 * Ordered by family for visual browsing; U = external antenna connector.
 */
export const ESP_MODULES: EspModule[] = [
  // —— Classic ESP32 ——
  esp32(
    "esp32-wroom-32",
    "ESP32-WROOM-32",
    "esp32dev",
    "ESP32-WROOM-32%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wroom-32d",
    "ESP32-WROOM-32D",
    "esp32dev",
    "ESP32-WROOM-32D%20S_0.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wroom-32e",
    "ESP32-WROOM-32E",
    "esp32dev",
    "ESP32-WROOM-32E%20S_0.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wroom-32u",
    "ESP32-WROOM-32U",
    "esp32dev",
    "ESP32-WROOM-32U%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wroom-32ue",
    "ESP32-WROOM-32UE",
    "esp32dev",
    "ESP32-WROOM-32UE%20S_0.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wrover-e",
    "ESP32-WROVER-E",
    "esp-wrover-kit",
    "ESP32-WROVER-E%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wrover-ie",
    "ESP32-WROVER-IE",
    "esp-wrover-kit",
    "ESP32-WROVER-IE%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-wrover-b",
    "ESP32-WROVER-B",
    "esp-wrover-kit",
    "ESP32-WROVER-B%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-mini-1",
    "ESP32-MINI-1",
    "esp32dev",
    "ESP32-MINI-1%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-mini-1u",
    "ESP32-MINI-1U",
    "esp32dev",
    "ESP32-MINI-1U%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-solo-1",
    "ESP32-SOLO-1",
    "esp32dev",
    "ESP32-SOLO-1%20S.png",
    UART_ESP32
  ),
  esp32(
    "esp32-pico-mini-02",
    "ESP32-PICO-MINI-02",
    "esp32dev",
    "ESP32-PICO-MINI-02%20S.png",
    UART_ESP32
  ),

  // —— ESP8266 ——
  esp8266("esp-wroom-02", "ESP-WROOM-02", "esp12e", "ESP-WROOM-02_S_1.png"),
  esp8266("esp-wroom-02d", "ESP-WROOM-02D", "esp12e", "ESP-WROOM-02D%20S.png"),
  esp8266("esp-wroom-02u", "ESP-WROOM-02U", "esp12e", "ESP-WROOM-02U%20S.png"),

  // —— ESP32-C3 / ESP8685 ——
  esp32(
    "esp32-c3-mini-1",
    "ESP32-C3-MINI-1",
    "esp32-c3-devkitm-1",
    "ESP32-C3-MINI-1%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp32-c3-mini-1u",
    "ESP32-C3-MINI-1U",
    "esp32-c3-devkitm-1",
    "ESP32-C3-MINI-1U%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp32-c3-wroom-02",
    "ESP32-C3-WROOM-02",
    "esp32-c3-devkitm-1",
    "ESP32-C3-WROOM-02%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp32-c3-wroom-02u",
    "ESP32-C3-WROOM-02U",
    "esp32-c3-devkitm-1",
    "ESP32-C3-WROOM-02U%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp8685-wroom-01",
    "ESP8685-WROOM-01",
    "esp32-c3-devkitm-1",
    "ESP8685-WROOM-01%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp8685-wroom-03",
    "ESP8685-WROOM-03",
    "esp32-c3-devkitm-1",
    "ESP8685-WROOM-03%20S_0.png",
    UART_C3
  ),
  esp32(
    "esp8685-wroom-06",
    "ESP8685-WROOM-06",
    "esp32-c3-devkitm-1",
    "ESP8685-WROOM-06%20S_0.png",
    UART_C3
  ),

  // —— ESP32-S3 ——
  esp32(
    "esp32-s3-wroom-1",
    "ESP32-S3-WROOM-1",
    "esp32-s3-devkitc-1",
    "ESP32-S3-WROOM-1%20S_0.png",
    UART_S3
  ),
  esp32(
    "esp32-s3-wroom-1u",
    "ESP32-S3-WROOM-1U",
    "esp32-s3-devkitc-1",
    "ESP32-S3-WROOM-1U%20S_0.png",
    UART_S3
  ),
  esp32(
    "esp32-s3-mini-1",
    "ESP32-S3-MINI-1",
    "esp32-s3-devkitc-1",
    "ESP32-S3-MINI-1%20S_0.png",
    UART_S3
  ),
  esp32(
    "esp32-s3-mini-1u",
    "ESP32-S3-MINI-1U",
    "esp32-s3-devkitc-1",
    "ESP32-S3-MINI-1U%20S_0.png",
    UART_S3
  ),

  // —— ESP32-C6 ——
  esp32(
    "esp32-c6-mini-1",
    "ESP32-C6-MINI-1",
    "esp32-c6-devkitc-1",
    "ESP32-C6-MINI-1%20S_0.png",
    UART_C6
  ),
  esp32(
    "esp32-c6-mini-1u",
    "ESP32-C6-MINI-1U",
    "esp32-c6-devkitc-1",
    "ESP32-C6-MINI-1U%20S_0.png",
    UART_C6
  ),
  esp32(
    "esp32-c6-wroom-1",
    "ESP32-C6-WROOM-1",
    "esp32-c6-devkitc-1",
    "ESP32-C6-WROOM-1%20S_0.png",
    UART_C6
  ),
];

export function createCustomEspModule(
  overrides: Partial<
    Pick<EspModule, "platform" | "board" | "framework">
  > = {}
): EspModule {
  const platform = overrides.platform ?? "esp32";
  return {
    id: "custom",
    name: "Other / Custom",
    platform,
    board: overrides.board ?? (platform === "esp8266" ? "esp12e" : "esp32dev"),
    framework:
      overrides.framework ?? (platform === "esp32" ? "esp-idf" : undefined),
    uartPresets: [],
    isCustom: true,
  };
}
