export function logger(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        default:
            console.log(logMessage);
    }
}

export function logRequest(method: string, path: string, statusCode: number, duration: number) {
    logger(`${method} ${path} - ${statusCode} (${duration}ms)`);
}
