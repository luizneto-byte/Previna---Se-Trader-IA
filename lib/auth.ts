import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
const COOKIE='prev_trader_session';
const ttl=60*60*12;
function secret(){const v=process.env.SESSION_SECRET;if(!v || v.length<32) throw new Error('SESSION_SECRET não configurado (mínimo 32 caracteres)');return v;}
function sign(message:string){return createHmac('sha256',secret()).update(message).digest('hex');}
export function sessionToken(){const expires=String(Math.floor(Date.now()/1000)+ttl);return `${expires}.${sign(expires)}`;}
export function validToken(token:string|undefined){if(!token)return false;const [exp,sig,...extra]=token.split('.');if(extra.length || !exp || !sig || !/^\d+$/.test(exp) || Number(exp)<Date.now()/1000)return false;const expected=Buffer.from(sign(exp),'hex');const actual=Buffer.from(sig,'hex');return actual.length===expected.length && timingSafeEqual(actual,expected);}
export async function isAuthenticated(){return validToken((await cookies()).get(COOKIE)?.value);}
export const cookieName=COOKIE;
