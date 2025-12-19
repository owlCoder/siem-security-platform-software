import fs from "fs";
import path from "path"; 

const STATE_FILE_PATH = path.join(__dirname, "queryState.json");
// koristimo fajl queryState.json za cuvanje stanja pri gasenju servisa
// kako bismo mogli da nastavimo od poslednjeg procesiranog event-a i 
// i da ne moramo ponovo da pravimo inverted indeks strukturu od pocetka
// u ovom fajlu cuvamo lastProcessedId, invertedIndex i eventTokenMap

export function loadQueryState(): {
    lastProcessedId: number;
    invertedIndex: Map<string, Set<number>>,
    eventTokenMap: Map<number, string[]>,
    eventCount: number,
    infoCount: number,
    warningCount: number,
    errorCount: number
} {
    if (!fs.existsSync(STATE_FILE_PATH)) {
        return {
            lastProcessedId: 0,
            invertedIndex: new Map<string, Set<number>>(),
            eventTokenMap: new Map<number, string[]>(),
            eventCount: 0,
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

    const eventTokenMap = new Map<number, string[]>();
    for (const key of Object.keys(parsedData.eventTokenMap)) {
        eventTokenMap.set(Number(key), parsedData.eventTokenMap[key]);
    }

    return {
        lastProcessedId: parsedData.lastProcessedId || 0,
        invertedIndex,
        eventTokenMap,
        eventCount: parsedData.eventCount || 0,
        infoCount: parsedData.infoCount || 0,
        warningCount: parsedData.warningCount || 0,
        errorCount: parsedData.errorCount || 0
    };
}

export function saveQueryState(state: {
    lastProcessedId: number;
    invertedIndex: Map<string, Set<number>>,
    eventTokenMap: Map<number, string[]>,
    eventCount: number,
    infoCount: number,
    warningCount: number,
    errorCount: number
}) {
    const serialized = {
        lastProcessedId: state.lastProcessedId,
        invertedIndex: Object.fromEntries(
            Array.from(state.invertedIndex.entries())
                .map(([key, value]) => [key, Array.from(value)])),
        eventTokenMap: Object.fromEntries(state.eventTokenMap),
        eventCount: state.eventCount,
        infoCount: state.infoCount,
        warningCount: state.warningCount,
        errorCount: state.errorCount   
    };

    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(serialized, null, 2), 'utf-8');
}