class UsuarioController {
    constructor() {
        this._apiUrl = 'https://projeto-ii4x.onrender.com/view/usuarioView.html';
        this._registrarRotas();
    }

    _registrarRotas() {
        router.registrar('usuario/listar',      async (termo)   => await this.getAll(termo));
        router.registrar('usuario/buscarPorId', async (id)      => await this.buscarPorId(id));
        router.registrar('usuario/adicionar',   async (dados)   => await this.adicionar(dados));
        router.registrar('usuario/atualizar',   async (payload) => await this.atualizar(payload.id, payload.dados));
        router.registrar('usuario/excluir',     async (id)      => await this.excluir(id));
    }

    async getAll(termo = '') {
        try {
            const url = termo ? `${this._apiUrl}?termo=${termo}` : this._apiUrl;
            const res = await fetch(url);
            const data = await res.json();
            
            // Map MongoDB array objects to your local frontend Usuario instances
            return data.map(u => new Usuario(u._id, u.login, u.senha, u.permissao));
        } catch (err) {
            console.error('Erro ao buscar usuários do banco:', err);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`);
            const u = await res.json();
            return u ? new Usuario(u._id, u.login, u.senha, u.permissao) : null;
        } catch (err) {
            console.error('Erro ao buscar por ID:', err);
            return null;
        }
    }

    async adicionar({ login, senha, permissao }) {
        try {
            const res = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, senha, permissao })
            });
            const u = await res.json();
            return new Usuario(u._id, u.login, u.senha, u.permissao);
        } catch (err) {
            console.error('Erro ao adicionar usuário:', err);
            return null;
        }
    }

    async atualizar(id, dados) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            return res.ok;
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            return null;
        }
    }

    async excluir(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            return false;
        }
    }
}

window.usuarioController = new UsuarioController();
