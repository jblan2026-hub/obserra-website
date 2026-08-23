import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextMiddleware, type NextRequest } from "next/server";
import { identityFromVerifiedClaims } from "./lib/auth/claims";
import { getInternalOwnerAuthorityFromProxyContext } from "./lib/auth/authority-repository";
import { evaluateInternalOwnerAuthorization } from "./lib/auth/identity-governance";
import { identityProviderForRequest } from "./lib/auth/provider-routing";
import { prepareSupabaseAuthRuntime } from "./lib/auth/runtime-config";
import { prepareClerkRuntime } from "./lib/clerk-runtime-config";
import { shouldServeDirectDeploymentHealth } from "./lib/direct-deployment-health-routing";
import {
  evaluateFloridaClassDMutationBoundary,
  floridaClassDMutationOriginAuthorized,
} from "./lib/florida-class-d-mutation-boundary";
import { floridaClassDProductionOwnerReviewExecutionAuthorized } from "./lib/florida-class-d-owner-preview";
import { isPreviewRuntime, isProductionRuntime } from "./lib/runtime-environment";
import { updateSupabaseAuthSession } from "./lib/supabase/proxy";

const CANONICAL_HOST = "www.obserrallc.com";
const DEFAULT_OWNER_ORIGIN = "https://owner.obserrallc.com";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";
const PRIVATE_NOINDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex";
const OWNER_PATH_PREFIXES = [
  "/command-center",
  "/owner-access",
  "/api/owner",
] as const;
const PROTECTED_PATH_PREFIXES = [
  "/api/apps",
  "/ai-marketplace/hangar",
  "/admin",
  "/portal",
  "/academy/admin",
  "/academy/learn",
  "/academy/certificate",
  "/command-center",
  "/florida-security-training/admin",
  "/florida-security-training/access",
  "/florida-security-training/enroll",
  "/florida-security-training/identity",
  "/florida-security-training/live",
  "/florida-security-training/exam",
  "/florida-security-training/makeup",
  "/florida-security-training/completion",
  "/florida-security-training/owner-preview",
  "/api/florida-class-d/admin",
  "/api/florida-class-d/owner-preview",
] as const;

let configuredClerkHandler: NextMiddleware | null = null;

function authenticationReady() {
  return prepareClerkRuntime().ready;
}

