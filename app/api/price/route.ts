import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../lib/auth';
export const dynamic = 'force-dynamic';
const symbols=new Set(['EUR/USD','GBP/USD','USD/JPY']);
export async function GET(req:Request){
 if(!await isAuthenticated())return NextResponse.json({error:'Não autenticado'},{status:401});
 const symbol=new URL(req.url).searchParams.get('symbol')??'EUR/USD';
 if(!symbols.has(symbol))return NextResponse.json({error:'Ativo inválido'},{status:400});
 const key=process.env.TWELVE_DATA_API_KEY;
 if(!key)return NextResponse.json({status:'OFFLINE',error:'API não configurada'});
 try{
  const url='https://api.twelvedata.com/price?'+new URLSearchParams({symbol,apikey:key});
  const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});
  const json=await res.json();const price=Number(json.price);
  if(!res.ok||json.status==='error'||!Number.isFinite(price)||price<=0)throw Error(json.message||'Preço indisponível');
  return NextResponse.json({status:'PRICE',symbol,price,serverTime:new Date().toISOString(),note:'Último preço retornado pelo provedor; pode estar atrasado.'});
 }catch(e){return NextResponse.json({status:'OFFLINE',error:e instanceof Error?e.message:'Falha no preço'});}
}
