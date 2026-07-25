/**
 * claude-client.js
 * Cliente para integração com Claude API
 * Gera HTML das matérias
 */

const axios = require('axios');
const fs = require('fs');

class ClaudeClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.promptPath = config.promptPath;
    this.prompt = this.loadPrompt();

    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
  }

  /**
   * Carregar o prompt de arquivo
   */
  loadPrompt() {
    try {
      const prompt = fs.readFileSync(this.promptPath, 'utf-8');
      console.log('[CLAUDE] Prompt carregado com sucesso');
      return prompt;
    } catch (error) {
      console.error('[CLAUDE] Erro ao carregar prompt:', error.message);
      return '';
    }
  }

  /**
   * Gerar HTML da matéria
   * Recebe dados estruturados e retorna <main>...</main>
   */
  async generateArticleHtml(materiaData) {
    try {
      console.log('[CLAUDE] Gerando HTML para matéria...');

      // Validar dados obrigatórios
      if (!materiaData.titulo || !materiaData.conteudo_bruto) {
        throw new Error('Faltam dados obrigatórios: título ou conteúdo');
      }

      // Montar mensagem do usuário
      const userMessage = `Use o prompt acima para processar esse JSON e gerar o HTML da matéria:

${JSON.stringify(materiaData, null, 2)}

Retorne APENAS o <main>...</main> completo, sem explicações ou comentários.`;

      // Chamar Claude API
      const response = await this.axiosInstance.post(this.apiUrl, {
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.prompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      // Extrair HTML do response
      if (!response.data.content || response.data.content.length === 0) {
        throw new Error('Claude retornou resposta vazia');
      }

      const htmlContent = response.data.content[0].text;

      console.log('[CLAUDE] HTML gerado com sucesso');
      return htmlContent;

    } catch (error) {
      console.error('[CLAUDE ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Validar HTML gerado
   */
  validateHtml(html) {
    if (!html.includes('<main>') || !html.includes('</main>')) {
      return false;
    }
    if (!html.includes('artigo-header') || !html.includes('artigo-corpo')) {
      return false;
    }
    return true;
  }
}

module.exports = ClaudeClient;
