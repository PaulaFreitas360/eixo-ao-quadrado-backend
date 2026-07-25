/**
 * state-0.js
 * Identificação do autor
 * Verifica se é Paula (número específico) ou Colaborador
 */

module.exports = async (context) => {
  const { senderNumber, config } = context;

  try {
    const ehPaula = senderNumber === config.paula.whatsappNumber;

    if (!ehPaula) {
      // Colaborador — precisa ser aprovado
      console.log(`[STATE 0] Colaborador: ${senderNumber}`);
    } else {
      // É Paula
      console.log(`[STATE 0] Paula identificada!`);
    }

    return {
      ehPaula: ehPaula,
      ehColaborador: !ehPaula,
    };

  } catch (error) {
    return {
      error: 'Erro ao identificar autor: ' + error.message,
    };
  }
};
