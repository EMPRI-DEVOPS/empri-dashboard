function getCsrfToken() {
    const cookies = require('js-cookie');
    return cookies.get("csrftoken");
}

export function changePassword(old_password, new_password1, new_password2) {
    const axios = require('axios');
    return axios.put('/auth/change_password', {
        old_password,
        new_password1,
        new_password2
    }, {
        headers: {
            "X-CSRFToken": getCsrfToken()
        }
    })
}