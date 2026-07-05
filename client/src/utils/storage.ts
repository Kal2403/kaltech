const TOKEN_KEY = "kaltech_token";

export const storage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },
};
