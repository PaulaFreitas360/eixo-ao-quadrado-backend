/**
 * state-1.js
 * Coleta de conteúdo bruto (áudio/texto/fotos)
 */

module.exports = async (context) => {
  const { messageText, messageType, sessionManager, senderNumber, session } = context;

  try {
    if (!messageText && messageType === 'text') {
      return {
        error: 'Envie o conteúdo (áudio, texto, fotos ou tudo junto).',
      };
    }

    // Adicionar conteúdo à sessão
    session.data.conteudo_bruto.push({
      tipo: messageType,
      conteudo: messageText,
      timestamp: new Date().toISOString(),
    });

    sessionManager.saveSession(senderNumber, session);

    return {
      message: 'Conteúdo recebido! Quer adicionar mais ou já confirma?',
      sessionUpdate: {
        conteudo_bruto: session.data.conteudo_bruto,
      },
      nextState: 2,
    };

  } catch (error) {
    return {
      error: 'Erro ao coletar conteúdo: ' + error.message,
    };
  }
};
