"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullUtilities = void 0;
exports.NullUtilities = {
    getOrThrow: (obj, errorMessage = "Unexpected null reference") => {
        if (obj) {
            return obj;
        }
        throw new Error(errorMessage);
    },
};
