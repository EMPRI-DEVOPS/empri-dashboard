function getCsrfToken() {
    const cookies = require('js-cookie');
    return cookies.get("csrftoken");
}

export default {
    async getUser() {
        const axios = require('axios');
        const response = await axios.get('/api/user');
        return response.data;
    },
    async patchUser(data) {
        const axios = require('axios');
        const response = await axios.patch('/api/user', data, {
            headers: {
                "X-CSRFToken": getCsrfToken()
            }
        })
        return response.data;
    }
}