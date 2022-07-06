"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(error) {
        super();
        this.name = error.name || "unknown";
        this.message = error.message || "An unknown error has occurred";
    }
}
exports.default = ApiError;
