/**
 * state-4.js
 * Título (máx 120 caracteres)
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session, config } = context;

  try {
    const titulo = messageText.trim();

    if (titulo.length === 0) {
      return {
        error: 'Título não pode ser vazio.',
      };
    }

    if (titulo.length > config.limits.maxTituloLength) {
      return {
        error: `Título muito longo (máx ${config.limits.maxTituloLength} caracteres, você tem ${titulo.length}).`,
      };
    }

    session.data.titulo = titulo;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Título: "${titulo}"\n\nAgora manda o SUBTÍTULO (máx 200 caracteres):`,
      sessionUpdate: {
        titulo: titulo,
      },
      nextState: 5,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar título: ' + error.message,
    };
  }
};
