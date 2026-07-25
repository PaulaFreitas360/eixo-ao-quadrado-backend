/**
 * config.js
 * Configurações centralizadas do backend
 * Carrega variáveis de ambiente e exporta objetos de config
 */

require('dotenv').config();

module.exports = {
  // Servidor
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Claude API
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4000,
    promptPath: process.env.PROMPT_PATH || './prompts/prompt-geracao-materias.txt',
  },

  // Evolution API (WhatsApp)
  evolution: {
    apiUrl: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'eixo-ao-quadrado',
  },

  // Paula (aprovação)
  paula: {
    whatsappNumber: process.env.PAULA_WHATSAPP_NUMBER || '61999116717',
  },

  // GitHub (publicação)
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    committerName: process.env.GITHUB_COMMITTER_NAME || 'Eixo Bot',
    committerEmail: process.env.GITHUB_COMMITTER_EMAIL || 'bot@eixoaoquadrado.com.br',
  },

  // Hostinger (FTP)
  hostinger: {
    ftpHost: process.env.HOSTINGER_FTP_HOST,
    ftpUser: process.env.HOSTINGER_FTP_USER,
    ftpPass: process.env.HOSTINGER_FTP_PASS,
  },

  // Caminhos locais
  paths: {
    promptPath: process.env.PROMPT_PATH || './prompts/prompt-geracao-materias.txt',
    sessionsDb: process.env.SESSIONS_DB || './database/sessions.json',
    uploadsDir: process.env.UPLOADS_DIR || './temp/uploads',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Eixos (referência)
  eixos: {
    1: { nome: 'Negócios e Tendências', slug: 'negocios', cor: 'azul' },
    2: { nome: 'Inovação e Tecnologia', slug: 'inovacao', cor: 'azul' },
    3: { nome: 'Gestão Pública', slug: 'gestao-publica', cor: 'verde' },
    4: { nome: 'Política', slug: 'politica', cor: 'verde' },
    5: { nome: 'Direito e Compliance', slug: 'direito', cor: 'verde' },
    6: { nome: 'ESG', slug: 'esg', cor: 'verde' },
    7: { nome: 'Educação', slug: 'educacao', cor: 'verde' },
    8: { nome: 'Cultura e Arte', slug: 'cultura', cor: 'marrom' },
    9: { nome: 'Gastronomia', slug: 'gastronomia', cor: 'marrom' },
    10: { nome: 'Saúde, Vida e Estilo', slug: 'saude', cor: 'marrom' },
    11: { nome: 'Beleza e Estética', slug: 'beleza', cor: 'marrom' },
    12: { nome: 'Mulheres', slug: 'mulheres', cor: 'rosa' },
    13: { nome: 'Inclusão', slug: 'inclusao', cor: 'roxo' },
    14: { nome: 'No Quadradinho', slug: 'quadradinho', cor: 'cinza' },
  },

  // Timeouts
  timeouts: {
    sessionTimeout: 10 * 60 * 1000, // 10 minutos
    claudeTimeout: 30 * 1000, // 30 segundos
    gitTimeout: 60 * 1000, // 1 minuto
  },

  // Limites
  limits: {
    maxTituloLength: 120,
    maxSubtituloLength: 200,
    maxFotosExtras: 10,
    maxFontesLength: 1000,
  },
};
