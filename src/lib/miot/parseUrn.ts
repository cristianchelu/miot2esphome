interface URN {
    urn: string;
    spec_version: string;
    type: string;
    id: string;
    serial: string;
    device: string;
    version: string;
}

export default function parseUrn(urn: string): URN {
    const parts = urn.split(":");
    return {
        urn: parts[0],
        spec_version: parts[1],
        type: parts[2],
        id: parts[3],
        serial: parts[4],
        device: parts[5],
        version: parts[6],
    }
}