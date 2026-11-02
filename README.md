# Previna-se Trader IA — MVP privado

Painel de sinais técnicos M5 para uso privado, com **confirmação manual sem envio de ordens**. Não contém IA treinada: a lógica inicial é uma heurística explicável com EMA9, EMA21 e RSI14. Não há percentual de acerto demonstrado.

## Instalação
1. Instale Node.js 20+.
2. `npm install`
3. Copie `.env.example` para `.env.local` e defina uma senha forte (`ADMIN_PASSWORD` de 12+ caracteres), `SESSION_SECRET` aleatório com 32+ caracteres e uma chave de API da Twelve Data (`TWELVE_DATA_API_KEY`).
4. `npm run dev` e abra http://localhost:3000.
5. Para a Vercel, crie um projeto a partir do repositório e configure as mesmas três variáveis de ambiente em **Settings > Environment Variables**.

## Limitações importantes
- A API usa velas Forex de 5 minutos da Twelve Data e **descarta a vela em formação**; quando está desatualizada, bloqueia sinal. O horário é UTC.
- O plano e limite de créditos da Twelve Data devem ser verificados. O painel consulta a cada 60 segundos; planos gratuitos podem esgotar créditos rapidamente.
- A cotação, o relógio, o payout e o vencimento de uma corretora podem ser diferentes dos dados externos. **Um sinal M5 não equivale a instrução de opção binária com vencimento M5.**
- A confirmação não negocia, não conecta conta e não verifica execução na corretora. O resultado é marcado manualmente.
- Registros e parâmetros ficam apenas no localStorage deste navegador, não em banco de dados nem sincronizados. Não use como prova de rentabilidade.
- A proteção de senha foi projetada para uso individual, mas a primeira versão não implementa rate limiting distribuído, recuperação de conta nem autenticação multifator. Antes de expor publicamente, adicione controles de segurança e banco de dados.
- Esta versão não suporta conta real conectada ou execuções automáticas. Faça backtests com custos e dados fora da amostra, forward tests e verificação regulatória antes de qualquer decisão financeira.
- No Brasil, verifique a autorização CVM de quaisquer intermediárias. Há alerta da CVM sobre a IQ Option Ltd.

## Monitoramento com alertas

- O painel recebe velas M5 concluídas da Twelve Data e consulta o endpoint `/price` para atualizar o último preço exibido (ponto azul no gráfico quando estiver na faixa vertical).
- A contagem de 10 segundos aparece ANTES de uma nova janela M5 somente se já existir sinal técnico não vencido e limites de risco permitirem. É um aviso de reavaliação, NÃO um momento garantido para operar. O sistema não envia ordens.
- Atualização REST: velas normalmente a cada 60 s, com consultas extras perto da virada; preços a cada 60 s. NÃO É TRANSMISSÃO TICK A TICK. Para gráfico realmente fluido é necessário serviço WebSocket/streaming apropriado e arquitetura segura no servidor (não expor API key no navegador).
- A cada hora de uso contínuo, a combinação de consultas pode consumir dezenas de créditos da API. No plano gratuito os limites podem ser atingidos. Se isso ocorrer, interrompa o monitoramento e confira a franquia da Twelve Data.
- Se o mercado estiver parado, a cotação estiver velha ou houver posição PENDENTE, o aviso não aparece.

## Avisos intravela (versão atual)
O painel não espera a próxima vela para avisar. Usa tendências das velas M5 encerradas, consulta REST /price a cada 15 segundos e começa uma contagem de 10 segundos quando encontra sinal e cotação recente. No fim, mostra apenas um sinal para conferência manual. **Não é WebSocket nem preço tick a tick.** Com muitos ativos ou uso prolongado, pode ultrapassar o limite da API gratuita Twelve Data; nesse caso aumente o intervalo e não opere com dados atrasados. A confirmação apenas registra localmente, não opera na corretora.
