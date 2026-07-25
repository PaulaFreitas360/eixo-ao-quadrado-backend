/**
 * state-11.js
 * Consentimentos (3 perguntas)
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session } = context;

  try {
    const resposta = messageText.toLowerCase().trim();

    // Esperar: "sim sim sim" ou variações
    const ternos = resposta.split(/\s+/).slice(0, 3);

    if (ternos.length < 3) {
      return {
        error: 'Responda com 3 respostas: "sim sim sim" (ou não pra alguma).',
      };
    }

    const consentimentos = {
      publicacao: ternos[0].includes('sim'),
      fotos: ternos[1].includes('sim'),
      responsabilidade: ternos[2].includes('sim'),
    };

    // Verificar se todas as autorizações foram dadas
    if (!consentimentos.publicacao || !consentimentos.fotos || !consentimentos.responsabilidade) {
      return {
        message: 'Não conseguimos publicar sem todas as autorizações. Tenta de novo? (sim sim sim)',
        nextState: 11, // Repetir
      };
    }

    session.data.consentimentos = consentimentos;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: '✓ Todas as autorizações recebidas!\n\n⏳ Gerando matéria com IA...',
      sessionUpdate: {
        consentimentos: consentimentos,
      },
      nextState: 12,
    };

  } catch (error) {
    return {
      error: 'Erro ao validar consentimentos: ' + error.message,
    };
  }
};
