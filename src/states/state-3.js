/**
 * state-3.js
 * Seleção do eixo (1-14)
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session, config } = context;

  try {
    const eixoNum = parseInt(messageText.trim());

    if (isNaN(eixoNum) || eixoNum < 1 || eixoNum > 14) {
      return {
        error: 'Digite um número entre 1 e 14.',
      };
    }

    const eixo = config.eixos[eixoNum];
    if (!eixo) {
      return {
        error: 'Eixo inválido. Tenta de novo.',
      };
    }

    session.data.eixo_escolhido = eixoNum;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: `✓ Eixo escolhido: ${eixo.nome}\n\nAgora manda o TÍTULO (máx 120 caracteres):`,
      sessionUpdate: {
        eixo_escolhido: eixoNum,
      },
      nextState: 4,
    };

  } catch (error) {
    return {
      error: 'Erro ao selecionar eixo: ' + error.message,
    };
  }
};
