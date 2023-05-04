import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LoggerService {
    log(message: string, context?: string) {
        // Handle log here
        Logger.log(message, context);
    }
    warn(message: string, context?: string) {
        Logger.warn(message, context);
    }
    error(message: string, context?: string) {
        // Add winston here
        Logger.error(message, context);
    }
    debug(message: string, context?: string) {
        Logger.debug(message, context);
    }
    verbose(message: string, context?: string) {
        Logger.verbose(message, context);
    }
}