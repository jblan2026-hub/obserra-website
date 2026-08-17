const host = "www.obserrallc.com";
const siteUrl = `https://${host}`;
const key = "4f7a9c12d8e34b6fa2710c95e4bd7391";
const keyLocation = `${siteUrl}/${key}.txt`;
const sitemapUrl = `${siteUrl}/sitemap.xml`;

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1]?.trim())
    .filter((url) => url?.startsWith(`${siteUrl}/`) || url === siteUrl);
}

async function assertPublicKey() {
  const response = await fetch(keyLocation, {
    headers: { "user-agent": "Obserra-IndexNow/1.0" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`IndexNow key file returned HTTP ${response.status}.`);
  const body = (await response.text()).trim();
  if (body !== key) throw new Error("IndexNow key file content does not match the configured key.");
}

async function loadCanonicalUrls() {
  const response = await fetch(sitemapUrl, {
    headers: { "user-agent": "Obserra-IndexNow/1.0" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}.`);
  const urls = urlsFromSitemap(await response.text());
  if (!urls.length) throw new Error("No canonical URLs were found in the production sitemap.");
  if (urls.length > 10_000) throw new Error(`IndexNow batch exceeds the 10,000 URL limit: ${urls.length}.`);
  return [...new Set(urls)];
}

async function submit(urlList) {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "user-agent": "Obserra-IndexNow/1.0",
    },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  if (![200, 202].includes(response.status)) {
    const body = await response.text();
    throw new Error(`IndexNow returned HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  console.log(`IndexNow accepted ${urlList.length} canonical URLs with HTTP ${response.status}.`);
}

await assertPublicKey();
const urls = await loadCanonicalUrls();
await submit(urls);
