const TOKEN_KEY = "kaltech_token";

export const AUTH_SESSION_CLEARED_EVENT = "kaltech:session-cleared";

export const storage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },
};

export const notifySessionCleared = () => {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
};
