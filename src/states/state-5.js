/**
 * state-5.js
 * Subtítulo (máx 200 caracteres)
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session, config } = context;

  try {
    const subtitulo = messageText.trim();

    if (subtitulo.length === 0) {
      return {
        error: 'Subtítulo não pode ser vazio.',
      };
    }

    if (subtitulo.length > config.limits.maxSubtituloLength) {
      return {
        error: `Subtítulo muito longo (máx ${config.limits.maxSubtituloLength} caracteres, você tem ${subtitulo.length}).`,
      };
    }

    session.data.subtitulo = subtitulo;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Subtítulo: "${subtitulo}"\n\nAgora envie a FOTO DE CAPA (obrigatória):`,
      sessionUpdate: {
        subtitulo: subtitulo,
      },
      nextState: 6,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar subtítulo: ' + error.message,
    };
  }
};
