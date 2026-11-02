import { NextResponse } from 'next/server';
import { cookieName, sessionToken } from '../../../lib/auth';
import { timingSafeEqual } from 'node:crypto';
export async function POST(req:Request){
  const password=String((await req.json().catch(()=>({}))).password??'');
  const valid=process.env.ADMIN_PASSWORD;
  if(!valid || valid.length<12)return NextResponse.json({error:'Configure ADMIN_PASSWORD com pelo menos 12 caracteres.'},{status:503});
  const a=Buffer.from(password),b=Buffer.from(valid);
  if(a.length!==b.length || !timingSafeEqual(a,b))return NextResponse.json({error:'Senha incorreta'},{status:401});
  try {const r=NextResponse.json({ok:true});r.cookies.set(cookieName,sessionToken(),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:43200});return r;}
  catch{return NextResponse.json({error:'Configure SESSION_SECRET.'},{status:503});}
}
