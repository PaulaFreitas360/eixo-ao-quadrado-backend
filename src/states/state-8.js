/**
 * state-8.js
 * Origem das fotos
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session } = context;

  try {
    const origem = messageText.trim();

    if (origem.length === 0) {
      return {
        error: 'Explique a origem das fotos.',
      };
    }

    session.data.origem_fotos = origem;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Origem das fotos: "${origem}"\n\nAgora passe as FONTES E REFERÊNCIAS da matéria (links, citações, etc):`,
      sessionUpdate: {
        origem_fotos: origem,
      },
      nextState: 9,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar origem das fotos: ' + error.message,
    };
  }
};
