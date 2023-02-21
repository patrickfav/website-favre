export function escapeForFileName(name, date) {
    const escaped = encodeURI(
        name
            .replace(/ /g, '-')
            .replace(/\//g, '_')
            .replace(/:/g, '_')
            .replace(/&#39;/g, '') //Apostroph
            .replace(/'/g, '')
            .replace(/&#x2026;/g, '_') //Horizontal Ellipsis
            .replace(/…/g, '_')
            .replace(/\[/g, '_')
            .replace(/]/g, '_')
            .replace(/__/g, '_')
    ).toLowerCase();
    return {
        safeName: escaped,
        safeNameWithDate: date.toISOString().split("T")[0] + "-" + escaped
    }
}