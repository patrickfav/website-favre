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
            .replace(/\?/g, '')
            .replace(/#/g, '_')
            .replace(/%/g, '_')
            .replace(/&/g, '_')
            .replace(/\*/g, '')
            .replace(/!/g, '')
            .replace(/\$/g, '')
            .replace(/,/g, '')
            .replace(/;/g, '')
            .replace(/___/g, '_')
            .replace(/__/g, '_')
            .replace(/---/g, '-')
            .replace(/--/g, '-')
            .replace(/_-/g, '-')
            .replace(/-_/g, '-')
    ).toLowerCase();
    return {
        safeName: escaped,
        safeNameWithDate: date.toISOString().split("T")[0] + "-" + escaped
    }
}