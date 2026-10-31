/** Offline preparation of built-in image_gen outputs for the 1.0 story.
 * node scripts/prepare-story-art.mjs /absolute/path/to/node_modules/sharp [--allow-missing]
 * Alpha-bound crops and nearest-neighbor preparation only; no drawing/retouching.
 * Flat sheets and mastheads use their established layout footprints, as the existing
 * stationery recipes do. Faces, scenes and ink signatures preserve aspect ratio.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const docs = new URL('../docs/', import.meta.url).pathname;
const allowMissing = process.argv.includes('--allow-missing');
const portraits = ['agent', 'strike-leader', 'printer', 'dispatcher', 'sergeant', 'proofreader', 'volunteer', 'storekeeper', 'alias', 'malec'];
const definitions = [
  ...portraits.map(name => ({name:`story-${name}`, width:94, height:96, destination:'sprites', alpha:true, position:'bottom'})),
  ...[1,2,3,4,5,6].map(id => ({name:`ending-e${id}`, width:570, height:320, alpha:false})),
  ...['leaflet','warning','exposure','carbon-copy','private-note'].map(name => ({name, width:200, height:168, alpha:true, fit:'fill'})),
  {name:'malec-photo', width:48, height:40, alpha:false},
  {name:'bhp-paraph', width:46, height:20, alpha:true},
  {name:'editor-paraph', width:46, height:20, alpha:true},
  {name:'committee-seal', width:42, height:36, alpha:true},
  {name:'security-seal', width:46, height:30, alpha:true},
  {name:'voluntary-imprint', width:162, height:24, alpha:true},
  {name:'party-card-cover', width:112, height:144, alpha:true},
  {name:'party-card-open', width:200, height:168, alpha:true, fit:'fill'},
  {name:'union-folded', width:88, height:56, alpha:true},
  {name:'union-spread', width:300, height:180, alpha:true, fit:'fill'},
  {name:'union-masthead-pl', width:268, height:30, alpha:true, fit:'fill'},
  {name:'union-masthead-en', width:268, height:30, alpha:true, fit:'fill'},
];
const report = [];
for (const d of definitions) {
  const source = `${art}story-source/${d.name}.png`;
  if (!existsSync(source)) { if(allowMissing) continue; throw new Error(`Missing generated source ${source}`); }
  const metadata = await sharp(source).metadata();
  let pipeline = sharp(source);
  let crop = null;
  if(d.alpha){
    if(!metadata.hasAlpha) throw new Error(`Source lacks requested alpha: ${d.name}`);
    const {data,info} = await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,top=info.height,right=-1,bottom=-1;
    for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++){
      if(data[(y*info.width+x)*4+3]<=8) continue;
      left=Math.min(left,x); top=Math.min(top,y); right=Math.max(right,x); bottom=Math.max(bottom,y);
    }
    if(right<left) throw new Error(`Empty source: ${d.name}`);
    crop={left,top,width:right-left+1,height:bottom-top+1};
    pipeline=sharp(source).extract(crop);
  }
  const destination=`${art}${d.destination || 'story'}/${d.name}.png`;
  mkdirSync(`${art}${d.destination || 'story'}`,{recursive:true});
  await pipeline.resize(d.width,d.height,{kernel:'nearest',fit:d.fit||(d.alpha?'contain':'cover'),position:d.position||'centre',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(destination);
  const pixels=await sharp(destination).raw().toBuffer();
  report.push({...d,source:`story-source/${d.name}.png`,destination:`${d.destination||'story'}/${d.name}.png`,sourceWidth:metadata.width,sourceHeight:metadata.height,crop,sha256:createHash('sha256').update(pixels).digest('hex')});
  console.log(`${d.name}: ${d.width}x${d.height}`);
}
writeFileSync(`${art}story/preparation.json`,JSON.stringify(report,null,2)+'\n');
if(portraits.every(name=>existsSync(`${art}sprites/story-${name}.png`))){
 const layers=await Promise.all(portraits.map(async(name,i)=>({input:await sharp(`${art}sprites/story-${name}.png`).resize(188,192,{kernel:'nearest'}).png().toBuffer(),left:(i%5)*200+6,top:Math.floor(i/5)*204+6})));
 await sharp({create:{width:1000,height:408,channels:3,background:'#20271f'}}).composite(layers).png().toFile(`${docs}story-portraits-review.png`);
}
if([1,2,3,4,5,6].every(id=>existsSync(`${art}story/ending-e${id}.png`))){
 const layers=[1,2,3,4,5,6].map((id,i)=>({input:`${art}story/ending-e${id}.png`,left:(i%2)*570,top:Math.floor(i/2)*320}));
 await sharp({create:{width:1140,height:960,channels:3,background:'#20271f'}}).composite(layers).png().toFile(`${docs}story-endings-review.png`);
}
