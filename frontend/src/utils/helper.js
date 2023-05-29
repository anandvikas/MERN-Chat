export const makeLongStringShort = (str, len) => {
    if (str.length > len) {
        str = str.slice(0, len) + "..."
    }
    return str
}