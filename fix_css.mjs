


import fs from 'fs';
import { landingPageCssLinks } from './extracted_landing_css_links.mjs';

const projHtmlPath = 'index.html';
let projHtml = fs.readFileSync(projHtmlPath, 'utf8');

if (!projHtml.includes('<!-- Landing Page CSS Links -->')) {
    projHtml = projHtml.replace('</title>', `</title>
    <!-- Landing Page CSS Links -->
    ${landingPageCssLinks}`);
    fs.writeFileSync(projHtmlPath, projHtml);
    console.log("Injected landingPageCssLinks to index.html");
}
