import "server-only";

import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
} from "@azure/storage-blob";

import type { MarketplaceV12Release } from "./ai-marketplace-delivery";
import { productionAzureStorageAccessToken } from "./production-runtime-secrets";

export const MARKETPLACE_V12_AZURE_STORAGE_ACCOUNT = "stobserramktv1238d660";
export const MARKETPLACE_V12_AZURE_RELEASE_CONTAINER = "marketplace-v12-release";
const MAX_SAS_SECONDS = 300;
const CLOCK_SKEW_MS = 60_000;

function validObjectKey(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._/-]*\.zip$/.test(value)
    && value.split("/").every((part) => part !== "." && part !== "..");
}

function expectedMetadata(input: { release: MarketplaceV12Release; productId: string; revision: string }) {
  return {
    artifact_sha256: input.release.artifactSha256,
    catalog_revision: input.revision,
    product_id: input.productId,
  };
}

export async function marketplaceV12SignedAzureReleaseUrl(input: {
  release: MarketplaceV12Release;
  productId: string;
  revision: string;
}) {
  if (!validObjectKey(input.release.objectKey)) return null;
  const serviceUrl = `https://${MARKETPLACE_V12_AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`;
  const credential = {
    async getToken() {
      const token = await productionAzureStorageAccessToken();
      return token ? { token, expiresOnTimestamp: Date.now() + MAX_SAS_SECONDS * 1000 } : null;
    },
  };

  try {
    const service = new BlobServiceClient(serviceUrl, credential);
    const blob = service
      .getContainerClient(MARKETPLACE_V12_AZURE_RELEASE_CONTAINER)
      .getBlobClient(input.release.objectKey);
    const properties = await blob.getProperties();
    const metadata = properties.metadata ?? {};
    const expected = expectedMetadata(input);
    if (
      properties.contentLength !== input.release.byteLength
      || properties.contentType !== "application/zip"
      || metadata.artifact_sha256 !== expected.artifact_sha256
      || metadata.catalog_revision !== expected.catalog_revision
      || metadata.product_id !== expected.product_id
    ) return null;

    const now = Date.now();
    const startsOn = new Date(now - CLOCK_SKEW_MS);
    const expiresOn = new Date(now + MAX_SAS_SECONDS * 1000);
    const delegationKey = await service.getUserDelegationKey(startsOn, expiresOn);
    const sas = generateBlobSASQueryParameters({
      containerName: MARKETPLACE_V12_AZURE_RELEASE_CONTAINER,
      blobName: input.release.objectKey,
      permissions: BlobSASPermissions.parse("r"),
      protocol: SASProtocol.Https,
      startsOn,
      expiresOn,
      contentType: "application/zip",
      contentDisposition: `attachment; filename=\"${input.release.artifactFile}\"`,
      cacheControl: "private,no-store",
    }, delegationKey, MARKETPLACE_V12_AZURE_STORAGE_ACCOUNT).toString();
    return `${blob.url}?${sas}`;
  } catch {
    return null;
  }
}
