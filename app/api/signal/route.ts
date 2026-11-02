import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../lib/auth';
import { analyze, Candle } from '../../../lib/signals';
export const dynamic='force-dynamic';
const symbols=new Set(['EUR/USD','GBP/USD','USD/JPY']);
export async function GET(req:Request){
  if(!await isAuthenticated())return NextResponse.json({error:'Não autenticado'},{status:401});
  const symbol=new URL(req.url).searchParams.get('symbol')??'EUR/USD';
  if(!symbols.has(symbol))return NextResponse.json({error:'Ativo inválido'},{status:400});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return NextResponse.json({status:'OFFLINE',side:'AGUARDAR',error:'Configure TWELVE_DATA_API_KEY. Nenhum sinal real será gerado.'});
  try {
    const params=new URLSearchParams({symbol,interval:'5min',outputsize:'120',timezone:'UTC',apikey:key});
    const resp=await fetch(`https://api.twelvedata.com/time_series?${params}`,{cache:'no-store',signal:AbortSignal.timeout(10000)});
    const json=await resp.json();
    if(!resp.ok || json.status==='error' || !Array.isArray(json.values))throw new Error(json.message||'Falha ao obter cotações');
    const all:Candle[]=json.values.map((x:any)=>({datetime:x.datetime,open:Number(x.open),high:Number(x.high),low:Number(x.low),close:Number(x.close)})).filter((x:Candle)=>Object.values(x).slice(1).every(Number.isFinite)).sort((a:Candle,b:Candle)=>a.datetime.localeCompare(b.datetime));
    // A API usa UTC e o horário da vela indica sua abertura. Descartar vela em formação.
    const now=Date.now();const closed=all.filter(x=>{const t=Date.parse(x.datetime.replace(' ','T')+'Z');return Number.isFinite(t)&&t+5*60000<=now-5000;});
    const last=closed.at(-1);const lastTime=last?Date.parse(last.datetime.replace(' ','T')+'Z')+5*60000:0;
    if(!last || now-lastTime>15*60000)return NextResponse.json({status:'STALE',side:'AGUARDAR',error:'Cotações ausentes ou antigas; nenhuma entrada autorizada.',lastCandle:last?.datetime??null});
    return NextResponse.json({status:'LIVE_DATA',symbol,interval:'5min',lastCandle:last.datetime,close:last.close, ...analyze(closed),note:'Heurística experimental, sem probabilidade de acerto validada. Fonte externa pode diferir da corretora.'});
  } catch(e){return NextResponse.json({status:'OFFLINE',side:'AGUARDAR',error:e instanceof Error?e.message:'Erro ao consultar cotações'});}
}
