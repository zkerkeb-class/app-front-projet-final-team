if(!self.define){let e,s={};const c=(c,a)=>(c=new URL(c+".js",a).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(a,i)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let t={};const r=e=>c(e,n),d={module:{uri:n},exports:t,require:r};s[n]=Promise.all(a.map((e=>d[e]||r(e)))).then((e=>(i(...e),t)))}}define(["./workbox-f52fd911"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/chunks/238-f6b1b8749f528095.js",revision:"f6b1b8749f528095"},{url:"/_next/static/chunks/272-a5b36c71a22d15e2.js",revision:"a5b36c71a22d15e2"},{url:"/_next/static/chunks/2d36dd80-0bf26a593c290db1.js",revision:"0bf26a593c290db1"},{url:"/_next/static/chunks/345.95c33457d46ed05b.js",revision:"95c33457d46ed05b"},{url:"/_next/static/chunks/454.fe6c5cbd9c341b4c.js",revision:"fe6c5cbd9c341b4c"},{url:"/_next/static/chunks/473-ec00c660702d3f8c.js",revision:"ec00c660702d3f8c"},{url:"/_next/static/chunks/553.2c450b99673be210.js",revision:"2c450b99673be210"},{url:"/_next/static/chunks/69.0893a719807e1755.js",revision:"0893a719807e1755"},{url:"/_next/static/chunks/913.39ccfc2aa6dd2384.js",revision:"39ccfc2aa6dd2384"},{url:"/_next/static/chunks/fb7d5399-28676460c15544b0.js",revision:"28676460c15544b0"},{url:"/_next/static/chunks/framework-a6b3d2fb26bce5d1.js",revision:"a6b3d2fb26bce5d1"},{url:"/_next/static/chunks/main-28cca47ff0f2afb3.js",revision:"28cca47ff0f2afb3"},{url:"/_next/static/chunks/pages/404-a0fa6a45994566f8.js",revision:"a0fa6a45994566f8"},{url:"/_next/static/chunks/pages/_app-1805c20891c23f0d.js",revision:"1805c20891c23f0d"},{url:"/_next/static/chunks/pages/_error-c81b8677656bf336.js",revision:"c81b8677656bf336"},{url:"/_next/static/chunks/pages/album/%5Bid%5D-ad3f5ca70fde7a09.js",revision:"ad3f5ca70fde7a09"},{url:"/_next/static/chunks/pages/artist-f72661175733aab0.js",revision:"f72661175733aab0"},{url:"/_next/static/chunks/pages/artist/%5Bid%5D-ca79e8a1e34d8614.js",revision:"ca79e8a1e34d8614"},{url:"/_next/static/chunks/pages/auth/login-cd585c64c58780c8.js",revision:"cd585c64c58780c8"},{url:"/_next/static/chunks/pages/auth/register-2a04439665000802.js",revision:"2a04439665000802"},{url:"/_next/static/chunks/pages/index-530250c2f3fa370e.js",revision:"530250c2f3fa370e"},{url:"/_next/static/chunks/pages/playlist/%5Bid%5D-c395762958155862.js",revision:"c395762958155862"},{url:"/_next/static/chunks/pages/playlists-f62af8acce9dda6d.js",revision:"f62af8acce9dda6d"},{url:"/_next/static/chunks/pages/profile-db58bf65c326258d.js",revision:"db58bf65c326258d"},{url:"/_next/static/chunks/pages/search-9d16e27d5b9c1adb.js",revision:"9d16e27d5b9c1adb"},{url:"/_next/static/chunks/pages/settings-1d1a736de4aff0be.js",revision:"1d1a736de4aff0be"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-f4031e52927f443f.js",revision:"f4031e52927f443f"},{url:"/_next/static/css/02ed8cebefe37068.css",revision:"02ed8cebefe37068"},{url:"/_next/static/xzm35iTo2LQn_lNbiInAe/_buildManifest.js",revision:"ec1a181aa054b16e46fb67505e27a8d8"},{url:"/_next/static/xzm35iTo2LQn_lNbiInAe/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/arcane.jpg",revision:"485631d865ba1eef5bb103d95e0e6827"},{url:"/clancy.jpg",revision:"93f188aa67ac31e17aa6d1c1556b847c"},{url:"/favicon.ico",revision:"646c6eb9789a6def94888d3bb7b39858"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/fromzero.jpeg",revision:"16ae3482c4a567d3998ddeb16d8a95d4"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/jvlivs3.jpg",revision:"d1dad9189fa9d1e4529a7e8b5af10768"},{url:"/locales/ar/common.json",revision:"dfea4b2c6b9750cb41c8ea380fc114be"},{url:"/locales/en/common.json",revision:"9c4a4ceeed5a7dd33a76ad1681bfe26d"},{url:"/locales/fr/common.json",revision:"7c94d13136d598b82b60dd0348880efc"},{url:"/manifest.json",revision:"134ba3015d0c52a4bdb40b8b02f1c9a1"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/the_line_top.m4a",revision:"9b5fe317b7b72f87c61708b2ba0c45ec"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"},{url:"/zakharmony-192.png",revision:"646c6eb9789a6def94888d3bb7b39858"},{url:"/zakharmony-512.png",revision:"d32ad6b4c27b09516168f935bd9c389a"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:c,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/d3cqeg6fl6kah\.cloudfront\.net\/.*/i,new e.CacheFirst({cacheName:"image-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:2592e3})]}),"GET")}));
