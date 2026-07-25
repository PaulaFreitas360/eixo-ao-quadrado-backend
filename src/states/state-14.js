/**
 * state-14.js
 * Aprovação final
 * Se Paula: publica direto
 * Se Colaborador: envia pra Paula aprovar
 */

module.exports = async (context) => {
  const { sessionManager, senderNumber, session, config, whatsappClient } = context;

  try {
    const ehPaula = senderNumber === config.paula.whatsappNumber;

    if (ehPaula) {
      // Paula pode publicar direto
      return {
        message: '✓ Aprovado por Paula!\n\n⏳ Publicando na plataforma...',
        sessionUpdate: {
          aprovado_por_paula: true,
          autor_tipo: 'paula',
        },
        nextState: 15,
      };
    } else {
      // Colaborador precisa esperar Paula
      const resumo = `
📝 NOVO ARTIGO AGUARDANDO APROVAÇÃO
Autor: ${session.data.credito_autor}
Eixo: ${session.data.materia_data.eixo}
Título: ${session.data.materia_data.titulo}

👉 Link para revisar: [gerado em produção]
      `;

      // Enviar para Paula
      await whatsappClient.sendMessage(
        config.paula.whatsappNumber,
        resumo
      );

      return {
        message: '✓ Artigo enviado para aprovação de Paula.\n\nVocê será avisado quando publicado! 📢',
        sessionUpdate: {
          enviado_para_paula: true,
          autor_tipo: 'colaborador',
        },
        nextState: 15,
      };
    }

  } catch (error) {
    return {
      error: 'Erro na aprovação: ' + error.message,
    };
  }
};
