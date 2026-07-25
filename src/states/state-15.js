/**
 * state-15.js
 * Publicação final
 * Git push → site ao vivo em ~30s
 */

module.exports = async (context) => {
  const { sessionManager, senderNumber, session, config, gitOperations, whatsappClient } = context;

  try {
    const materiaData = session.data.materia_data;
    const htmlGerado = session.data.html_gerado;

    // Gerar nome do arquivo
    const nomeArquivo = `${materiaData.slug}-${Date.now()}.html`;
    const caminhoGit = `materias/${nomeArquivo}`;

    // Fazer git push
    const commitSha = await gitOperations.createOrUpdateFile(
      caminhoGit,
      htmlGerado,
      `Publicar: ${materiaData.titulo} (${materiaData.eixo})`
    );

    console.log(`[STATE 15] Git push realizado: ${commitSha}`);

    // Limpar sessão
    sessionManager.deleteSession(senderNumber);

    // Enviar confirmação
    const linkPublicado = `https://eixoaoquadrado.com.br/materias/${nomeArquivo}`;
    const mensagem = `
🎉 MATÉRIA PUBLICADA!

📰 Título: ${materiaData.titulo}
📌 Eixo: ${materiaData.eixo}
✍️ Autor: ${materiaData.credito_autor}

👇 Link ao vivo:
${linkPublicado}

Compartilha aí! 🚀
    `;

    await whatsappClient.sendMessage(senderNumber, mensagem);

    // Se colaborador, notificar Paula também
    if (session.data.autor_tipo === 'colaborador') {
      await whatsappClient.sendMessage(
        config.paula.whatsappNumber,
        `✅ Matéria de ${session.data.credito_autor} foi publicada:\n${linkPublicado}`
      );
    }

    return {
      message: '✓ Sistema pronto para próxima matéria!',
      sessionClear: true,
      endSession: true,
    };

  } catch (error) {
    return {
      error: 'Erro na publicação: ' + error.message,
    };
  }
};
