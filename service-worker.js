const CACHE_VERSION = "alkhii-v1.0.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./data/weapons.json",
    "./404.html"
];

/*=========================================================
INSTALL
=========================================================*/

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())

    );

});

/*=========================================================
ACTIVATE
=========================================================*/

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (
                        key !== STATIC_CACHE &&
                        key !== RUNTIME_CACHE
                    ) {
                        return caches.delete(key);
                    }

                })

            );

        }).then(() => self.clients.claim())

    );

});

/*=========================================================
FETCH
=========================================================*/

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== location.origin) {
        return;
    }

    /*-----------------------------
      HTML (Network First)
    -----------------------------*/

    if (
        event.request.mode === "navigate" ||
        event.request.destination === "document"
    ) {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    const clone = response.clone();

                    caches.open(RUNTIME_CACHE)
                        .then(cache => cache.put(event.request, clone));

                    return response;

                })

                .catch(() =>

                    caches.match(event.request)

                        .then(response => {

                            return (
                                response ||
                                caches.match("./index.html") ||
                                caches.match("./404.html")
                            );

                        })

                )

        );

        return;

    }

    /*-----------------------------
      Static Assets (Cache First)
    -----------------------------*/

    event.respondWith(

        caches.match(event.request)

            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200
                        ) {
                            return networkResponse;
                        }

                        const clone = networkResponse.clone();

                        caches.open(RUNTIME_CACHE)

                            .then(cache => {

                                cache.put(
                                    event.request,
                                    clone
                                );

                            });

                        return networkResponse;

                    })

                    .catch(() => {

                        if (
                            event.request.destination === "image"
                        ) {
                            return caches.match("./icons/icon-192.png");
                        }

                    });

            })

    );

});

/* End of service-worker.js */
