/**
 * state-6.js
 * Foto de capa (obrigatória)
 */

module.exports = async (context) => {
  const { messageType, messageText, sessionManager, senderNumber, session } = context;

  try {
    if (messageType !== 'image') {
      return {
        error: 'Por favor, envie uma imagem como foto de capa.',
      };
    }

    // Em produção, fazer download da foto
    // Por enquanto, salvar referência
    const fotoCapa = `materia-${Date.now()}-001.jpg`;
    
    session.data.foto_capa = fotoCapa;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Foto de capa recebida!\n\nDeseja enviar fotos extras? (até 10 fotos)\nResponda com "sim" ou "não":`,
      sessionUpdate: {
        foto_capa: fotoCapa,
      },
      nextState: 7,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar foto de capa: ' + error.message,
    };
  }
};
