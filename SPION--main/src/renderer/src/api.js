const API = "http://127.0.0.1:8000";



async function get(endpoint) {
    const res = await fetch(`${API}${endpoint}`);
    return await res.json();
}

async function post(endpoint, body = null) {
    const options = {
        method: "POST"
    };

    if (body) {
        options.headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };

        options.body = new URLSearchParams(body);
    }

    const res = await fetch(`${API}${endpoint}`, options);

    return await res.json();
}

export default {
    get,
    post
};