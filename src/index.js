/**
 * index.js
 * Servidor Express principal
 * Recebe webhooks do WhatsApp via Evolution API
 * Orquestra o fluxo de estados da automação
 */

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const SessionManager = require('./modules/session-manager');
const WhatsAppClient = require('./modules/whatsapp-client');
const stateHandlers = require('./states');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar gerenciadores
const sessionManager = new SessionManager(config.paths.sessionsDb);
const whatsappClient = new WhatsAppClient(config.evolution);

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK DO WHATSAPP (Evolution API)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    // Validar webhook
    if (!data || !data.data) {
      return res.status(400).json({ error: 'Invalid webhook format' });
    }

    const messageData = data.data;
    const senderNumber = messageData.from || messageData.sender;
    const messageText = messageData.text || '';
    const messageType = messageData.type || 'text'; // text, image, audio, etc

    console.log(`[WEBHOOK] Mensagem de ${senderNumber}: ${messageText.substring(0, 50)}...`);

    // Responder imediatamente (Evolution requer ACK)
    res.status(200).json({ status: 'received' });

    // Processar mensagem em background
    setImmediate(async () => {
      await processMessage(senderNumber, messageText, messageType, messageData);
    });

  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LÓGICA PRINCIPAL DE PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════════════════

async function processMessage(senderNumber, messageText, messageType, fullData) {
  try {
    // 1. Recuperar ou criar sessão
    let session = sessionManager.getSession(senderNumber);

    if (!session) {
      // Primeira mensagem — iniciar no ESTADO 0
      session = sessionManager.createSession(senderNumber);
      console.log(`[SESSION] Nova sessão criada para ${senderNumber}`);

      // ESTADO 0: Identificação do autor
      const result = await stateHandlers[0]({
        session,
        senderNumber,
        messageText,
        messageType,
        fullData,
        config,
        whatsappClient,
      });

      if (result.approved !== undefined) {
        if (!result.approved) {
          // Não autorizado
          await whatsappClient.sendMessage(
            senderNumber,
            'Desculpa, você não está autorizado. Fale com Paula.'
          );
          sessionManager.deleteSession(senderNumber);
          return;
        }
      }

      // Atualizar sessão com identificação
      session.ehPaula = result.ehPaula;
      session.ehColaborador = result.ehColaborador;
      session.currentState = 1; // Próximo estado
      sessionManager.saveSession(senderNumber, session);

      // Enviar mensagem de boas-vindas
      await whatsappClient.sendMessage(
        senderNumber,
        `Oi! Bem-vindo ao sistema de publicação do Eixo ao Quadrado 📰

Vamos criar uma matéria. Você pode:
• Gravar áudio com a história
• Mandar texto
• Enviar fotos
• Citar fontes

Por enquanto, me envia o conteúdo (áudio, texto, tudo que tiver).
Depois a gente organiza.`
      );
      return;
    }

    // 2. Sessão já existe — processar estado atual
    console.log(`[SESSION] Processando ESTADO ${session.currentState} para ${senderNumber}`);

    const stateHandler = stateHandlers[session.currentState];
    if (!stateHandler) {
      console.error(`[ERROR] Nenhum handler para ESTADO ${session.currentState}`);
      await whatsappClient.sendMessage(senderNumber, 'Erro no fluxo. Tenta de novo.');
      return;
    }

    // Executar handler do estado
    const result = await stateHandler({
      session,
      senderNumber,
      messageText,
      messageType,
      fullData,
      config,
      whatsappClient,
      sessionManager,
    });

    // 3. Processar resultado do handler
    if (result.error) {
      console.error(`[STATE ${session.currentState}]`, result.error);
      await whatsappClient.sendMessage(senderNumber, result.error);
      return;
    }

    // Atualizar sessão
    if (result.sessionUpdate) {
      Object.assign(session, result.sessionUpdate);
    }

    // Avançar para próximo estado
    if (result.nextState !== undefined) {
      session.currentState = result.nextState;
      sessionManager.saveSession(senderNumber, session);
    }

    // Enviar resposta ao usuário
    if (result.message) {
      await whatsappClient.sendMessage(senderNumber, result.message);
    }

    // Se ESTADO 15 (publicação), deletar sessão
    if (session.currentState === 15) {
      setTimeout(() => {
        sessionManager.deleteSession(senderNumber);
        console.log(`[SESSION] Deletada sessão de ${senderNumber}`);
      }, 5000);
    }

  } catch (error) {
    console.error('[PROCESS ERROR]', error);
    await whatsappClient.sendMessage(
      senderNumber,
      'Desculpa, algo deu errado. Tenta de novo ou fale com Paula.'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════════════

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════════════════════════════════════════`);
  console.log(`  Eixo ao Quadrado — Backend de Automação`);
  console.log(`  Servidor rodando em http://localhost:${PORT}`);
  console.log(`  Ambiente: ${config.server.nodeEnv}`);
  console.log(`═══════════════════════════════════════════════════════════════════════════\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando gracefully...');
  process.exit(0);
});
