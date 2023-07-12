interface configObj {
  headers?: {
    "User-Agent"?: string;
    "Content-Type"?: string;
  };
  params?: { [k: string]: string };
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
}

export async function fetchItem(baseUrl: string, config: configObj) {
  var url = baseUrl;

  if (config.params) {
    url += "?";
    for (var [key, value] of Object.entries(config.params)) {
      url += `${key}=${value}&`;
    }
    url = url.slice(0, -1);
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 120 * 1000);

  console.log(url, config.method, config.body);

  const response = await fetch(url, {
    method: config.method ?? "GET",
    body: JSON.stringify(config.body),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Response failed: error code ${response.status}\n${response}`);
  }

  return response;
}
