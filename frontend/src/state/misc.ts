import {proxy, useProxy} from "valtio";

export const miscProxy = proxy<{
    htmlRootRef: any,
}>({
    htmlRootRef: null,
})

export const useHtmlRoot = () => {
    const ref = useProxy(miscProxy).htmlRootRef
    return ref
}