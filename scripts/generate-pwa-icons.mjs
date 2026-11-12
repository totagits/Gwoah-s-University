// Deterministically generate Android/iOS-compatible PNG icons during Vite builds.
// Uses Node's built-in zlib, without extra image libraries or font binaries.
import {deflateSync} from 'node:zlib';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const destination=resolve('public');
mkdirSync(destination,{recursive:true});
const palettes={student:[74,18,73],staff:[45,18,59]};
const glyphs={
 H:['10101','10101','11111','10101','10101'],
 I:['11111','00100','00100','00100','11111'],
 A:['01110','10001','11111','10001','10001'],
 U:['10001','10001','10001','10001','01110'],
 S:['01111','10000','01110','00001','11110'],
 T:['11111','00100','00100','00100','00100'],
 F:['11111','10000','11110','10000','10000'],
 E:['11111','10000','11110','10000','11111'],
 R:['11110','10001','11110','10100','10010'],
 P:['11110','10001','11110','10000','10000'],
};
const crcTable=new Uint32Array(256);
for(let n=0;n<256;n++){let v=n;for(let j=0;j<8;j++)v=(v&1)?(0xEDB88320^(v>>>1)):(v>>>1);crcTable[n]=v>>>0;}
const crc=bytes=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{
 const len=Buffer.alloc(4);len.writeUInt32BE(data.length);
 const name=Buffer.from(type,'ascii');
 const check=Buffer.alloc(4);check.writeUInt32BE(crc(Buffer.concat([name,data])));
 return Buffer.concat([len,name,data,check]);
};
function render(kind,size){
 const stride=1+size*4;const raw=Buffer.alloc(size*stride);
 const accent=[195,154,83],white=[255,255,255],background=palettes[kind];
 const pixel=(x,y,color)=>{
  if(x<0||y<0||x>=size||y>=size)return;
  const i=y*stride+1+x*4;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2];raw[i+3]=255;
 };
 const rect=(x,y,w,h,color)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixel(xx,yy,color);};
 const centerText=(word,y,scale,color)=>{
  const width=word.length*6*scale-scale;let x=Math.floor((size-width)/2);
  for(const letter of word){const g=glyphs[letter];if(g)g.forEach((row,j)=>[...row].forEach((cell,i)=>{if(cell==='1')rect(x+i*scale,y+j*scale,scale,scale,color);}));x+=6*scale;}
 };
 for(let y=0;y<size;y++){raw[y*stride]=0;for(let x=0;x<size;x++)pixel(x,y,background);}
 const center=size/2,r=size*0.31;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dist=Math.hypot(x-center,y-size*0.42);
  if(Math.abs(dist-r)<Math.max(3,size*0.013))pixel(x,y,accent);
 }
 const main=kind==='student'?'S':'ERP',scale=Math.max(7,Math.floor(size/(main.length===1?8:22)));
 centerText(main,Math.floor(size*0.42-2.5*scale),scale,white);
 const small=Math.max(3,Math.floor(size/65));
 centerText(kind==='student'?'HIAU':'STAFF',Math.floor(size*0.79),small,accent);
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
for(const kind of ['student','staff'])for(const size of [192,512]){
 const file=`hiau-${kind}-${size}.png`;writeFileSync(resolve(destination,file),render(kind,size));
 process.stdout.write('Generated '+file+'\\n');
}
