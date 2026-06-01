"use strict";

const CACHE_NAME = "surveying-exam-study-v3";
const PRECACHE_URLS = [
  "./",
  "./quiz/",
  "./.nojekyll",
  "./data/assets/question_03_table.png",
  "./data/assets/question_06_table.png",
  "./data/assets/question_07_figure_and_table.png",
  "./data/assets/question_09_table.png",
  "./data/assets/question_10_figure.png",
  "./data/assets/question_12_table.png",
  "./data/assets/question_13_figure.png",
  "./data/assets/question_21_map.png",
  "./data/assets/question_26_figure.png",
  "./data/assets/question_27_figure_and_table.png",
  "./data/assets/supplementary_function_table.png",
  "./data/exam.json",
  "./data/manifest.json",
  "./explanations/2025_R07/q01.html",
  "./explanations/2025_R07/q02.html",
  "./explanations/2025_R07/q03.html",
  "./explanations/2025_R07/q04.html",
  "./explanations/2025_R07/q05.html",
  "./explanations/2025_R07/q06.html",
  "./explanations/2025_R07/q07.html",
  "./explanations/2025_R07/q08.html",
  "./explanations/2025_R07/q09.html",
  "./explanations/2025_R07/q10.html",
  "./explanations/2025_R07/q11.html",
  "./explanations/2025_R07/q12.html",
  "./explanations/2025_R07/q13.html",
  "./explanations/2025_R07/q14.html",
  "./explanations/2025_R07/q15.html",
  "./explanations/2025_R07/q16.html",
  "./explanations/2025_R07/q17.html",
  "./explanations/2025_R07/q18.html",
  "./explanations/2025_R07/q19.html",
  "./explanations/2025_R07/q20.html",
  "./explanations/2025_R07/q21.html",
  "./explanations/2025_R07/q22.html",
  "./explanations/2025_R07/q23.html",
  "./explanations/2025_R07/q24.html",
  "./explanations/2025_R07/q25.html",
  "./explanations/2025_R07/q26.html",
  "./explanations/2025_R07/q27.html",
  "./explanations/2025_R07/q28.html",
  "./explanations/styles.css",
  "./home.css",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./index.html",
  "./manifest.webmanifest",
  "./quiz/app.js",
  "./quiz/index.html",
  "./quiz/styles.css",
  "./register-sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
