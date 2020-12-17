export const config = {
  backendUri: process.env["BACKEND_URI"] || "http://127.0.0.1:5000",
};

export const postJson = async function (path, data) {
  const uri = config.backendUri + path;
  const method = "POST";
  return fetch(uri, {
    method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());
};

export const get = async function (path) {
  const uri = config.backendUri + path;
  const method = "GET";
  return fetch(uri, {
    method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (r) => {
    if (r.ok) {
      return r.json()
    }
    throw await r.json()
  });
};

export const getStream = async function (path) {
  const uri = config.backendUri + path;
  const method = "GET";
  return fetch(uri, {
    method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.blob());
};
