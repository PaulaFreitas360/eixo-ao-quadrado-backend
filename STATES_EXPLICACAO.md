# 15 STATE HANDLERS — FLUXO AUTOMÁTICO WHATSAPP

## O que é cada State

```
STATE 0: Identificação
├─ Input: número WhatsApp
└─ Output: Paula? ou Colaborador?

STATE 1: Coleta de Conteúdo
├─ Input: áudio/texto/fotos
└─ Output: salva em sessão

STATE 2: Confirmação
├─ Input: "sim" ou "não"
└─ Output: avança ou volta

STATE 3: Seleção de Eixo
├─ Input: número 1-14
└─ Output: eixo escolhido

STATE 4: Título
├─ Input: texto (máx 120 char)
└─ Output: salva título

STATE 5: Subtítulo
├─ Input: texto (máx 200 char)
└─ Output: salva subtítulo

STATE 6: Foto de Capa
├─ Input: imagem
└─ Output: salva foto

STATE 7: Fotos Extras
├─ Input: até 10 imagens
└─ Output: salva todas

STATE 8: Origem das Fotos
├─ Input: descrição (própria/banco/crédito)
└─ Output: salva origem

STATE 9: Fontes e Referências
├─ Input: links/citações
└─ Output: salva fontes

STATE 10: Crédito do Autor
├─ Input: nome/apelido
└─ Output: salva crédito

STATE 11: Consentimentos
├─ Input: "sim sim sim"
└─ Output: valida autorizações

STATE 12: Claude API (Geração)
├─ Input: JSON completo
├─ Process: Claude gera HTML
└─ Output: HTML salvo em sessão

STATE 13: Preview
├─ Input: "sim" ou "não"
├─ Output: mostra preview
└─ Retry se precisar revisar

STATE 14: Aprovação
├─ Se Paula: publica direto
├─ Se Colaborador: envia para Paula
└─ Output: roteamento correto

STATE 15: Publicação
├─ Process: git push automático
├─ Output: site ao vivo em ~30s
└─ Notifica autor + Paula
```

## Fluxo Completo

```
Paula/Colaborador envia mensagem
        ↓
[STATE 0] Identifica quem é
        ↓
[STATE 1] Coleta conteúdo bruto
        ↓
[STATE 2] Confirma conteúdo
        ↓
[STATE 3] Escolhe eixo (1-14)
        ↓
[STATE 4] Escreve título
        ↓
[STATE 5] Escreve subtítulo
        ↓
[STATE 6] Envia foto de capa
        ↓
[STATE 7] Envia fotos extras (opt)
        ↓
[STATE 8] Informa origem das fotos
        ↓
[STATE 9] Lista fontes e referências
        ↓
[STATE 10] Informa crédito do autor
        ↓
[STATE 11] Confirma consentimentos (sim sim sim)
        ↓
[STATE 12] Claude gera HTML via API
        ↓
[STATE 13] Preview + confirmação
        ↓
[STATE 14] Roteamento (Paula = direto | Colaborador = aguarda Paula)
        ↓
[STATE 15] Git push → Publicação automática
        ↓
📱 Notificação de sucesso
🌐 Matéria ao vivo em ~30s
```

## Como Usar

### 1. Instalar no Backend

```bash
# Copiar os 16 arquivos para src/states/
cp state-*.js seu-backend/src/states/
cp states-index.js seu-backend/src/states/index.js
```

### 2. Atualizar index.js do servidor

```javascript
const statesHandlers = require('./states/index');

// No webhook POST /webhook:
const currentStateHandler = statesHandlers[currentState];
const result = await currentStateHandler(context);
```

### 3. Fluxo no Webhook

```javascript
app.post('/webhook', async (req, res) => {
  const senderNumber = req.body.senderNumber;
  const messageText = req.body.text;
  const messageType = req.body.type; // 'text', 'image', 'audio'
  
  // Obter sessão
  let session = sessionManager.getSession(senderNumber);
  if (!session) {
    sessionManager.createSession(senderNumber);
    session = sessionManager.getSession(senderNumber);
  }
  
  // Obter state handler atual
  const currentState = session.currentState || 0;
  const stateHandler = statesHandlers[currentState];
  
  // Executar handler
  const context = {
    session,
    senderNumber,
    messageText,
    messageType,
    config,
    whatsappClient,
    sessionManager,
    claudeClient,
    gitOperations,
  };
  
  const result = await stateHandler(context);
  
  // Enviar resposta
  if (result.message) {
    await whatsappClient.sendMessage(senderNumber, result.message);
  }
  
  if (result.error) {
    await whatsappClient.sendMessage(senderNumber, '❌ ' + result.error);
    return res.json({ ok: true });
  }
  
  // Avançar state
  if (result.nextState !== undefined) {
    session.currentState = result.nextState;
    sessionManager.saveSession(senderNumber, session);
  }
  
  // Atualizar dados
  if (result.sessionUpdate) {
    session.data = { ...session.data, ...result.sessionUpdate };
    sessionManager.saveSession(senderNumber, session);
  }
  
  // Limpar sessão se terminou
  if (result.sessionClear) {
    sessionManager.deleteSession(senderNumber);
  }
  
  res.json({ ok: true });
});
```

## Testes Manuais

Para testar cada state:

```bash
# State 0: Identificação
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"senderNumber":"61999116717","text":"oi","type":"text"}'

# State 3: Seleção de eixo
# (após completar states 1 e 2)
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"senderNumber":"5561987654321","text":"1","type":"text"}'
```

## Variáveis Importantes

Cada state acessa essas variáveis via `context`:

- `session` — dados da sessão atual
- `senderNumber` — número WhatsApp
- `messageText` — texto enviado
- `messageType` — 'text', 'image', 'audio'
- `config` — configurações (eixos, limites, etc)
- `whatsappClient` — enviar mensagens
- `sessionManager` — salvar/carregar sessão
- `claudeClient` — gerar HTML
- `gitOperations` — fazer push

## Limites Configuráveis

Em `config.js`:

```javascript
limits: {
  maxTituloLength: 120,
  maxSubtituloLength: 200,
  maxFotosExtras: 10,
  sessionTimeout: 600000, // 10 minutos
}
```

## Próximos Passos

1. ✅ 15 State Handlers criados
2. ⏳ Testar fluxo localmente
3. ⏳ Deploy no Railway
4. ⏳ Configurar Evolution API
5. ⏳ Primeiro teste no WhatsApp

