import Cookies from "js-cookie";

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
    const csrftoken = Cookies.get("csrftoken");
    const axios = require('axios');
    
    return axios.delete('/api/account/'+id, {
        headers: { "X-CSRFToken": csrftoken }
    })
}