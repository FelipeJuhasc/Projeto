class ProfessorController {
    constructor() {
        this._apiUrl = 'https://onrender.com';

        this._registrarRotas();
    }

    _registrarRotas() {
        router.registrar('professor/listar',      async (termo)   => await this.getAll(termo));
        router.registrar('professor/buscarPorId', async (id)      => await this.buscarPorId(id));
        router.registrar('professor/adicionar',   async (dados)   => await this.adicionar(dados));
        router.registrar('professor/atualizar',   async (payload) => await this.atualizar(payload.id, payload.dados));
        router.registrar('professor/excluir',     async (id)      => await this.excluir(id));
    }

    async getAll(termo = '') {
        try {
            const url = termo ? `${this._apiUrl}?termo=${termo}` : this._apiUrl;
            const res = await fetch(url);
            const data = await res.json();
            
            // Converte o array do MongoDB em instâncias da classe Professor do seu frontend
            return data.map(p => new Professor(p._id, p.nome, p.graduacao, p.ativo));
        } catch (err) {
            console.error('Erro ao buscar professores do banco:', err);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`);
            const p = await res.json();
            return p ? new Professor(p._id, p.nome, p.graduacao, p.ativo) : null;
        } catch (err) {
            console.error('Erro ao buscar professor por ID:', err);
            return null;
        }
    }

    async adicionar({ nome, graduacao, ativo }) {
        try {
            const res = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, graduacao, ativo })
            });
            const p = await res.json();
            return new Professor(p._id, p.nome, p.graduacao, p.ativo);
        } catch (err) {
            console.error('Erro ao adicionar professor:', err);
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
            console.error('Erro ao atualizar professor:', err);
            return false;
        }
    }

    async excluir(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (err) {
            console.error('Erro ao excluir professor:', err);
            return false;
        }
    }
}

window.professorController = new ProfessorController();
