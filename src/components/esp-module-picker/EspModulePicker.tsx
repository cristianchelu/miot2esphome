import cn from "classnames";

import {
  ESP_MODULES,
  EspModule,
  UartPreset,
  createCustomEspModule,
} from "../../lib/esp/modules";
import Button from "../button/Button";
import Input from "../input/Input";

import "./EspModulePicker.css";

export type EspModulePickerProps = {
  module: EspModule | null;
  rxPin: number | null;
  txPin: number | null;
  browsing: boolean;
  onBrowsingChange: (browsing: boolean) => void;
  onModuleChange: (module: EspModule) => void;
  onPinsChange: (rx: number | null, tx: number | null) => void;
};

function matchingPreset(
  module: EspModule,
  rxPin: number | null,
  txPin: number | null
): UartPreset | undefined {
  if (rxPin == null || txPin == null) return undefined;
  return module.uartPresets.find(
    (preset) => preset.rx === rxPin && preset.tx === txPin
  );
}

function ModuleThumb({ module }: { module?: EspModule | null }) {
  if (module?.imageUrl) {
    return <img src={module.imageUrl} alt="" loading="lazy" />;
  }

  return (
    <div className="esp-module-thumb-placeholder" aria-hidden="true">
      ?
    </div>
  );
}

function EspModulePicker({
  module,
  rxPin,
  txPin,
  browsing,
  onBrowsingChange,
  onModuleChange,
  onPinsChange,
}: EspModulePickerProps) {
  const activePreset = module ? matchingPreset(module, rxPin, txPin) : undefined;
  const catalogOptions = ESP_MODULES.filter(
    (candidate) => candidate.id !== module?.id
  );
  const showCustomOption = !module?.isCustom;

  function selectModule(next: EspModule) {
    onModuleChange(next);
    const first = next.uartPresets[0];
    if (first) onPinsChange(first.rx, first.tx);
    else onPinsChange(null, null);
    onBrowsingChange(false);
  }

  function selectPreset(preset: UartPreset) {
    onPinsChange(preset.rx, preset.tx);
  }

  function handlePinChange(which: "rx" | "tx", raw: string) {
    if (raw === "") {
      if (which === "rx") onPinsChange(null, txPin);
      else onPinsChange(rxPin, null);
      return;
    }
    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value)) return;
    if (which === "rx") onPinsChange(value, txPin);
    else onPinsChange(rxPin, value);
  }

  function handleCustomPlatform(platform: "esp32" | "esp8266") {
    onModuleChange(
      createCustomEspModule({
        platform,
        board: module?.isCustom ? module.board : undefined,
      })
    );
  }

  function handleCustomBoard(board: string) {
    if (!module?.isCustom) return;
    onModuleChange(
      createCustomEspModule({
        platform: module.platform,
        board,
        framework: module.framework,
      })
    );
  }

  return (
    <div className={cn("esp-module-picker", { browsing })}>
      <button
        type="button"
        className={cn("esp-module-summary", "clickable", "picker-trigger", {
          expanded: browsing,
          empty: !module,
        })}
        onClick={() => onBrowsingChange(!browsing)}
        aria-expanded={browsing}
      >
        <ModuleThumb module={module} />
        <div className="card-content">
          {module ? (
            <>
              <span className="card-title">{module.name}</span>
              <div className="card-subtitle">
                <code>{module.board}</code>
              </div>
            </>
          ) : (
            <>
              <span className="card-title">Pick ESP module</span>
              <div className="card-subtitle">
                <span className="picker-hint">
                  Match the module on your board
                </span>
              </div>
            </>
          )}
        </div>
      </button>

      {browsing && (
        <div className="esp-module-list" aria-label="ESP modules">
          {catalogOptions.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={cn("esp-module-summary", "clickable")}
              onClick={() => selectModule(candidate)}
            >
              <ModuleThumb module={candidate} />
              <div className="card-content">
                <span className="card-title">{candidate.name}</span>
                <div className="card-subtitle">
                  <code>{candidate.board}</code>
                </div>
              </div>
            </button>
          ))}
          {showCustomOption && (
            <button
              type="button"
              className={cn("esp-module-summary", "clickable")}
              onClick={() => selectModule(createCustomEspModule())}
            >
              <ModuleThumb />
              <div className="card-content">
                <span className="card-title">Other / Custom</span>
                <div className="card-subtitle">
                  <span className="picker-hint">
                    Not listed — set board &amp; pins yourself
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {!browsing && module && (
        <div className="esp-uart-pins">
          {module.isCustom && (
            <div className="esp-custom-fields">
              <div className="esp-uart-presets">
                <Button
                  type="button"
                  variant={module.platform === "esp32" ? "primary" : "ghost"}
                  className="esp-uart-preset"
                  onClick={() => handleCustomPlatform("esp32")}
                >
                  ESP32
                </Button>
                <Button
                  type="button"
                  variant={module.platform === "esp8266" ? "primary" : "ghost"}
                  className="esp-uart-preset"
                  onClick={() => handleCustomPlatform("esp8266")}
                >
                  ESP8266
                </Button>
              </div>
              <label>
                <span>ESPHome board</span>
                <Input
                  type="text"
                  value={module.board}
                  onChange={(e) => handleCustomBoard(e.target.value)}
                  placeholder="e.g. esp32dev"
                />
              </label>
            </div>
          )}

          {module.uartPresets.length > 0 && (
            <div className="esp-uart-section">
              <div className="esp-uart-label">Common UART assignments</div>
              <div
                className={cn("esp-uart-presets", {
                  column: module.uartPresets.length > 2,
                })}
              >
                {module.uartPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={
                      activePreset?.id === preset.id ? "primary" : "ghost"
                    }
                    className="esp-uart-preset"
                    onClick={() => selectPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {module.isCustom && (
            <div className="esp-uart-section">
              <div className="esp-uart-label">UART pins</div>
              <div className="esp-uart-inputs">
                <label>
                  <span>RX</span>
                  <Input
                    type="number"
                    min={0}
                    value={rxPin ?? ""}
                    placeholder="GPIO"
                    onChange={(e) => handlePinChange("rx", e.target.value)}
                  />
                </label>
                <label>
                  <span>TX</span>
                  <Input
                    type="number"
                    min={0}
                    value={txPin ?? ""}
                    placeholder="GPIO"
                    onChange={(e) => handlePinChange("tx", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EspModulePicker;
