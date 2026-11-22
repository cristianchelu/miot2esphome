/**
 * IDs ESPHome refuses because they clash with C++ keywords or symbols.
 *
 * Copied from `RESERVED_IDS` in `esphome/config_validation.py` (2026.5.1).
 */
// prettier-ignore
const RESERVED_IDS = [
  "alarm", "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand",
  "bitor", "bool", "break", "case", "catch", "char", "char16_t", "char32_t",
  "class", "clock", "compl", "concept", "const", "constexpr", "const_cast",
  "continue", "decltype", "default", "delete", "do", "double", "dynamic_cast",
  "else", "enum", "explicit", "export", "extern", "false", "float", "for",
  "friend", "goto", "if", "inline", "int", "long", "mutable", "namespace",
  "new", "noexcept", "not", "not_eq", "nullptr", "operator", "or", "or_eq",
  "private", "protected", "public", "register", "reinterpret_cast", "requires",
  "return", "short", "signed", "sizeof", "static", "static_assert",
  "static_cast", "struct", "switch", "template", "text", "this",
  "thread_local", "throw", "true", "try", "typedef", "typeid", "typename",
  "union", "unsigned", "using", "virtual", "void", "volatile", "wchar_t",
  "while", "xor", "xor_eq", "App", "pinMode", "delay", "delayMicroseconds",
  "digitalRead", "digitalWrite", "INPUT", "OUTPUT", "uint8_t", "uint16_t",
  "uint32_t", "uint64_t", "int8_t", "int16_t", "int32_t", "int64_t", "close",
  "pause", "sleep", "open", "setup", "loop", "spi0", "spi1", "uart0", "uart1",
  "uart2", "crc16_be", "crc16_le", "crc32_be", "crc32_le", "crc8_be",
  "crc8_le", "dbg_state", "debug_timer", "one_bits", "recv_packet",
  "send_packet", "check_pos", "software_reset",
];

/**
 * ESPHome also refuses an ID that matches the name of a loaded integration.
 * These are the ones a generated config loads, plus the ones users
 * commonly add (Wi-Fi, OTA, time, web server, status LED).
 */
// prettier-ignore
const INTEGRATION_NAMES = [
  "api", "binary_sensor", "button", "captive_portal", "esp32", "esp8266",
  "esphome", "event", "external_components", "json", "logger", "md5", "mdns",
  "miot", "network", "noise", "number", "ota", "preferences", "safe_mode",
  "script", "select", "sensor", "sha256", "socket", "status", "status_led",
  "switch", "text_sensor", "time", "uart", "web_server", "web_server_base",
  "wifi",
];

const UNAVAILABLE_IDS = new Set<string>([
  ...RESERVED_IDS,
  ...INTEGRATION_NAMES,
  "miot_main",
]);

/** Returns true if ESPHome would reject `id`, or it is already used. */
export function isUnavailableId(id: string): boolean {
  return UNAVAILABLE_IDS.has(id);
}
