export async function getUser() {
    const axios = require('axios');
    const response = await axios.get('/api/user');
    return response.data;
}