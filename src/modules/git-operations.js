/**
 * git-operations.js
 * Operações Git: commit + push automático
 * Publicação via GitHub Actions
 */

const axios = require('axios');

class GitOperations {
  constructor(config) {
    this.token = config.token;
    this.repo = config.repo; // usuario/eixo-ao-quadrado-site
    this.branch = config.branch || 'main';
    this.committerName = config.committerName || 'Eixo Bot';
    this.committerEmail = config.committerEmail || 'bot@eixoaoquadrado.com.br';

    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
  }

  /**
   * Criar ou atualizar arquivo no GitHub via API
   */
  async createOrUpdateFile(filePath, fileContent, commitMessage) {
    try {
      console.log(`[GIT] Criando/atualizando ${filePath}...`);

      const [owner, repo] = this.repo.split('/');

      // Primeiro, tenta obter o arquivo existente (pra pegar o SHA)
      let sha = null;
      try {
        const existing = await this.axiosInstance.get(
          `/repos/${owner}/${repo}/contents/${filePath}`,
          { params: { ref: this.branch } }
        );
        sha = existing.data.sha;
      } catch (error) {
        // Arquivo não existe ainda, sha fica null
      }

      // Encodar conteúdo em base64
      const encodedContent = Buffer.from(fileContent).toString('base64');

      // Chamar API do GitHub
      const response = await this.axiosInstance.put(
        `/repos/${owner}/${repo}/contents/${filePath}`,
        {
          message: commitMessage,
          content: encodedContent,
          branch: this.branch,
          sha: sha, // Se null, será criado; se preenchido, será atualizado
          committer: {
            name: this.committerName,
            email: this.committerEmail,
          },
        }
      );

      console.log(`[GIT] ✅ ${filePath} salvo`);
      return response.data.commit.sha;

    } catch (error) {
      console.error('[GIT ERROR]', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fazer upload de arquivo binário (foto)
   */
  async uploadBinaryFile(filePath, binaryData, commitMessage) {
    try {
      console.log(`[GIT] Upload binário de ${filePath}...`);

      const [owner, repo] = this.repo.split('/');

      // Arquivo binário já vem em buffer
      const encodedContent = binaryData.toString('base64');

      // Obter SHA se arquivo existe
      let sha = null;
      try {
        const existing = await this.axiosInstance.get(
          `/repos/${owner}/${repo}/contents/${filePath}`,
          { params: { ref: this.branch } }
        );
        sha = existing.data.sha;
      } catch (error) {
        // Arquivo novo
      }

      // Upload
      const response = await this.axiosInstance.put(
        `/repos/${owner}/${repo}/contents/${filePath}`,
        {
          message: commitMessage,
          content: encodedContent,
          branch: this.branch,
          sha: sha,
          committer: {
            name: this.committerName,
            email: this.committerEmail,
          },
        }
      );

      console.log(`[GIT] ✅ Binário ${filePath} salvo`);
      return response.data.commit.sha;

    } catch (error) {
      console.error('[GIT BINARY ERROR]', error.message);
      throw error;
    }
  }

  /**
   * Criar commit com múltiplos arquivos (avançado)
   * Usa API de árvore do Git
   */
  async createCommitMultipleFiles(files, commitMessage) {
    try {
      console.log(`[GIT] Criando commit com ${files.length} arquivos...`);

      const [owner, repo] = this.repo.split('/');

      // files = [ { path, content, isBase64 }, ... ]

      // 1. Obter ref do branch atual
      const branchRef = await this.axiosInstance.get(
        `/repos/${owner}/${repo}/git/refs/heads/${this.branch}`
      );
      const latestCommitSha = branchRef.data.object.sha;

      // 2. Obter árvore do commit atual
      const commitData = await this.axiosInstance.get(
        `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`
      );
      const baseSha = commitData.data.tree.sha;

      // 3. Criar árvore com novos arquivos
      const treeItems = files.map((file) => ({
        path: file.path,
        mode: '100644', // arquivo regular
        type: 'blob',
        content: file.isBase64 ? undefined : file.content,
        sha: file.isBase64 
          ? (Buffer.isBuffer(file.content) 
              ? file.content.toString('base64')
              : file.content)
          : undefined,
      }));

      const treeResponse = await this.axiosInstance.post(
        `/repos/${owner}/${repo}/git/trees`,
        {
          base_tree: baseSha,
          tree: treeItems,
        }
      );

      const newTreeSha = treeResponse.data.sha;

      // 4. Criar novo commit
      const commitResponse = await this.axiosInstance.post(
        `/repos/${owner}/${repo}/git/commits`,
        {
          message: commitMessage,
          tree: newTreeSha,
          parents: [latestCommitSha],
          committer: {
            name: this.committerName,
            email: this.committerEmail,
          },
        }
      );

      const newCommitSha = commitResponse.data.sha;

      // 5. Atualizar ref do branch
      await this.axiosInstance.patch(
        `/repos/${owner}/${repo}/git/refs/heads/${this.branch}`,
        { sha: newCommitSha, force: false }
      );

      console.log(`[GIT] ✅ Commit criado: ${newCommitSha}`);
      return newCommitSha;

    } catch (error) {
      console.error('[GIT MULTI ERROR]', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verificar status do GitHub Actions (deploy)
   */
  async checkActionsStatus() {
    try {
      const [owner, repo] = this.repo.split('/');

      const response = await this.axiosInstance.get(
        `/repos/${owner}/${repo}/actions/runs`,
        { params: { per_page: 5 } }
      );

      return response.data.workflow_runs;

    } catch (error) {
      console.error('[GIT ACTIONS ERROR]', error.message);
      return [];
    }
  }
}

module.exports = GitOperations;
