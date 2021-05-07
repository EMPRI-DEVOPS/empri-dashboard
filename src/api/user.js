function getCsrfToken() {
    const cookies = require('js-cookie');
    return cookies.get("csrftoken");
}

export async function getUser() {
    const axios = require('axios');
    const response = await axios.get('/api/user');
    return response.data;
}

export async function patchUser(data) {
    const axios = require('axios');
    return axios.patch('/api/user', data, {
        headers: {
            "X-CSRFToken": getCsrfToken()
        }
    })
}