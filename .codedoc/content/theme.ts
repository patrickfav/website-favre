import { funcTransport } from '@connectv/sdh/transport';
import { useTheme } from '@codedoc/core/transport';
import { createTheme } from '@codedoc/core/transport';

export function installTheme() { useTheme(theme); }
export const installTheme$ = /*#__PURE__*/funcTransport(installTheme);

export const theme = /*#__PURE__*/createTheme({
    light: {                       // --> color scheme for contenttecoxt in light-mode
        primary: '#cd6133'           // --> the primary color in light-mode (for links, buttons, etc.)
    },
    dark: {                        // --> color scheme for content in dark-mode
        primary: '#cc8e35'           // --> the primary color in dark-mode (for links, buttons, etc.)
    }
});