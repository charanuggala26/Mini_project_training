export function handleApiError(error, action) {

    console.error("API Error:", error);

    if (error.response) {
        return `Unable to ${action}. Server returned an error.`;
    }

    return `Unable to ${action}. Make sure JSON Server is running.`;
}