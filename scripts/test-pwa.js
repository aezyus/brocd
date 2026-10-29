import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const browser=await chromium.launch({headless:true,...(existsSync('/tmp/brocd-browser-libs/extracted/usr/lib/x86_64-linux-gnu')?{env:{...process.env,LD_LIBRARY_PATH:'/tmp/brocd-browser-libs/extracted/usr/lib/x86_64-linux-gnu'}}:{})});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage();
try{
 await page.goto('http://localhost:5174');await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForTimeout(1000);await page.reload();await page.waitForTimeout(1000);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true);
 const manifest=await page.evaluate(async()=>await(await fetch('/manifest.webmanifest')).json());assert.equal(manifest.display,'standalone');assert.equal(manifest.icons.length,2);
 await context.setOffline(true);await page.reload();await page.getByRole('heading',{name:'A little less spiral. A little more you.'}).waitFor();
 assert.equal(await page.locator('.sidebar').count(),0);assert.equal(await page.getByRole('heading',{name:'Your little victories'}).count(),0);
 console.log('PASS: Production PWA loads the public landing offline without opening the private app.');
 console.log('PASS: Mobile images load, page has no overflow, and manifest has install icons.');
 await context.setOffline(false);
 const desktop=await browser.newPage({viewport:{width:1440,height:1000}});await desktop.goto('http://localhost:5174');await desktop.waitForTimeout(1200);await desktop.screenshot({path:'/tmp/brocd-landing-desktop.png',fullPage:true});
}finally{await browser.close();}
