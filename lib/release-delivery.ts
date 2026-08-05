import { createSign } from "node:crypto";
import rawStoreCatalog from "../app/apps/store-catalog.json";

function cloudFrontSafe(value: string) {
  return value.replace(/\+/g, "-").replace(/=/g, "_").replace(/\//g, "~");
}

export type PublishedRelease = {
  slug: string;
  version: string;
  artifactFile: string;
  objectKey: string;
};

type ReleaseCatalog = { applications: PublishedRelease[] };
const storeCatalog = rawStoreCatalog as ReleaseCatalog;

export function publishedReleaseFor(slug: string): PublishedRelease | undefined {
  const record = storeCatalog.applications.find((entry) => entry.slug === slug);
  if (!record?.artifactFile || !record?.objectKey || !record?.version) return undefined;
  return record;
}

export function signedReleaseUrl(release: PublishedRelease, expiresInSeconds = 300) {
  const baseUrl = process.env.APP_RELEASE_CDN_URL?.replace(/\/$/, "");
  const keyPairId = process.env.APP_RELEASE_CLOUDFRONT_KEY_PAIR_ID;
  const privateKey = process.env.APP_RELEASE_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!baseUrl || !keyPairId || !privateKey) return undefined;

  const resource = `${baseUrl}/${release.objectKey.split("/").map(encodeURIComponent).join("/")}`;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const policy = JSON.stringify({ Statement: [{ Resource: resource, Condition: { DateLessThan: { "AWS:EpochTime": expires } } }] });
  const signer = createSign("RSA-SHA1");
  signer.update(policy);
  const signature = cloudFrontSafe(signer.sign(privateKey, "base64"));
  return `${resource}?Expires=${expires}&Signature=${signature}&Key-Pair-Id=${encodeURIComponent(keyPairId)}`;
}
