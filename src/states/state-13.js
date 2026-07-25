/**
 * state-13.js
 * Preview da matéria
 * Mostra o artigo e pergunta se aprova ou quer revisar
 */

module.exports = async (context) => {
  const { messageText, sessionManager, senderNumber, session, whatsappClient } = context;

  try {
    // Se for primeira vez, enviar preview
    if (!session.data.preview_enviado) {
      // Em produção, converter HTML para imagem ou PDF para preview
      // Por enquanto, enviar resumo
      const resumo = `
📰 PREVIEW DA MATÉRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Eixo: ${session.data.materia_data.eixo}
Título: ${session.data.materia_data.titulo}
Subtítulo: ${session.data.materia_data.subtitulo}
Autor: ${session.data.materia_data.credito_autor}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aprova essa matéria? Responda:
✅ "sim" (publicar)
❌ "não" (revisar)
      `;

      session.data.preview_enviado = true;
      sessionManager.saveSession(senderNumber, session);

      return {
        message: resumo,
        nextState: 13, // Continuar aguardando resposta
      };
    }

    // Processar resposta
    const resposta = messageText.toLowerCase().trim();

    if (resposta.includes('sim')) {
      return {
        message: '✓ Matéria aprovada!\n\n⏳ Roteando para aprovação final...',
        nextState: 14,
      };
    } else if (resposta.includes('não')) {
      return {
        message: 'Entendi. O que precisa revisar? (Descreva as mudanças)',
        sessionUpdate: {
          preview_enviado: false,
        },
        nextState: 13, // Repetir preview
      };
    } else {
      return {
        error: 'Responda "sim" pra aprovar ou "não" para revisar.',
      };
    }

  } catch (error) {
    return {
      error: 'Erro no preview: ' + error.message,
    };
  }
};
