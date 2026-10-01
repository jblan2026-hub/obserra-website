#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS exporter installs a require hook for the deployed TypeScript source. */
/* Export the deployed public source for ZenBusiness's HTML widget.
 * Checkout, identity, application and learning routes remain on the platform.
 * No credentials or server implementation are included in the export.
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const tooling = process.env.OBSERRA_EXPORT_TOOLING || path.join(root, 'node_modules');
const ts = require(path.join(tooling, 'typescript'));
const React = require(path.join(tooling, 'react'));
const { renderToStaticMarkup } = require(path.join(tooling, 'react-dom/server'));
const postcss = require(path.join(tooling, 'postcss'));
const out = path.join(root, 'migration/zenbusiness');
const platformOrigin = process.env.OBSERRA_PLATFORM_ORIGIN || 'https://platform.obserrallc.com';
if (!/^https:\/\/[a-z0-9.-]+$/.test(platformOrigin)) throw Error('Use a verified HTTPS platform origin');
const assetMapPath = path.join(out, 'asset-map.json');
const assetMap = fs.existsSync(assetMapPath) ? JSON.parse(fs.readFileSync(assetMapPath, 'utf8')) : {};
const css = new Map();
const assets = new Set();
let currentRoute = '/';
const publicRoutes = new Set(['/', '/services', '/about', '/speaking', '/resources', '/certifications', '/industries', '/trust', '/protection-intelligence', '/contact']);
const h = React.createElement;
function href(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  const pathname = value.split(/[?#]/)[0];
  return publicRoutes.has(pathname) ? value : platformOrigin + value;
}
function image({src, fill, priority, ...props}) {
  for (const key of ['unoptimized', 'quality', 'loader']) delete props[key];
  if (typeof src === 'object') src = src.src;
  if (src?.startsWith('/')) assets.add(src);
  return h('img', {...props, src: assetMap[src] || src, loading: priority ? 'eager' : 'lazy', decoding:'async',
    style: fill ? {...props.style, position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'} : props.style});
}
function link({href: destination, ...props}) {
  for (const key of ['prefetch', 'replace', 'scroll', 'onClick']) delete props[key];
  return h('a', {...props, href:href(destination)});
}
function info({title, summary, description, details, href:destination, linkLabel, category, image:art, imageAlt}) {
  return h('details', {className:'zen-info-card'}, h('summary', {},
    art ? h('span', {className:'zen-info-media'}, image({src:art,alt:imageAlt||'',fill:true})) : null,
    category ? h('small', {}, category) : null, h('strong', {}, title), h('span', {}, summary), h('em', {}, 'View details')),
    h('div', {className:'zen-info-details'}, h('p',{},description), h('ul',{},...details.map((x,i)=>h('li',{key:i},x))), link({href:destination,children:linkLabel})));
}
function contact({initialInterest}) {
  return h('section', {className:'contact-experience'}, h('h2',{},'Start a confidential conversation'),
    h('p',{},'Tell us what your organization needs. Our team will help identify the right advisory, application, or training path.'),
    link({href:platformOrigin+'/contact'+(initialInterest ? '?interest='+encodeURIComponent(initialInterest) : ''), className:'zen-contact-form-link',children:'Open the secure inquiry form'}),
    h('p',{},h('a',{href:'mailto:info@obserrallc.com'},'Email info@obserrallc.com')));
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react' || request.startsWith('react/')) return originalLoad(path.join(tooling, request), parent, isMain);
  if (request === 'react-dom' || request.startsWith('react-dom/')) return originalLoad(path.join(tooling, request), parent, isMain);
  if (request === 'next/image') return {__esModule:true, default:image};
  if (request === 'next/link') return {__esModule:true, default:link};
  if (request === 'next/navigation') return {usePathname:()=>currentRoute, notFound:()=>{throw Error('Unknown public route');}};
  if (request === 'server-only') return {};
  if (request === 'lucide-react') return new Proxy({}, {get:()=>()=>null});
  if (request.endsWith('ExecutiveInfoModal')) return {__esModule:true, default:info};
  if (request.endsWith('ContactExperience')) return {__esModule:true, default:contact};
  if (request.startsWith('@/')) request = path.join(root,request.slice(2));
  return originalLoad(request,parent,isMain);
};
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module, filename) => {
  const source = fs.readFileSync(filename,'utf8');
  const output = ts.transpileModule(source,{fileName:filename, compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}});
  module._compile(output.outputText,filename);
};
require.extensions['.css'] = (module,filename) => {
  css.set(filename,fs.readFileSync(filename,'utf8'));
  module.exports = new Proxy({}, {get:(_,key)=>String(key)});
};
for (const name of ['globals','design-system','brand-consistency','credential-issuer-marks','global-symbols','commerce-semantics']) {
  const file=path.join(root,'app',name+'.css'); css.set(file,fs.readFileSync(file,'utf8'));
}
const interaction = `(function(){const root=document.querySelector('#obserra-public');if(!root)return;
const toggle=root.querySelector('.ent-header__toggle');const nav=root.querySelector('.ent-header__nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});root.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');toggle.focus()}})}
root.querySelectorAll('.credential-rail-controls button').forEach(b=>b.addEventListener('click',()=>{const rail=b.closest('.credential-rail-shell').querySelector('.verified-credentials-grid');rail.scrollBy({left:(b.getAttribute('aria-label').endsWith('left')?-1:1)*Math.max(260,Math.min(760,rail.clientWidth*.78)),behavior:'smooth'})}));
if(root.querySelector('[data-share-badge-id]')&&!document.querySelector('script[data-obserra-credly]')){const s=document.createElement('script');s.src='https://cdn.credly.com/assets/utilities/embed.js';s.async=true;s.dataset.obserraCredly='true';document.body.appendChild(s)}
})();`;
const adapterCss = `
#obserra-public{font-family:Inter,Arial,sans-serif;text-align:left;color:#0d172a;line-height:1.6;background:#fff;width:100%;font-size:16px}
#obserra-public *{box-sizing:border-box}#obserra-public img{max-width:100%}
.zen-info-card{border:1px solid #dbe4ef;background:#fff;border-radius:18px;overflow:hidden;text-align:left}
.zen-info-card summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:12px;padding:24px}
.zen-info-card summary::-webkit-details-marker{display:none}.zen-info-card strong{font-size:22px;color:#0c2142}.zen-info-card em{font-style:normal;font-weight:700;color:#214d79}
.zen-info-media{position:relative;display:block;height:200px;margin:-24px -24px 8px}.zen-info-details{padding:0 24px 24px}.zen-info-details a,.zen-contact-form-link{display:inline-block;background:#123961;color:white!important;border-radius:8px;padding:12px 18px}
#obserra-public .ent-header__toggle{cursor:pointer}#obserra-public .ent-header__nav a{white-space:normal}
@media(max-width:760px){#obserra-public .ent-header__nav.is-open{display:flex;max-height:80vh;overflow:auto}}
/* Remove the backed-up template chrome on imported pages only. */
#dmRoot:has(#obserra-public) #siteSidebar,#dmRoot:has(#obserra-public) #hamburger-header,#dmRoot:has(#obserra-public) #hamburger-drawer,#dmRoot:has(#obserra-public) .dmFooterContainer{display:none!important}
#dmRoot:has(#obserra-public) .dmInner,#dmRoot:has(#obserra-public) .dmContent,#dmRoot:has(#obserra-public) .allWrapper,#dmRoot:has(#obserra-public) .dmRespRowsWrapper{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;left:0!important}
#dmRoot:has(#obserra-public) .dmRespRow,#dmRoot:has(#obserra-public) .dmRespCol{padding:0!important;margin:0!important;min-height:0!important}
#dmRoot:has(#obserra-public) .dmCustomHtml{padding:0!important;margin:0!important;width:100%!important}
#dmRoot #dm:has(#obserra-public) .dmLayoutWrapper,#dmRoot #dm:has(#obserra-public) #desktopBodyBox,#dmRoot #dm:has(#obserra-public) #iscrollBody,#dmRoot #dm:has(#obserra-public) #dmFirstContainer{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;left:0!important}
#dmRoot #dm:has(#obserra-public) #dm_content .dmRespRow,#dmRoot #dm:has(#obserra-public) #dm_content .dmRespCol{padding:0!important;margin:0!important;width:100%!important;max-width:none!important}
#dmRoot #dm:has(#obserra-public) .hasGenericSidebar,#dmRoot #dm:has(#obserra-public) .dmLayoutWrapper{display:block!important}
#dmRoot #dm:has(#obserra-public) .dmRespColsWrapper{padding:0!important;margin:0!important;width:100%!important;max-width:none!important}
#dmRoot #obserra-public .ent-header__brand{flex:0 0 265px;min-width:265px;gap:12px}
#dmRoot #obserra-public .ent-header__brand img{width:150px;height:auto;object-fit:contain}
#dmRoot #obserra-public .ent-header__identity{min-width:100px}
#dmRoot #obserra-public .ent-header__main{display:flex;align-items:center;gap:24px;padding:18px 24px;max-width:1440px;margin:auto}
#dmRoot #obserra-public .ent-header__nav{display:flex;flex:1;gap:14px;justify-content:flex-end;align-items:center;font-size:13px}
#dmRoot #obserra-public .executive-brand-hero__grid{min-width:0;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);width:min(1420px,92vw)}
@media(max-width:1100px){#dmRoot #obserra-public .ent-header__toggle{display:flex;margin-left:auto}#dmRoot #obserra-public .ent-header__nav{display:none}#dmRoot #obserra-public .ent-header__nav.is-open{display:flex;position:absolute;top:100%;left:0;right:0;z-index:100;background:#082239;padding:24px;flex-direction:column}}
@media(max-width:760px){#dmRoot #obserra-public .executive-brand-hero__grid{grid-template-columns:1fr}#dmRoot #obserra-public .ent-header__brand{flex-basis:240px;min-width:0}}
`;
function scopedCss(source) {
  const sheet=postcss.parse(source);
  sheet.walkAtRules(/^tailwind$/, rule=>rule.remove());
  sheet.walkRules(rule=>{
    if(rule.parent.type==='atrule' && /keyframes$/.test(rule.parent.name))return;
    rule.selectors=rule.selectors.map(selector=>{
      if (/^(?:body|html|:root)$/.test(selector.trim()))return '#dmRoot #obserra-public';
      return '#dmRoot #obserra-public '+selector.replace(/^(?:body|html)\s+/,'');
    });
  });
  return sheet.toString();
}
function guideAdapter() {
  // Reuse the actual site's rule-based advisor, including page-specific prompts.
  const filename=path.join(root,'app/ObserraGuidePanel.tsx');
  const source=fs.readFileSync(filename,'utf8');
  const parsed=ts.createSourceFile(filename,source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TSX);
  const functions=parsed.statements.filter(node=>ts.isFunctionDeclaration(node)&&['pageContext','response'].includes(node.name?.text)).map(node=>node.getText(parsed)).join('\n');
  if(!functions.includes('function pageContext')||!functions.includes('function response'))throw Error('Advisor source changed; review the static adapter.');
  const logic=ts.transpileModule(functions,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  return `<style>
#zen-obserrian-guide{position:fixed;right:20px;bottom:20px;z-index:99999;font:15px/1.5 Arial,sans-serif;color:#183148;display:none}
#zen-obserrian-guide button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:10px 14px}
#zen-obserrian-launcher{background:#08243d;color:#fff;box-shadow:0 6px 20px #061b3b33}
#zen-obserrian-panel{width:min(410px,calc(100vw - 32px));height:min(590px,80vh);background:#fff;border:1px solid #dbe4ed;border-radius:16px;box-shadow:0 18px 60px #061b3b55;overflow:hidden;display:flex;flex-direction:column;margin-bottom:12px}
#zen-obserrian-panel[hidden]{display:none}#zen-obserrian-panel header{background:#08243d;color:#fff;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px}#zen-obserrian-panel header p{margin:0;color:#fff;font-size:12px}
#zen-obserrian-messages{overflow:auto;flex:1;padding:16px}#zen-obserrian-messages article{background:#edf3f7;border-radius:10px;padding:12px;margin-bottom:12px;white-space:pre-wrap}#zen-obserrian-messages article[data-from=visitor]{background:#0d365b;color:white;margin-left:24px}
#zen-obserrian-messages a{display:inline-block;color:#164c7d;text-decoration:underline;margin:8px 10px 0 0}
#zen-obserrian-prompts{display:flex;gap:8px;padding:0 16px 12px;overflow-x:auto}#zen-obserrian-prompts button{white-space:nowrap;background:#e8eff5;color:#123958;font-size:12px}
#zen-obserrian-form{display:flex;gap:8px;padding:12px;border-top:1px solid #dde6ef}#zen-obserrian-form input{min-width:0;width:100%;border:1px solid #b9cad7;border-radius:8px;padding:10px;font:inherit;color:#183148;background:#fff}#zen-obserrian-form button{background:#123958;color:#fff}
</style><aside id="zen-obserrian-guide" aria-label="Obserrian Executive Intelligence Advisor"><section id="zen-obserrian-panel" hidden aria-label="Obserrian advisor"><header><div><strong>Obserrian</strong><p id="zen-obserrian-context"></p></div><button id="zen-obserrian-close" aria-label="Minimize Obserrian">Close</button></header><div id="zen-obserrian-messages" role="log" aria-live="polite"></div><div id="zen-obserrian-prompts"></div><form id="zen-obserrian-form"><input id="zen-obserrian-question" aria-label="Ask Obserrian" placeholder="Ask about services, applications, or training" maxlength="1000" required><button type="submit">Send</button></form></section><button id="zen-obserrian-launcher" type="button" aria-expanded="false" aria-controls="zen-obserrian-panel">Ask Obserrian</button></aside>
<script>(function(){function initialize(){const root=document.querySelector('#obserra-public');if(!root)return;const guide=document.getElementById('zen-obserrian-guide');guide.style.display='block';
const LEGAL_ENTITY_NAME='OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC',ACADEMY_BRAND_NAME='Obserra EPI Academy',APPLICATIONS_BRAND_NAME='Obserra EPI Applications',EIOS_BRAND_NAME='Obserra EPI Enterprise Intelligence';
${logic}
const publicRoutes=new Set(${JSON.stringify([...publicRoutes])});const platformOrigin=${JSON.stringify(platformOrigin)};
const previewPrefix='/site/2d547f80';const prefix=(location.pathname===previewPrefix||location.pathname.startsWith(previewPrefix+'/'))?previewPrefix:'';const pathname=prefix?(location.pathname.slice(prefix.length)||'/'):location.pathname;const context=pageContext(pathname);document.getElementById('zen-obserrian-context').textContent=context.label;
// Duda retains links to native page IDs when their old slugs are renamed.
// Direct those migrated links to the replacement public pages instead.
function normalizeLink(a){const url=new URL(a.href,location.href);if(url.origin!==location.origin)return false;const route=prefix?url.pathname.slice(prefix.length):url.pathname;if(route==='/legacy-contact')url.pathname=prefix+'/contact';else if(route==='/legacy-home'||route==='/home')url.pathname=prefix+'/';else return false;const raw=a.getAttribute('raw_url');if(raw)for(const [key,value]of new URL(raw,location.href).searchParams)url.searchParams.set(key,value);a.href=url.href;a.setAttribute('raw_url',url.href);return true;}
root.querySelectorAll('a[href]').forEach(normalizeLink);root.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(a&&normalizeLink(a))event.stopPropagation();},true);
const secureForm=root.querySelector('.zen-contact-form-link');if(secureForm){const url=new URL(secureForm.href);const params=new URLSearchParams(location.search);for(const key of ['interest','industry','service','course'])if(params.has(key))url.searchParams.set(key,params.get(key));secureForm.href=url.href;}
const panel=document.getElementById('zen-obserrian-panel'),launcher=document.getElementById('zen-obserrian-launcher'),log=document.getElementById('zen-obserrian-messages'),input=document.getElementById('zen-obserrian-question');
function destination(value){const route=value.split(/[?#]/)[0];return publicRoutes.has(route)?prefix+value:platformOrigin+value;}
function message(item){const article=document.createElement('article');article.dataset.from=item.from;const text=document.createElement('p');text.textContent=item.text.replace(/\\bEIOS\\b/g,'Enterprise Intelligence');article.appendChild(text);for(const action of item.actions||[]){const a=document.createElement('a');a.href=destination(action.href);a.textContent=action.label.replace(/\\bEIOS\\b/g,'Enterprise Intelligence');article.appendChild(a);}log.appendChild(article);log.scrollTop=log.scrollHeight;}
function open(value){panel.hidden=!value;launcher.setAttribute('aria-expanded',String(value));if(value)input.focus();else launcher.focus();}
function ask(question){const value=question.trim().slice(0,1000);if(!value)return;message({from:'visitor',text:value});message(response(value,pathname));input.value='';}
message({from:'guide',text:context.welcome});for(const prompt of context.prompts){const b=document.createElement('button');b.type='button';b.textContent=prompt;b.addEventListener('click',()=>ask(prompt));document.getElementById('zen-obserrian-prompts').appendChild(b);}
launcher.addEventListener('click',()=>open(panel.hidden));document.getElementById('zen-obserrian-close').addEventListener('click',()=>open(false));guide.addEventListener('keydown',event=>{if(event.key==='Escape')open(false);});document.getElementById('zen-obserrian-form').addEventListener('submit',event=>{event.preventDefault();ask(input.value);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();})();</script>`;
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const entries=[...publicRoutes].map(route=>({route,file:route==='/'?'app/page.tsx':`app${route}/page.tsx`,props:{searchParams:Promise.resolve({})}}));
  for(const [prefix,param,file] of [['/services','serviceId','app/services/[serviceId]/page.tsx'],['/industries','industry','app/industries/[industry]/page.tsx'],['/trust','slug','app/trust/[slug]/page.tsx']]) {
    const module=require(path.join(root,file));
    for(const params of await module.generateStaticParams()){const route=prefix+'/'+params[param];publicRoutes.add(route);entries.push({route,file,props:{params:Promise.resolve(params)},module});}
  }
  const pages=[];
  for(const entry of entries){
    currentRoute=entry.route;const module=entry.module||require(path.join(root,entry.file));
    const node=await module.default(entry.props);let html=renderToStaticMarkup(node).replace(/<link rel="preload"[^>]*>/g,'');
    if(!html.includes('class="ent-header"')) {const chrome=require(path.join(root,'app/components/enterprise/EnterpriseChrome.tsx'));html=renderToStaticMarkup(h(chrome.EnterpriseHeader))+html+renderToStaticMarkup(h(chrome.EnterpriseFooter));}
    html=html.replace(/>([^<]*)</g,(match,text)=>'>'+text.replace(/\bEIOS\b/g,'Enterprise Intelligence')+'<');
    const metadata=module.generateMetadata?await module.generateMetadata(entry.props):module.metadata||{};
    const title=typeof metadata.title==='string'?metadata.title:metadata.title?.absolute||'Obserra EPI LLC';
    const name=entry.route==='/'?'home':entry.route.slice(1).replace(/\//g,'--');
    pages.push({route:entry.route,name,title,description:metadata.description||'',source:entry.file,html});
  }
  let stylesheet=scopedCss([...css.values()].join('\n'))+adapterCss;
  stylesheet=stylesheet.replace(/url\((["']?)(\/[^)"']+)\1\)/g, (match, quote, asset)=>{
    assets.add(asset);return `url("${assetMap[asset]||platformOrigin+asset}")`;
  });
  fs.writeFileSync(path.join(out,'site.css'),stylesheet);
  fs.writeFileSync(path.join(out,'interactions.js'),interaction);
  fs.writeFileSync(path.join(out,'body-end-guide.html'),guideAdapter());
  const mark=assetMap['/brand/obserra-mark.svg'];
  const academy=assetMap['/brand/visuals/obserra-academy.png'];
  if(mark&&academy)fs.writeFileSync(path.join(out,'shared-head.html'),`<style id="obserra-shared-assets">
#dmRoot #obserra-public .home-brand::before,#dmRoot #obserra-public .about-brand::before,#dmRoot #obserra-public .apps-brand::before,#dmRoot #obserra-public .contact-brand::before,#dmRoot #obserra-public .brand::before,#dmRoot #obserra-public .eios-brand::before,#dmRoot #obserra-public .learning-brand::before,#dmRoot #obserra-public .academy-course-nav>a:first-child::before{background-image:linear-gradient(#ffffff0c,#ffffff03),url("${mark}")!important}
#dmRoot #obserra-public .hero{background-image:linear-gradient(90deg,#031426 0%,#031426ee 38%,#03142695 64%,#03142628 100%),url("${academy}")!important}
body:has(#obserra-public) #hamburger-header-container,body:has(#obserra-public) #mobile-hamburger-header,body:has(#obserra-public) #layout-drawer-hamburger,body:has(#obserra-public) #mobile-hamburger-drawer{display:none!important}
body:has(#obserra-public) .site_content{margin-top:0!important}
#dmRoot #obserra-public .executive-brand-hero__grid{width:min(1420px,92vw)!important}
#dmRoot #obserra-public .ent-header__toggle{flex-direction:column;align-items:center;justify-content:center;gap:4px}
#dmRoot #obserra-public .ent-header__toggle span{display:block!important;width:20px!important;height:2px!important;min-height:2px!important;flex:0 0 2px!important;background:#fff!important;margin:0!important;padding:0!important}
#dmRoot #obserra-public .about-page.about-executive-page{background:#f4f7f9!important;isolation:isolate}
#dmRoot #obserra-public .about-page.about-executive-page::before{display:none!important}
</style>`);
  for(const page of pages){
    const widget=`<style>${stylesheet}</style><div id="obserra-public">${page.html}</div><script>${interaction}</script>`;
    fs.writeFileSync(path.join(out,page.name+'.html'),widget);
    fs.writeFileSync(path.join(out,page.name+'.preview.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</title></head><body id="dmRoot">${widget}</body></html>`);
  }
  const manifest={sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),platformOrigin,pages:pages.map(page=>{const metadata={...page};delete metadata.html;return metadata;}),assets:[...assets].sort(),unmappedAssets:[...assets].filter(x=>!assetMap[x]).sort()};
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,assets:assets.size,unmappedAssets:manifest.unmappedAssets.length,output:out}));
})().catch(e=>{console.error(e);process.exitCode=1});
