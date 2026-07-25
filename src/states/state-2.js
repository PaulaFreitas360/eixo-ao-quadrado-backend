/**
 * state-2.js
 * Confirmação: "Tá certo?" ou volta pra coletar mais
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session } = context;

  try {
    const resposta = messageText.toLowerCase().trim();

    if (resposta.includes('sim') || resposta.includes('ok') || resposta.includes('pronto')) {
      // Confirmar e avançar
      sessionManager.saveSession(senderNumber, session);
      return {
        message: 'Ótimo! Agora escolha o eixo (1-14):\n1=Negócios, 2=Inovação, 3=Gestão, 4=Política, 5=Direito, 6=ESG, 7=Educação, 8=Cultura, 9=Gastronomia, 10=Saúde, 11=Beleza, 12=Mulheres, 13=Inclusão, 14=No Quadradinho',
        nextState: 3,
      };
    } else if (resposta.includes('não') || resposta.includes('mais')) {
      // Voltar a coletar
      return {
        message: 'Tudo bem! Mande mais conteúdo então.',
        nextState: 1,
      };
    } else {
      return {
        error: 'Responda com "sim" para confirmar ou "não" para adicionar mais.',
      };
    }

  } catch (error) {
    return {
      error: 'Erro na confirmação: ' + error.message,
    };
  }
};
