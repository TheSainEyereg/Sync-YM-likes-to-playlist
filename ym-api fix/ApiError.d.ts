declare class ApiError extends Error {
    constructor(error: {
        name: string;
        message: string;
    });
}
export default ApiError;
