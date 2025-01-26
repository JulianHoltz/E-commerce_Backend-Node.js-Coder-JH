import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Obtiene el directorio del archivo dado su URL.
 * @param {string} metaUrl - La URL del archivo (import.meta.url).
 * @returns {string} - El directorio del archivo.
 */


export const getDirname = (metaUrl) => {
    const __filename = fileURLToPath(metaUrl);
    return path.dirname(__filename);
};
