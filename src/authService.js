import axios from 'axios';

export async function getToken(payload) {
    try {
        return axios.post(
            `${global.authConfig.baseUrl}/oauth/v2/oauth/token`,
            payload
        );
    } catch (error) {
        throw new Error(error);
    }
}

export async function getUserProfile(token) {
    try {
        const headers = {
            'Content-type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
        return axios.get(`${global.authConfig.baseUrl}/oauth/v2/profile`, {
            headers,
        });
    } catch (error) {
        throw new Error(error);
    }
}
