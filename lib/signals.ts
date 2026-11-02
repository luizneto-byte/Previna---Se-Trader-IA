export type Candle={datetime:string;open:number;high:number;low:number;close:number};
function ema(v:number[],period:number){let e=v[0], k=2/(period+1);return v.map(x=>(e=x*k+e*(1-k)));}
function rsi(v:number[],period=14){if(v.length<period+2)return 50;let gains=0,losses=0;for(let i=v.length-period;i<v.length;i++){const d=v[i]-v[i-1];gains+=Math.max(d,0);losses+=Math.max(-d,0);}if(losses===0)return gains===0?50:100;const rs=gains/losses;return 100-(100/(1+rs));}
export function analyze(candles:Candle[]){
  if(candles.length<60)return {side:'AGUARDAR',reasons:['Histórico insuficiente'],metrics:null};
  const v=candles.map(x=>x.close);const ef=ema(v,9),es=ema(v,21);const last=v.length-1;const momentum=rsi(v);const fast=ef[last],slow=es[last];
  const spread=Math.abs(fast-slow)/v[last];
  const range=candles.slice(-14).reduce((acc,x)=>acc+(x.high-x.low)/x.close,0)/14;
  let side:'CALL'|'PUT'|'AGUARDAR'='AGUARDAR';const reasons:string[]=[];
  if(spread<0.00015) reasons.push('Médias muito próximas');
  if(range>0.004) reasons.push('Volatilidade elevada');
  if(range<0.00008) reasons.push('Pouca movimentação');
  if(!reasons.length && fast>slow && momentum>52 && momentum<68 && v[last]>fast){side='CALL';reasons.push('Tendência positiva: EMA 9 acima da EMA 21, RSI moderado');}
  else if(!reasons.length && fast<slow && momentum<48 && momentum>32 && v[last]<fast){side='PUT';reasons.push('Tendência negativa: EMA 9 abaixo da EMA 21, RSI moderado');}
  if(!reasons.length) reasons.push('Critérios técnicos não coincidem');
  return {side,reasons,metrics:{rsi:Number(momentum.toFixed(1)),ema9:Number(fast.toFixed(6)),ema21:Number(slow.toFixed(6))}};
}
