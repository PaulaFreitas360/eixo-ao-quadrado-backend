/**
 * state-9.js
 * Fontes e referências
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session } = context;

  try {
    const fontes = messageText.trim();

    if (fontes.length === 0) {
      return {
        error: 'Indique as fontes e referências.',
      };
    }

    session.data.fontes = fontes;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Fontes anotadas!\n\nAgora informe o CRÉDITO DO AUTOR (seu nome ou apelido):`,
      sessionUpdate: {
        fontes: fontes,
      },
      nextState: 10,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar fontes: ' + error.message,
    };
  }
};
