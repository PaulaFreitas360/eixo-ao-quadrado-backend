/**
 * session-manager.js
 * Gerencia estado das conversas (sessões)
 * Rastreia qual ESTADO cada usuário está
 * Persiste dados em JSON (depois migra pra Firebase)
 */

const fs = require('fs');
const path = require('path');

class SessionManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.ensureDbExists();
    this.sessionTimeout = 10 * 60 * 1000; // 10 minutos
    this.startTimeoutChecker();
  }

  /**
   * Criar arquivo de sessões se não existir
   */
  ensureDbExists() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
    }
  }

  /**
   * Ler todas as sessões
   */
  readDb() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[DB ERROR]', error);
      return {};
    }
  }

  /**
   * Salvar todas as sessões
   */
  writeDb(db) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
    } catch (error) {
      console.error('[DB WRITE ERROR]', error);
    }
  }

  /**
   * Recuperar sessão por número
   */
  getSession(whatsappNumber) {
    const db = this.readDb();
    return db[whatsappNumber] || null;
  }

  /**
   * Criar nova sessão
   */
  createSession(whatsappNumber) {
    const session = {
      numero: whatsappNumber,
      currentState: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      data: {
        // será preenchido nos estados
        conteudo_bruto: [],
        titulo: '',
        subtitulo: '',
        eixo_escolhido: null,
        foto_capa: null,
        fotos_extras: [],
        fotos_origem: {},
        fontes: [],
        credito_autor: '',
        consentimentos: {
          publicacao: false,
          fotos: false,
          responsabilidade: false,
        },
      },
    };
    this.saveSession(whatsappNumber, session);
    return session;
  }

  /**
   * Salvar sessão
   */
  saveSession(whatsappNumber, session) {
    const db = this.readDb();
    session.lastActivity = new Date().toISOString();
    db[whatsappNumber] = session;
    this.writeDb(db);
  }

  /**
   * Deletar sessão
   */
  deleteSession(whatsappNumber) {
    const db = this.readDb();
    delete db[whatsappNumber];
    this.writeDb(db);
    console.log(`[CLEANUP] Sessão ${whatsappNumber} removida`);
  }

  /**
   * Verificar timeouts a cada 1 minuto
   */
  startTimeoutChecker() {
    setInterval(() => {
      const db = this.readDb();
      const now = Date.now();

      Object.keys(db).forEach((numero) => {
        const session = db[numero];
        const lastActivityTime = new Date(session.lastActivity).getTime();
        const elapsed = now - lastActivityTime;

        if (elapsed > this.sessionTimeout) {
          console.log(`[TIMEOUT] Sessão de ${numero} expirada`);
          delete db[numero];
        }
      });

      this.writeDb(db);
    }, 60 * 1000); // 1 minuto
  }

  /**
   * Listar todas as sessões ativas
   */
  listActiveSessions() {
    return this.readDb();
  }

  /**
   * Atualizar parte dos dados da sessão
   */
  updateSessionData(whatsappNumber, updates) {
    const session = this.getSession(whatsappNumber);
    if (session) {
      Object.assign(session.data, updates);
      this.saveSession(whatsappNumber, session);
    }
  }
}

module.exports = SessionManager;
