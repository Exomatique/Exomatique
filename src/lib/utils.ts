export async function post(url: string, body?: any) {
    if (!url.startsWith("/")) throw new Error("Should not use utils if using relative api link");
    url = url.substring(1)
    return await fetch("/api/" + url, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'content-type': 'application/json'
        }
    }).then(async v => await v.json())
}

export async function get(url: string, body?: any) {
    if (!url.startsWith("/")) throw new Error("Should not use utils if using relative api link");
    url = url.substring(1)

    const params = body ? "?" + new URLSearchParams(body).toString() : "";
    return await fetch("/api/" + url + params, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    }).then(async v => await v.json())
}