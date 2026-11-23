// Tiny stack VM for make.fun's tiny-stack ISA v1, written from ISA.md.
// Runs each instance to HALT/EXIT/trap, keeping output written before it.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Opcode facts by byte (index -1 in IMM = no such opcode, trap 5).
// POPN/PUSHN drive the trap 2 / trap 3 stack checks, which the ISA
// orders before the instruction's own traps.
const IMM = new Int8Array(0x54).fill(-1);
const POPN = new Int8Array(0x54);
const PUSHN = new Int8Array(0x54);
function def(op: number, imm: number, pops: number, pushes: number): void {
  IMM[op] = imm; POPN[op] = pops; PUSHN[op] = pushes;
}
def(0x00, 0, 0, 0); def(0x01, 1, 0, 1); def(0x02, 4, 0, 1); // HALT PUSH8 PUSH32
def(0x03, 0, 1, 0); def(0x04, 0, 1, 2); def(0x05, 0, 2, 2); // POP DUP SWAP
def(0x06, 0, 2, 3); def(0x07, 0, 3, 3); // OVER ROT
for (const op of [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x18, 0x19, 0x1a,
  0x1c, 0x1d, 0x1e, 0x20, 0x21, 0x22]) def(op, 0, 2, 1); // binary ops (no 0x1f!)
def(0x17, 0, 1, 1); def(0x1b, 0, 1, 1); // NEG NOT
def(0x30, 2, 0, 0); def(0x31, 2, 1, 0); def(0x32, 2, 1, 0); // JMP JZ JNZ
def(0x33, 2, 0, 0); def(0x34, 0, 0, 0); // CALL RET
def(0x40, 0, 1, 1); def(0x41, 0, 2, 0); // LOAD STORE
def(0x50, 0, 1, 0); def(0x51, 0, 1, 0); def(0x52, 0, 0, 1); def(0x53, 0, 1, 0); // PRINT PUTC IN EXIT

const OUT_MAX = 65536;

function execute(prog: Uint8Array, input: Uint8Array): { bytes: Uint8Array; code: number } {
  const stack = new Int32Array(256);
  const calls = new Int32Array(64);
  const mem = new Int32Array(256);
  const out = new Uint8Array(OUT_MAX);
  let sp = 0, csp = 0, olen = 0, inPos = 0, pc = 0, steps = 0;
  const n = prog.length;
  const finish = (code: number): { bytes: Uint8Array; code: number } =>
    ({ bytes: out.subarray(0, olen), code });

  for (;;) {
    if (steps >= 1000000) return finish(10);
    if (pc < 0 || pc >= n) return finish(9);
    const op = prog[pc];
    if (op >= IMM.length || IMM[op] < 0) return finish(5);
    const imm = IMM[op];
    if (pc + imm >= n) return finish(9);
    steps++;
    if (sp < POPN[op]) return finish(2);
    if (sp - POPN[op] + PUSHN[op] > 256) return finish(3);
    const next = pc + 1 + imm;
    pc = next;
    switch (op) {
      case 0x00: return finish(0);
      case 0x01: stack[sp++] = (prog[next - 1] << 24) >> 24; break;
      case 0x02:
        stack[sp++] = prog[next - 4] | (prog[next - 3] << 8) |
          (prog[next - 2] << 16) | (prog[next - 1] << 24);
        break;
      case 0x03: sp--; break;
      case 0x04: stack[sp] = stack[sp - 1]; sp++; break;
      case 0x05: {
        const t = stack[sp - 1];
        stack[sp - 1] = stack[sp - 2]; stack[sp - 2] = t;
        break;
      }
      case 0x06: stack[sp] = stack[sp - 2]; sp++; break;
      case 0x07: {
        const a = stack[sp - 3];
        stack[sp - 3] = stack[sp - 2]; stack[sp - 2] = stack[sp - 1]; stack[sp - 1] = a;
        break;
      }
      case 0x17: stack[sp - 1] = (-stack[sp - 1]) | 0; break;
      case 0x1b: stack[sp - 1] = ~stack[sp - 1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b = stack[sp - 1], a = stack[sp - 2];
        let r: number;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (b === 0) return finish(4); r = (a / b) | 0; }
        else if (op === 0x14) { if (b === 0) return finish(4); r = b === -1 ? 0 : (a % b) | 0; }
        else if (op === 0x15) { if (b === 0) return finish(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 0x16) { if (b === 0) return finish(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp--; stack[sp - 1] = r;
        break;
      }
      case 0x30: case 0x31: case 0x32: {
        const rel = ((prog[next - 2] | (prog[next - 1] << 8)) << 16) >> 16;
        let jump = op === 0x30;
        if (!jump) jump = (op === 0x31) === (stack[--sp] === 0);
        if (jump) pc = next + rel;
        break;
      }
      case 0x33:
        if (csp >= 64) return finish(7);
        calls[csp++] = next;
        pc = prog[next - 2] | (prog[next - 1] << 8);
        break;
      case 0x34:
        if (csp === 0) return finish(8);
        pc = calls[--csp];
        break;
      case 0x40: {
        const addr = stack[sp - 1];
        if (addr < 0 || addr > 255) return finish(6);
        stack[sp - 1] = mem[addr];
        break;
      }
      case 0x41: {
        const addr = stack[sp - 1];
        if (addr < 0 || addr > 255) return finish(6);
        mem[addr] = stack[sp - 2]; sp -= 2;
        break;
      }
      case 0x50: { // PRINT: decimal ASCII, digits built back to front
        let v = stack[sp - 1];
        const tmp = new Uint8Array(11);
        let k = 11;
        const neg = v < 0;
        if (v === 0) tmp[--k] = 48;
        while (v !== 0) {
          tmp[--k] = 48 + (neg ? -(v % 10) : v % 10);
          v = Math.trunc(v / 10);
        }
        if (neg) tmp[--k] = 45;
        if (olen + 11 - k > OUT_MAX) return finish(11);
        sp--;
        out.set(tmp.subarray(k), olen);
        olen += 11 - k;
        break;
      }
      case 0x51:
        if (olen >= OUT_MAX) return finish(11);
        out[olen++] = stack[--sp] & 255;
        break;
      case 0x52: stack[sp++] = inPos < input.length ? input[inPos++] : -1; break;
      case 0x53: return finish(stack[--sp] & 255);
      default: return finish(5);
    }
  }
}

const inDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(inDir).sort()) {
  const prog = new Uint8Array(readFileSync(join(inDir, id, 'program.bin')));
  let input = new Uint8Array(0);
  try { input = new Uint8Array(readFileSync(join(inDir, id, 'input.bin'))); } catch { }
  const r = execute(prog, input);
  mkdirSync(join(outDir, id), { recursive: true });
  writeFileSync(join(outDir, id, 'stdout.bin'), r.bytes);
  writeFileSync(join(outDir, id, 'exit.txt'), r.code + '\n');
}
