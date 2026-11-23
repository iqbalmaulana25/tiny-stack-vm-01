import{mkdirSync,readdirSync,readFileSync,writeFileSync}from"node:fs";
import{join}from"node:path";
let A=new Int8Array(84).fill(-1),B=new Int8Array(84),C=new Int8Array(84),d=(o,i,p,q)=>{A[o]=i;B[o]=p;C[o]=q};
d(0,0,0,0);d(1,1,0,1);d(2,4,0,1);d(3,0,1,0);d(4,0,1,2);d(5,0,2,2);d(6,0,2,3);d(7,0,3,3);
d(23,0,1,1);d(27,0,1,1);
for(let o of[16,17,18,19,20,21,22,24,25,26,28,29,30,32,33,34])d(o,0,2,1);
d(48,2,0,0);d(49,2,1,0);d(50,2,1,0);d(51,2,0,0);d(52,0,0,0);
d(64,0,1,1);d(65,0,2,0);d(80,0,1,0);d(81,0,1,0);d(82,0,0,1);d(83,0,1,0);
function X(p,q){
let S=new Int32Array(256),K=new Int32Array(64),M=new Int32Array(256),O=new Uint8Array(65536),s=0,c=0,l=0,t=0,g=0,z=0,n=p.length,F=e=>({b:O.subarray(0,l),e});
for(;;){
if(z>=1e6)return F(10);
if(g<0||g>=n)return F(9);
let o=p[g];
if(o>83||A[o]<0)return F(5);
let i=A[o];
if(g+i>=n)return F(9);
z++;
if(s<B[o])return F(2);
if(s-B[o]+C[o]>256)return F(3);
let v=g+1+i;g=v;
switch(o){
case 0:return F(0);
case 1:S[s++]=(p[v-1]<<24)>>24;break;
case 2:S[s++]=p[v-4]|p[v-3]<<8|p[v-2]<<16|p[v-1]<<24;break;
case 3:s--;break;
case 4:S[s]=S[s-1];s++;break;
case 5:{let a=S[s-1];S[s-1]=S[s-2];S[s-2]=a;break}
case 6:S[s]=S[s-2];s++;break;
case 7:{let a=S[s-3];S[s-3]=S[s-2];S[s-2]=S[s-1];S[s-1]=a;break}
case 23:S[s-1]=-S[s-1]|0;break;
case 27:S[s-1]=~S[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
let b=S[s-1],a=S[s-2],r;
if(o==16)r=a+b|0;
else if(o==17)r=a-b|0;
else if(o==18)r=Math.imul(a,b);
else if(o==19){if(!b)return F(4);r=a/b|0}
else if(o==20){if(!b)return F(4);r=a%b|0}
else if(o==21){if(!b)return F(4);r=Math.floor((a>>>0)/(b>>>0))|0}
else if(o==22){if(!b)return F(4);r=(a>>>0)%(b>>>0)|0}
else if(o==24)r=a&b;
else if(o==25)r=a|b;
else if(o==26)r=a^b;
else if(o==28)r=a<<b;
else if(o==29)r=a>>b;
else if(o==30)r=a>>>b;
else if(o==32)r=a==b?1:0;
else if(o==33)r=a<b?1:0;
else r=(a>>>0)<(b>>>0)?1:0;
S[--s-1]=r;break}
case 48:case 49:case 50:{
let r=((p[v-2]|p[v-1]<<8)<<16)>>16;
if(o==48||(o==49)===(S[--s]==0))g=v+r;
break}
case 51:if(c>63)return F(7);K[c++]=v;g=p[v-2]|p[v-1]<<8;break;
case 52:if(!c)return F(8);g=K[--c];break;
case 64:{let a=S[s-1];if(a<0||a>255)return F(6);S[s-1]=M[a];break}
case 65:{let a=S[s-1];if(a<0||a>255)return F(6);M[a]=S[s-2];s-=2;break}
case 80:{
let w=S[s-1],T=new Uint8Array(11),k=11,h=w<0;
if(!w)T[--k]=48;
while(w){T[--k]=48+(h?-(w%10):w%10);w=Math.trunc(w/10)}
if(h)T[--k]=45;
if(l+11-k>65536)return F(11);
s--;O.set(T.subarray(k),l);l+=11-k;break}
case 81:if(l>65535)return F(11);O[l++]=S[--s]&255;break;
case 82:S[s++]=t<q.length?q[t++]:-1;break;
case 83:return F(S[--s]&255);
default:return F(5);
}}}
let I=process.env.MAKEFUN_INPUT_DIR??"/input",U=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(let id of readdirSync(I).sort()){
let p=new Uint8Array(readFileSync(join(I,id,"program.bin"))),q=new Uint8Array(0);
try{q=new Uint8Array(readFileSync(join(I,id,"input.bin")))}catch{}
let r=X(p,q);
mkdirSync(join(U,id),{recursive:true});
writeFileSync(join(U,id,"stdout.bin"),r.b);
writeFileSync(join(U,id,"exit.txt"),r.e+"\n");
}
