"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = __importDefault(require("./ApiError"));
class HttpClient {
    async _sendRequestAxios(method, request) {
        var _a;
        const axiosRequest = {
            method,
            url: request.getURL(),
            headers: request.getHeaders(),
            data: {},
        };
        if (["PUT", "POST", "DELETE", "PATCH"].includes(method.toUpperCase())) {
            axiosRequest.data = request.getBodyDataString();
            axiosRequest.headers = {
                ...axiosRequest.headers,
                ...{ "content-type": "application/x-www-form-urlencoded" },
            };
        }
        try {
            const { data } = await axios_1.default(axiosRequest);
            if (data.result) {
                return data.result;
            }
            else {
                return data;
            }
        }
        catch (e) {
            if ((_a = e.response.data) === null || _a === void 0 ? void 0 : _a.error) {
                throw new ApiError_1.default(e.response.data.error);
            }
            else {
                throw new Error(`Request failed: ${e.message}`);
            }
        }
    }
    get(request) {
        return this._sendRequestAxios("get", request);
    }
    post(request) {
        return this._sendRequestAxios("post", request);
    }
}
exports.default = HttpClient;
