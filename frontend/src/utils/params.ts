import queryString from "querystring";

export const isAutoJoin = () => {
    const parsed = queryString.parse(window.location.search);
    return !!parsed['autoJoin'] || !!parsed['?autoJoin']
}

export const isDebug = () => {
    const parsed = queryString.parse(window.location.search);
    return !!parsed['debug'] || !!parsed['?debug']
}

export const isAnonSignin = () => {
    const parsed = queryString.parse(window.location.search);
    return !!parsed['anon'] || !!parsed['?anon']
}
