import {proxy} from "valtio";
import FileSaver from "file-saver";

export const debugLogsProxy = proxy<{
    logs: string[]
}>({
    logs: [],
})

export const logConnectionMessage = (log: string, print: boolean = true) => {
    debugLogsProxy.logs.push(log)
    if (print) {
        console.log(log)
    }
}

export const exportDebugLogs = () => {
    const file = new File([debugLogsProxy.logs.join(`\n`)], "logs.txt", {type: "text/plain"});
    FileSaver.saveAs(file);
}