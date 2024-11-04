import { proxy } from "./utils";

/** 
 * Access permissions for a property.
 * describes how the property can be interacted with.
 */
const MiotAccess = {
    /** Property can be queried on-demand via `get_properties` command */
    Read: "read",
    /** Property can be changed via *some* of the following:
     * - `set_properties` command;
     * - `action` command.
     */
    Write: "write",
    /** Property changes will be updated by the MCU via *some* of the following:
     * - `properties_changed` message;
     * - `event_ocurred` message;
     * - `result` action response message.
     */
    Notify: "notify",
} as const;
type MiotAccess = typeof MiotAccess[keyof typeof MiotAccess];

const MiotFormat = {
    Bool: "bool",
    Float: "float",
    Int32: "int32",
    Int8: "int8",
    String: "string",
    UInt16: "uint16",
    UInt32: "uint32",
    UInt8: "uint8",
} as const;
type MiotFormat = typeof MiotFormat[keyof typeof MiotFormat];

/**
 * Possible values for a property.
 */
export interface MiotValueList {
    /** Value as sent to/from the MCU */
    value: number;
    /** Human-readable description */
    description: string;
}

/**
 * MiOT property specification.
 * 
 * Properties mainly represent the state of the device.
 * 
 * Additionally, properties can act as named input arguments for actions,
 * and outputs for actions or events, in which case they are not *usually* also 
 * directly queryable or settable.
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#get_properties
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#set_properties
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#action
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#properties_changed
 */
export interface MiotProperty {
    /** Property instance ID (`PIID`) */
    iid: number;
    /** Property URN */
    type: string;
    /** Property human-readable name */
    description: string;
    format: MiotFormat;
    access: MiotAccess[];
    /** Property unit label */
    unit?: string;
    /** Possible values for the property */
    "value-list"?: MiotValueList[];
    /** Property bounds and step size in `[min, max, step]` format */
    "value-range"?: [number, number, number];
}

/**
 * MiOT action specification.
 * 
 * Actions are commands that can be sent to the device to change its state.
 * 
 * An action may take properties as named input arguments, 
 * and return properties as named output arguments.
 * 
 * Usually, properties listed in action input/output lists can not be 
 * changed or queried directly.
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#action
 */
export interface MiotAction {
    /** Action instance ID (`AIID`) */
    iid: number;
    /** Action URN */
    type: string;
    /** Action human-readable name */
    description: string;
    /** Properties the action takes as inputs in the `action` command, *usually* those with `MiotAccess.Write`. */
    in: MiotProperty["iid"][];
    /** Properties the action returns in its `result` response, *usually* those with `MiotAccess.Read`. */
    out: MiotProperty["iid"][];
}

/**
 * MiOT event specification.
 * Represents a change in the device's state.
 * 
 * Events are emitted by the device as they occur.
 * 
 * https://github.com/blakadder/miot?tab=readme-ov-file#event_occured
 */
export interface MiotEvent {
    /** Event instance ID (`EIID`) */
    iid: number;
    /** Event URN */
    type: string;
    /** Event human-readable name */
    description: string;
    /** Properties the event emits, *usually* those with `MiotAccess.Notify`. */
    arguments: MiotProperty["iid"][];
}

/** 
 * MiOT service specification.
 * Controls a part of the device's functionality.
 * 
 * A service may have properties, actions, and events.
 */
export interface MiotService {
    /** Service instance ID (`SIID`) */
    iid: number;
    /** Service URN */
    type: string;
    /** Service human-readable name */
    description: string;
    /** Properties belonging to this service, or `undefined` if there are none. */
    properties?: MiotProperty[];
    /** Actions belonging to this service, or `undefined` if there are none. */
    actions?: MiotAction[];
    /** Events belonging to this service, or `undefined` if there are none. */
    events?: MiotEvent[];
}

/** 
 * MiOT device specification.
 * Exposes a list of services that the device supports.
 */
export interface MiotDevice {
    /** Device URN */
    type: string;
    /** Device human-readable name */
    description: string;
    /** Array of services exposed by the device */
    services: MiotService[];
}

export default async function getSpec(urn: string): Promise<MiotDevice> {
    const response = await proxy(`https://miot-spec.org/miot-spec-v2/instances?urn=${urn}`);
    return response.json();
}