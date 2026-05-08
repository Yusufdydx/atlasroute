"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpUtilities = void 0;
exports.McpUtilities = {
    createTextResponse: (text, options = { isError: false }) => {
        return {
            content: [{ type: "text", text }],
            isError: options.isError,
        };
    },
};
