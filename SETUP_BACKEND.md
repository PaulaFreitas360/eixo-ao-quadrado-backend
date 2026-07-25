═══════════════════════════════════════════════════════════════════════════════
  EIXO AO QUADRADO — SETUP DO BACKEND
  Guia passo a passo para colocar tudo rodando
═══════════════════════════════════════════════════════════════════════════════

## O QUE VOCÊ TEM AGORA

✅ **Prioridade 1 (Criado)**
- `package.json` — dependências
- `.env.example` — variáveis de ambiente
- `config.js` — configuração centralizada
- `index.js` — servidor Express + webhook
- `session-manager.js` — rastreamento de sessões
- `whatsapp-client.js` — integração Evolution API
- `claude-client.js` — integração Claude API
- `git-operations.js` — git push automático

✅ **Prioridade 2 (Pendente)**
- `src/states/state-*.js` (15 handlers de estado)

✅ **Prioridade 3 (Pendente)**
- Deployment no Railway/Heroku
- Integração com GitHub Actions
- Publicação automática no Hostinger

═══════════════════════════════════════════════════════════════════════════════
## STEP 1: Preparar estrutura local
═══════════════════════════════════════════════════════════════════════════════

```bash
# Criar pasta do projeto
mkdir eixo-ao-quadrado-backend
cd eixo-ao-quadrado-backend

# Copiar os arquivos que você baixou dos outputs
# (config.js, index.js, package.json, etc)

# Criar pastas necessárias
mkdir -p src/modules src/states prompts database temp/uploads

# Mover arquivos para src/modules
mv config.js src/
mv index.js src/
mv session-manager.js src/modules/
mv whatsapp-client.js src/modules/
mv claude-client.js src/modules/
mv git-operations.js src/modules/

# Copiar o prompt para prompts/
mv PROMPT_CLAUDE_GERACAO_MATERIAS.txt prompts/prompt-geracao-materias.txt

# Criar .env a partir do .env.example
cp .env.example .env
```

═══════════════════════════════════════════════════════════════════════════════
## STEP 2: Instalar dependências
═══════════════════════════════════════════════════════════════════════════════

```bash
# Node.js 18+ é obrigatório
node --version  # Confirmar que é v18 ou superior

# Instalar dependências
npm install

# Instalar nodemon localmente (para desenvolvimento)
npm install --save-dev nodemon
```

═══════════════════════════════════════════════════════════════════════════════
## STEP 3: Configurar .env com suas chaves
═══════════════════════════════════════════════════════════════════════════════

Edite o arquivo `.env` com seus dados reais:

```
# Claude API (seu token)
CLAUDE_API_KEY=sk-ant-v7-SEU-TOKEN-AQUI

# Evolution API (para WhatsApp)
EVOLUTION_API_URL=https://sua-instancia-evolution.railway.app
EVOLUTION_API_KEY=sua-chave-evolution-aqui

# GitHub (para publicação automática)
GITHUB_TOKEN=ghp_SEU-TOKEN-AQUI
GITHUB_REPO=seu-usuario/eixo-ao-quadrado-site
GITHUB_BRANCH=main

# Paula (aprovação)
PAULA_WHATSAPP_NUMBER=61999116717
```

**Como obter as chaves:**

**Claude API:**
- Vá para https://console.anthropic.com/
- Crie uma chave de API
- Copie: `sk-ant-v7-...`

**Evolution API:**
- Faça deploy em Railway/Docker
- Obtenha a URL e chave da instância

**GitHub Token:**
- Vá para https://github.com/settings/tokens
- Create new token (classic)
- Permissões: `repo` (acesso completo a repositórios)
- Copie o token

═══════════════════════════════════════════════════════════════════════════════
## STEP 4: Testar localmente
═══════════════════════════════════════════════════════════════════════════════

```bash
# Rodar em desenvolvimento
npm run dev

# Você verá:
# ═══════════════════════════════════════════════════════════════════════════
# Eixo ao Quadrado — Backend de Automação
# Servidor rodando em http://localhost:3000
# ═══════════════════════════════════════════════════════════════════════════
```

**Teste o health check:**
```bash
curl http://localhost:3000/health

# Retorno esperado:
# {"status":"ok","timestamp":"2026-07-25T..."}
```

═══════════════════════════════════════════════════════════════════════════════
## STEP 5: Criar os 15 State Handlers (PRÓXIMO PASSO)
═══════════════════════════════════════════════════════════════════════════════

