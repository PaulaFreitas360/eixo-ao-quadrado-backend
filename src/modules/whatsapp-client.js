/**
 * whatsapp-client.js
 * Integração com Evolution API para receber/enviar mensagens WhatsApp
 */

const axios = require('axios');

class WhatsAppClient {
  constructor(evolutionConfig) {
    this.apiUrl = evolutionConfig.apiUrl;
    this.apiKey = evolutionConfig.apiKey;
    this.instanceName = evolutionConfig.instanceName;

    this.axiosInstance = axios.create({
      baseURL: `${this.apiUrl}/message`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Enviar mensagem de texto
   */
  async sendMessage(whatsappNumber, text) {
    try {
      console.log(`[WA SEND] ${whatsappNumber}: ${text.substring(0, 50)}...`);

      const response = await this.axiosInstance.post('/sendText', {
        number: this.formatNumber(whatsappNumber),
        text: text,
      });

      return response.data;
    } catch (error) {
      console.error('[WA SEND ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Enviar mensagem com lista de botões
   */
  async sendMessage WithButtons(whatsappNumber, text, buttons) {
    try {
      console.log(`[WA SEND BUTTONS] ${whatsappNumber}`);

      const response = await this.axiosInstance.post('/sendList', {
        number: this.formatNumber(whatsappNumber),
        title: 'Opções',
        description: text,
        sections: buttons,
      });

      return response.data;
    } catch (error) {
      console.error('[WA SEND BUTTONS ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Enviar imagem
   */
  async sendImage(whatsappNumber, imageUrl, caption = '') {
    try {
      console.log(`[WA SEND IMAGE] ${whatsappNumber}`);

      const response = await this.axiosInstance.post('/sendMedia', {
        number: this.formatNumber(whatsappNumber),
        mediaType: 'image',
        media: imageUrl,
        caption: caption,
      });

      return response.data;
    } catch (error) {
      console.error('[WA SEND IMAGE ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Enviar arquivo
   */
  async sendFile(whatsappNumber, fileUrl, fileName) {
    try {
      console.log(`[WA SEND FILE] ${whatsappNumber}: ${fileName}`);

      const response = await this.axiosInstance.post('/sendMedia', {
        number: this.formatNumber(whatsappNumber),
        mediaType: 'document',
        media: fileUrl,
        fileName: fileName,
      });

      return response.data;
    } catch (error) {
      console.error('[WA SEND FILE ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Converter número WhatsApp para formato correto
   * Evolution espera: 5561999116717 (sem + ou espaços)
   */
  formatNumber(number) {
    let formatted = number.replace(/\D/g, ''); // Remove tudo que não é número
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted; // Adiciona código Brasil se não tiver
    }
    return formatted;
  }

  /**
   * Enviar reação (emoji)
   */
  async sendReaction(whatsappNumber, messageId, emoji = '👍') {
    try {
      console.log(`[WA REACTION] ${whatsappNumber}: ${emoji}`);

      const response = await this.axiosInstance.post('/sendReaction', {
        number: this.formatNumber(whatsappNumber),
        messageId: messageId,
        emoji: emoji,
      });

      return response.data;
    } catch (error) {
      console.error('[WA REACTION ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async markAsRead(whatsappNumber, messageId) {
    try {
      const response = await this.axiosInstance.post('/readMessage', {
        number: this.formatNumber(whatsappNumber),
        messageId: messageId,
      });

      return response.data;
    } catch (error) {
      console.error('[WA READ ERROR]', error.message);
      // Não lance erro — read é não-crítico
    }
  }

  /**
   * Transcrever áudio (via Evolution API)
   * Retorna texto da transcrição
   */
  async transcribeAudio(audioUrl) {
    try {
      console.log(`[WA TRANSCRIBE] Transcrevendo áudio...`);

      // Evolution pode ter um endpoint específico pra transcrição
      // Caso não tenha, usar uma API externa (Google Cloud Speech, Deepgram, etc)
      // Por enquanto, placeholder

      const response = await axios.post('https://api-transcription-service.com/transcribe', {
        audioUrl: audioUrl,
      });

      return response.data.transcript || '';
    } catch (error) {
      console.error('[TRANSCRIBE ERROR]', error.message);
      return ''; // Retornar vazio em caso de erro
    }
  }

  /**
   * Download de mídia (foto, áudio) para local
   */
  async downloadMedia(mediaUrl) {
    try {
      console.log(`[WA DOWNLOAD] ${mediaUrl.substring(0, 50)}...`);

      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
      });

      return response.data;
    } catch (error) {
      console.error('[DOWNLOAD ERROR]', error.message);
      throw error;
    }
  }
}

module.exports = WhatsAppClient;
