function getCsrfToken() {
    const cookies = require('js-cookie');
    return cookies.get("csrftoken");
}

export async function getAccounts() {
    const axios = require('axios');
    const response = await axios.get('/api/account');
    return response.data.results;
}

export async function getAccount(id) {
    const axios = require('axios');
    const response = await axios.get('/api/account/' + id);
    return response.data;
}

export async function deleteAccount(id) {
    const axios = require('axios');

    return axios.delete('/api/account/' + id, {
        headers: {
            "X-CSRFToken": getCsrfToken()
        }
    })
}

export async function createAccount(tool) {
    const axios = require('axios');

    return axios.post('/api/account', {
        tool: tool
    }, {
        headers: {
            "X-CSRFToken": getCsrfToken()
        }
    })
}