Cada estado é um arquivo em `src/states/state-N.js`:

**Estrutura de um state handler:**
```javascript
module.exports = async (context) => {
  const {
    session,
    senderNumber,
    messageText,
    messageType,
    fullData,
    config,
    whatsappClient,
    sessionManager,
  } = context;

  try {
    // Validar entrada
    if (!messageText) {
      return {
        error: 'Mensagem vazia. Tenta de novo.',
      };
    }

    // Processar (guardar em sessão, etc)
    sessionManager.updateSessionData(senderNumber, {
      campo: messageText,
    });

    // Retornar
    return {
      message: 'Ok, próximo passo!',
      nextState: 2, // avançar para próximo estado
    };

  } catch (error) {
    return {
      error: 'Algo deu errado: ' + error.message,
    };
  }
};
```

**Estado 0: Identificação**
```javascript
// Verificar se é Paula ou Colaborador
// Paula = número específico (61999116717)
// Colaborador = qualquer outro
return {
  ehPaula: senderNumber === '61999116717',
  ehColaborador: true,
};
```

**Estado 1-11: Coleta de dados**
```javascript
// Cada estado coleta uma coisa:
// 1: Conteúdo bruto (texto/áudio)
// 2: Confirmação ("Tá certo?")
// 3: Seleção de eixo (1-14)
// 4: Título (máx 120 char)
// 5: Subtítulo (máx 200 char)
// 6: Foto de capa
// 7: Fotos extras
// 8: Origem das fotos
// 9: Fontes
// 10: Crédito do autor
// 11: Consentimentos (sim/não/sim)
```

**Estado 12: Claude API**
```javascript
// Montar JSON
// Chamar Claude para gerar HTML
// Salvar em sessão
```

**Estado 13: Preview**
```javascript
// Enviar preview do artigo
// "Aprova? Rejeita?"
```

**Estado 14: Roteamento**
```javascript
// Se Paula: publica direto
// Se Colaborador: envia pra Paula aprovar
```

**Estado 15: Publicação**
```javascript
// Fazer git push
// Deploy automático
// "Matéria publicada! Link: ..."
```

═══════════════════════════════════════════════════════════════════════════════
## STEP 6: Fazer deploy
═══════════════════════════════════════════════════════════════════════════════

**Opção A: Railway (recomendado)**
1. Criar conta em https://railway.app
2. Conectar GitHub
3. Deploy automático ao fazer push

**Opção B: Heroku**
1. Criar conta em https://heroku.com
2. `npm install -g heroku-cli`
3. `heroku login`
4. `heroku create eixo-ao-quadrado-backend`
5. `git push heroku main`

**Opção C: Seu servidor VPS**
1. SSH no servidor
2. `git clone seu-repo`
3. `npm install`
4. `npm start`
5. Usar PM2 para manter rodando: `npm install -g pm2` + `pm2 start src/index.js`

═══════════════════════════════════════════════════════════════════════════════
## STEP 7: Configurar Evolution API (WhatsApp)
═══════════════════════════════════════════════════════════════════════════════

**Você precisa:**
1. Evolution API rodando (self-hosted ou na nuvem)
2. Número WhatsApp conectado
3. Webhook apontando pra seu backend: `POST https://seu-backend.com/webhook`

**Exemplo de webhook no Evolution:**
```
Nome: Eixo Ao Quadrado
URL: https://eixo-ao-quadrado-backend.railway.app/webhook
Eventos: message.create, message.update
```

═══════════════════════════════════════════════════════════════════════════════
## TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

**"CLAUDE_API_KEY is not defined"**
→ Verificar se criou o arquivo `.env` com as chaves

**"Cannot find module 'express'"**
→ Rodar `npm install`

**"Webhook não está recebendo mensagens"**
→ Conferir se Evolution API está apontando a URL correta do seu backend

**"Claude retorna erro de autenticação"**
→ Verificar se o token está correto em `.env`

═══════════════════════════════════════════════════════════════════════════════
## PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Setup local (agora)
2. ⬜ Criar 15 state handlers
3. ⬜ Testar fluxo completo no WhatsApp
4. ⬜ Deploy no Railway
5. ⬜ Configurar GitHub Actions pra publicação automática

═══════════════════════════════════════════════════════════════════════════════
