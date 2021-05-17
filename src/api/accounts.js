function getCsrfToken() {
    const cookies = require('js-cookie');
    return cookies.get("csrftoken");
}

export default {
    async getAccounts() {
        const axios = require('axios');
        const response = await axios.get('/api/account');
        return response.data.results;
    },
    async getAccount(id) {
        const axios = require('axios');
        const response = await axios.get('/api/account/' + id);
        return response.data;
    },
    async deleteAccount(id) {
        const axios = require('axios');

        return axios.delete('/api/account/' + id, {
            headers: {
                "X-CSRFToken": getCsrfToken()
            }
        })
    },
    async createAccount(tool) {
        const axios = require('axios');
        const response = await axios.post('/api/account', {
            tool: tool
        }, {
            headers: {
                "X-CSRFToken": getCsrfToken()
            }
        })
        return response.data
    }
}