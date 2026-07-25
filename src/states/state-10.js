/**
 * state-10.js
 * Crédito do autor
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session } = context;

  try {
    const credito = messageText.trim();

    if (credito.length === 0) {
      return {
        error: 'Indique o crédito do autor.',
      };
    }

    session.data.credito_autor = credito;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Crédito: "${credito}"\n\nÚlTIMO PASSO! Você autoriza:\n1️⃣ Publicação da matéria?\n2️⃣ Uso das fotos?\n3️⃣ Responsabilidade editorial?\n\nResponda: sim sim sim (ou não pra alguma)`,
      sessionUpdate: {
        credito_autor: credito,
      },
      nextState: 11,
    };

  } catch (error) {
    return {
      error: 'Erro ao salvar crédito: ' + error.message,
    };
  }
};
