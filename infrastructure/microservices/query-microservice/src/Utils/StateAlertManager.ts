import path from "path";
import fs from "fs";

const STATE_FILE_PATH = path.join(__dirname, "queryAlertState.json");
// koristimo fajl queryAlertState.json za cuvanje stanja pri gasenju servisa
// kako bismo mogli da nastavimo od poslednjeg procesiranog alert-a i 
// i da ne moramo ponovo da pravimo inverted indeks strukturu od pocetka
// u ovom fajlu cuvamo lastProcessedId, invertedIndex i alertTokenMap

export function loadQueryAlertState(): {
    lastProcessedId: number;
    invertedIndex: Map<string, Set<number>>,
    alertTokenMap: Map<number, string[]>,
    alertCount: number,
    infoCount: number,
    warningCount: number,
    errorCount: number
} {
    if (!fs.existsSync(STATE_FILE_PATH)) {
        return {
            lastProcessedId: 0,
            invertedIndex: new Map<string, Set<number>>(),
            alertTokenMap: new Map<number, string[]>(),
            alertCount: 0,
            infoCount: 0,
            warningCount: 0,
            errorCount: 0
        };
    }

    const rawData = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    const parsedData = JSON.parse(rawData);

    const invertedIndex = new Map<string, Set<number>>();
    for (const key of Object.keys(parsedData.invertedIndex)) {
        invertedIndex.set(key, new Set(parsedData.invertedIndex[key]));
    }

    const alertTokenMap = new Map<number, string[]>();
    for (const key of Object.keys(parsedData.eventTokenMap)) {
        alertTokenMap.set(Number(key), parsedData.eventTokenMap[key]);
    }

    return {
        lastProcessedId: parsedData.lastProcessedId || 0,
        invertedIndex,
        alertTokenMap,
        alertCount: parsedData.eventCount || 0,
        infoCount: parsedData.infoCount || 0,
        warningCount: parsedData.warningCount || 0,
        errorCount: parsedData.errorCount || 0
    };
}

export function saveQueryAlertState(state: {
    lastProcessedId: number;
    invertedIndex: Map<string, Set<number>>,
    alertTokenMap: Map<number, string[]>,
    alertCount: number,
    infoCount: number,
    warningCount: number,
    errorCount: number
}) {
    const serialized = {
        lastProcessedId: state.lastProcessedId,
        invertedIndex: Object.fromEntries(
            Array.from(state.invertedIndex.entries())
                .map(([key, value]) => [key, Array.from(value)])),
        eventTokenMap: Object.fromEntries(state.alertTokenMap),
        eventCount: state.alertCount,
        infoCount: state.infoCount,
        warningCount: state.warningCount,
        errorCount: state.errorCount   
    };

    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(serialized, null, 2), 'utf-8');
}