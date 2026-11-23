//T packs 84 ops: A arglen, B stack-in, C stack-out.
import{mkdirSync as m,readdirSync as D,readFileSync as R,writeFileSync as W}from"node:fs";
import{join as J}from"node:path";
let T="):j-/348((((((((2222222.222.222(222(((((((((((((IMMI)(((((((((((.1((((((((((((((--*-",A=[],B=[],C=[],
P=[(a,b)=>a+b|0,(a,b)=>a-b|0,(a,b)=>Math.imul(a,b),(a,b)=>a/b|0,(a,b)=>a%b|0,(a,b)=>Math.floor((a>>>0)/(b>>>0))|0,(a,b)=>(a>>>0)%(b>>>0)|0,,(a,b)=>a&b,(a,b)=>a|b,(a,b)=>a^b,,(a,b)=>a<<b,(a,b)=>a>>b,(a,b)=>a>>>b,,(a,b)=>a==b?1:0,(a,b)=>a<b?1:0,(a,b)=>(a>>>0)<(b>>>0)?1:0];
for(let o=0;o<84;o++){let x=T.charCodeAt(o)-41;A[o]=x>>4;B[o]=x>>2&3;C[o]=x&3}
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
case 4:case 6:S[s]=S[s-1-(o>5)];s++;break;
case 5:[S[s-2],S[s-1]]=[S[s-1],S[s-2]];break;
case 7:[S[s-3],S[s-2],S[s-1]]=[S[s-2],S[s-1],S[s-3]];break;
case 23:S[s-1]=-S[s-1]|0;break;
case 27:S[s-1]=~S[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:
{let b=S[s-1],a=S[s-2];
if(o>18&&o<23&&!b)return F(4);
S[--s-1]=P[o-16](a,b);break}
case 48:case 49:case 50:{
let r=((p[v-2]|p[v-1]<<8)<<16)>>16;
if(o==48||(o==49)===(S[--s]==0))g=v+r;
break}
case 51:if(c>63)return F(7);K[c++]=v;g=p[v-2]|p[v-1]<<8;break;
case 52:if(!c)return F(8);g=K[--c];break;
case 64:case 65:{let a=S[s-1];if(a<0||a>255)return F(6);if(o==64)S[s-1]=M[a];else{M[a]=S[s-2];s-=2}break}
case 80:{
let w=S[s-1]+"",m=w.length;
if(l+m>65536)return F(11);
s--;for(let j=0;j<m;)O[l++]=w.charCodeAt(j++);
break}
case 81:if(l>65535)return F(11);O[l++]=S[--s]&255;break;
case 82:S[s++]=t<q.length?q[t++]:-1;break;
case 83:return F(S[--s]&255);
default:return F(5);
}}}
let I=process.env.MAKEFUN_INPUT_DIR??"/input",U=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(let id of D(I).sort()){
let p=R(J(I,id,"program.bin")),q=new Uint8Array(0);
try{q=R(J(I,id,"input.bin"))}catch{}
let r=X(p,q);
m(J(U,id),{recursive:true});
W(J(U,id,"stdout.bin"),r.b);
W(J(U,id,"exit.txt"),r.e+"\n");
}
