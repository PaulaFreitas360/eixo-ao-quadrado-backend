/**
 * state-7.js
 * Fotos extras (até 10)
 */

module.exports = async (context) => {
  const { messageText, messageType, sessionManager, senderNumber, session, config } = context;

  try {
    const resposta = messageText.toLowerCase().trim();

    if (messageType === 'image') {
      // Usuário mandou foto
      if (session.data.fotos_extras.length >= config.limits.maxFotosExtras) {
        return {
          error: `Limite de ${config.limits.maxFotosExtras} fotos atingido.`,
        };
      }

      const fotoExtra = `materia-${Date.now()}-00${session.data.fotos_extras.length + 2}.jpg`;
      session.data.fotos_extras.push(fotoExtra);
      sessionManager.saveSession(senderNumber, session);

      return {
        message: `✓ Foto ${session.data.fotos_extras.length} de ${config.limits.maxFotosExtras} recebida.\n\nMande mais fotos ou responda "pronto":`,
        sessionUpdate: {
          fotos_extras: session.data.fotos_extras,
        },
        nextState: 7, // Continuar no mesmo estado
      };
    }

    if (resposta.includes('pronto') || resposta.includes('não')) {
      // Terminar fotos extras
      return {
        message: 'Ok! Agora precisamos da ORIGEM das fotos.\n\nCada foto é de quem?\n- própria (você tirou)\n- banco gratuito (Unsplash, Pexels, etc)\n- crédito (nome do fotógrafo)',
        nextState: 8,
      };
    }

    return {
      error: 'Envie uma foto ou responda "pronto" para continuar.',
    };

  } catch (error) {
    return {
      error: 'Erro ao processar fotos: ' + error.message,
    };
  }
};