function ownerOrigin() {
  const configured = process.env.OBSERRA_OWNER_SITE_URL?.trim() || DEFAULT_OWNER_ORIGIN;
  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "")
    ) {
      return DEFAULT_OWNER_ORIGIN;
    }
    return url.origin;
  } catch {
    return DEFAULT_OWNER_ORIGIN;
  }
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isOwnerPath(pathname: string) {
  return OWNER_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function requiresAuthentication(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function requestHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  return (forwarded || request.headers.get("host") || "").toLowerCase().split(":")[0];
}

function isLocalHost(host: string | undefined) {
  return !host || host === "localhost" || host === "127.0.0.1";
}

function ownerHost() {
  return new URL(ownerOrigin()).hostname.toLowerCase();
}

function applyRouteSecurityHeaders(response: NextResponse, request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const host = requestHost(request);
  const isVercelPreviewHost = Boolean(host && host.endsWith(".vercel.app"));
  const privateApplicationsOperation = pathMatchesPrefix(pathname, "/api/apps");
  const ownerPath = isOwnerPath(pathname);

  if (!isProductionRuntime() && isVercelPreviewHost) {
    response.headers.set("X-Robots-Tag", PREVIEW_NOINDEX);
  }

  if (ownerPath || privateApplicationsOperation) {
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX);
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), display-capture=(), geolocçİx¶‰ËkºwµçVf–VBcã"6FÆörÂ&÷VæFVB6W'fW"6V&6‚ÂæB7F&ÆRFWF–Â&÷WFW2"Â7–æ2‚’Óâ°¢6öç7BvRÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6R÷vRçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7BÆöFW"Òv—B&VDf–ÆR†æWrU$Â‚"ââöÆ–"öÖ&¶WGÆ6R×c"Ö6FÆörçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B6V&6‚Òv—B&VDf–ÆR†æWrU$Â‚"ââöö’ö’ÖÖ&¶WGÆ6R÷6V&6‚÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7BFWF–ÂÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6Rõ·&öGV7D–EÒ÷vRçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B6FÆörÒ¥4ôâç'6R†wVç¦—7–æ2‡&VDf–ÆU7–æ2†æWrU$Â‚"ââöFFöÖ&¶WGÆ6Röö'6W'&ÖÖ&¶WGÆ6RÖ6&BÖ6FÆöræ§6öâæw¢"Â–×÷'BæÖWFçW&Â’’’çFõ7G&–ær‚'WFc‚"’“°¢76W'BæWVÂ†6FÆöræ6&G2æÆVæwF‚Â3“b“°¢76W'BæWVÂ†6FÆöræ6÷VçG2çF÷FÅö6&G2Â3“b“°¢76W'BæÖF6‚‡vRÂöÖ&¶WGÆ6Uc%7VÖÖ'’ò“°¢76W'BæÖF6‚‡vRÂöÖ&¶WGÆ6Uc%6V&6‚ò“°¢76W'BæFöW4æ÷DÖF6‚‡vRÂöÖ&¶WGÆ6R×&öGV7G5Âæ§6öâò“°¢76W'BæÖF6‚†ÆöFW"Âô'&•Âæ—4'&•Â‡'6VEÂæ6&G5Â’ò“°¢76W'BæÖF6‚†ÆöFW"ÂôÖF…ÂæÖ–åÂƒcò“°¢76W'BæÖF6‚‡6V&6‚ÂöÖ&¶WGÆ6Uc%6V&6‚ò“°¢76W'BæÖF6‚‡6V&6‚Âö7W'6÷"ò“°¢76W'BæÖF6‚†FWF–ÂÂöÖ&¶WGÆ6Uc%&öGV7Bò“°¢76W'BæÖF6‚†FWF–ÂÂõÂö’ÖÖ&¶WGÆ6UÂõÂEÇ¶6FÆöu&öGV7EÂç6ÇVuÇÒò“°¢76W'BæFöW4æ÷DÖF6‚‡vRÂö‡&VcÒ%Âö2"6Æ74æÖSÒ"â¦Ö&¶WGÆ6Rò“°§Ò“° §FW7B‚'cã"&öGV7BVFW7FÂæB7W7FöÖW"†æv"&W6VçB6FÆörwV–Fæ6Rv—F†÷WB–×Ç––ærgVÆf–ÆÆÖVçB"Â7–æ2‚’Óâ°¢6öç7BFWF–ÂÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6Rõ·&öGV7D–EÒ÷vRçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7BVFW7FÂÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6RôÖ&¶WGÆ6UVFW7FÂçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B†æv"Òv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6Rö†æv"÷vRçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B66W72Òv—B&VDf–ÆR†æWrU$Â‚"ââöö’ö’ÖÖ&¶WGÆ6Rö66W72÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B–ç7FÆÂÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ö’ÖÖ&¶WGÆ6Rö–ç7FÆÂÖw&çB÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7Bc$6†V6¶÷WBÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6RôÖ&¶WGÆ6Uc$6†V6¶÷WBçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢76W'BæÖF6‚†FWF–ÂÂôÖ&¶WGÆ6UVFW7FÂò“°¢76W'BæÖF6‚‡VFW7FÂÂô6FÆör×7WÆ–VBöffW"6ö×&—6öâò“°¢76W'BæÖF6‚‡VFW7FÂÂöFöW2æ÷B7&VFR6†V6¶÷WBÂVçF—FÆVÖVçBÂ–ç7FÆÆF–öâÂ÷"&W6W'fF–öâò“°¢76W'BæÖF6‚‡VFW7FÂÂõ&÷FV7FVBFVÆ—fW'’Væf–Æ&ÆRVçF–ÂVçF—FÆVÖVçBæB&VÆV6R6öçG&öÇ2&RfW&–f–VBò“°¢76W'BæÖF6‚‡VFW7FÂÂõÂö’ÖÖ&¶WGÆ6UÂö†æv"ò“°¢76W'BæÖF6‚††æv"ÂöÖ&¶WGÆ6Uc%&÷FV7FVDFVÆ—fW'”6öæf–wW&VBò“°¢76W'BæÖF6‚††æv"ÂöG–æÖ–2Ò&f÷&6RÖG–æÖ–2"ò“°¢76W'BæÖF6‚††æv"Â÷'VçF–ÖRÒ&æöFV§2"ò“°¢76W'BæÖF6‚††æv"ÂöVçF—FÆVÖVçBfÆ–FF–öâ—27F–ÆÂ&WV—&VBò“°¢76W'BæÖF6‚††æv"Âô–ç7FÆÆF–öâ'&–FvRò“°¢76W'BæÖF6‚††æv"ÂöWF…Â…Â’ò“°¢76W'BæÖF6‚†66W72ÂôWF†VçF–6F–öâ&WV—&VBò“°¢76W'BæÖF6‚†66W72Âö”Ö&¶WGÆ6UFVæçD–EÂ‡W6W$–BÂ÷&t–EÂ’ò“°¢76W'BæÖF6‚†66W72ÂöÖ&¶WGÆ6Uc$FVÆ—fW'”VçF—FÆVÖVçBò“°¢76W'BæFöW4æ÷DÖF6‚†66W72Â÷7G&—UÂæ7W7FöÖW'5Âæ7&VFRò“°¢76W'BæÖF6‚†–ç7FÆÂÂ÷6ÖT÷&–v–âò“°¢76W'BæÖF6‚†–ç7FÆÂÂöÖ&¶WGÆ6Uc$FVÆ—fW'”VçF—FÆVÖVçBò“°¢76W'BæÖF6‚†–ç7FÆÂÂô–ç7FÆÂ'&–FvRVæf–Æ&ÆRò“°¢76W'BæÖF6‚‡c$6†V6¶÷WBÂõ–÷R6â&Wf–Wr6FÆörW&6†6R÷F–öç2ò“°¢76W'BæÖF6‚‡c$6†V6¶÷WBÂöVçFW'&—6RV÷FRò“°¢76W'BæÖF6‚‡c$6†V6¶÷WBÂö'WGFöâG—SÒ'7V&Ö—B"F—6&ÆVBò“°¢76W'BæFöW4æ÷DÖF6‚‡c$6†V6¶÷WBÂöæÖSÒ'W&6†6T÷F–öâ"F—6&ÆVBò“°§Ò“° §FW7B‚&WfW'’Ö&¶WGÆ6RöffW&–ær&WV—&W2âW†7Bv÷fW&æVB–ÖVçB&–æF–ær"Â7–æ2‚’Óâ°¢6öç7B&–æF–æw2Òv—B&VDf–ÆR†æWrU$Â‚"ââöÆ–"ö’ÖÖ&¶WGÆ6R×–ÖVçBÖ&–æF–æw2çG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7Bc$&–æF–æw2Òv—B&VDf–ÆR†æWrU$Â‚"ââöÆ–"öÖ&¶WGÆ6R×c"Ö&–æF–æw2çG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B†VÇF‚Òv—B&VDf–ÆR†æWrU$Â‚"ââöö’ö’ÖÖ&¶WGÆ6Rö6öÖÖW&6RÖ†VÇF‚÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7B6†V6¶÷WBÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ö’ÖÖ&¶WGÆ6Rö6†V6¶÷WB÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢6öç7BvV&†öö²Òv—B&VDf–ÆR†æWrU$Â‚"ââöö’÷vV&†öö²÷7G&—RÖ’ÖÖ&¶WGÆ6R÷&÷WFRçG2"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢76W'BæÖF6‚†&–æF–æw2Â÷&WV—&VD&–ÆÆ–æt–çFW'fÇ2ò“°¢76W'BæÖF6‚†&–æF–æw2Âö&÷VæD”Ö&¶WGÆ6U&–6Rò“°¢76W'BæÖF6‚†&–æF–æw2Âö&÷VæE&öGV7G5ÂæÆVæwF‚ÓÓÒ&öGV7G5ÂæÆVæwF‚ò“°¢76W'BæÖF6‚††VÇF‚Âö’ÖÖ&¶WGÆ6RÖ6öÖÖW&6RÖ†VÇF‚×cò“°¢76W'BæÖF6‚‡c$&–æF–æw2ÂöÖ&¶WGÆ6Uc$6öÖÖW&6U7V&¦V7G2ò“°¢76W'BæÖF6‚‡c$&–æF–æw2Âö'F–f7E6†#SbÓÒ7V&¦V7EÂæ'F–f7E6†#Sbò“°¢76W'BæÖF6‚‡c$&–æF–æw2Â÷&WV—&VE&öGV7D6&G2ò“°¢76W'BæÖF6‚‡c$&–æF–æw2ÂöW‡V7FVDöffW$¶W—2ò“°¢76W'BæÖF6‚††VÇF‚ÂöÖ&¶WGÆ6Uc$&–æF–æt6÷fW&vRò“°¢76W'BæÖF6‚††VÇF‚Âö7F—fF–öä&Æö6¶VC¢G'VRò“°¢76W'BæÖF6‚†6†V6¶÷WBÂö6FÆör×c"Ö6öæf–wW&F–öâ×&WV—&VBò“°¢76W'BæÖF6‚†6†V6¶÷WBÂö6FÆöu&Wf—6–öâÓÖW‡V7FVBò“°¢76W'BæÖF6‚‡vV&†öö²Âöö'6W'&Ö’ÖÖ&¶WGÆ6R×c"ò“°¢76W'BæÖF6‚‡vV&†öö²Â÷c"&–æF–ærWf–FVæ6RVæf–Æ&ÆRò“°¢76W'BæÖF6‚‡vV&†öö²Â÷6W76–öåÂç–ÖVçE÷7FGW2ÓÒ'–B"ò“°¢76W'BæÖF6‚‡vV&†öö²Â÷&–6UÂæÆ—fVÖöFRÓÒÆ—fRò“°¢76W'BæÖF6‚‡vV&†öö²Â÷&öGV7EÂæÖWFFFÂæ'F–f7E6†#SbÓÓÒ'F–f7E6†#Sbò“°¢76W'BæÖF6‚‡vV&†öö²Â÷&öGV7EÂæÖWFFFÂæ&–æF–æt¶W’ÓÓÒ&–æF–æt¶W’ò“°§Ò“° §FW7B‚'6¶–ÆÂÆ–'&'’&÷WFR&W6VçG2F†Rf÷W"6&–Æ—G’ÆWfVÇ2æB6÷W&6R6¶vW2"Â7–æ2‚’Óâ°¢6öç7BvRÒv—B&VDf–ÆR†æWrU$Â‚"ââöö’ÖÖ&¶WGÆ6R÷6¶–ÆÂÖÆ–'&&–W2÷vRçG7‚"Â–×÷'BæÖWFçW&Â’Â'WFc‚"“°¢f÷"†6öç7BÆWfVÂöb²$&Vv–ææW""Â$–çFW&ÖVF–FR"Â$W‡W'B"Â$Gfæ6VB%Ò’76W'BæÖF6‚‡vRÂæWr&VtW‡†ÆWfVÂ’“°¢76W'BæÖF6‚‡vRÂóÃ3#6&–Æ—G’6¶–ÆÇ2ò“°¢76W'BæÖF6‚‡vRÂõ6WBBGfæ6VBò“°§Ò“°