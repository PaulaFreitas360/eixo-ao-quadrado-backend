/**
 * state-12.js
 * Processamento Claude API — Geração de HTML
 */

module.exports = async (context) => {
  const { sessionManager, senderNumber, session, config, claudeClient } = context;

  try {
    // Montar JSON para Claude
    const eixo = config.eixos[session.data.eixo_escolhido];
    
    const materiaData = {
      eixo: eixo.nome,
      slug: eixo.slug,
      cor: eixo.cor,
      titulo: session.data.titulo,
      subtitulo: session.data.subtitulo,
      conteudo_bruto: session.data.conteudo_bruto.map(c => c.conteudo).join('\n\n'),
      foto_capa: session.data.foto_capa,
      fotos_extras: session.data.fotos_extras,
      origem_fotos: session.data.origem_fotos,
      fontes: session.data.fontes,
      credito_autor: session.data.credito_autor,
    };

    // Chamar Claude para gerar HTML
    const html = await claudeClient.generateArticleHtml(materiaData);

    if (!claudeClient.validateHtml(html)) {
      return {
        error: 'Claude gerou HTML inválido. Tenta novamente.',
      };
    }

    session.data.html_gerado = html;
    session.data.materia_data = materiaData;
    sessionManager.saveSession(senderNumber, session);

    return {
      message: '✓ Matéria gerada com sucesso!\n\n👇 Preview em breve...',
      sessionUpdate: {
        html_gerado: true,
      },
      nextState: 13,
    };

  } catch (error) {
    return {
      error: 'Erro ao gerar matéria: ' + error.message,
    };
  }
};
