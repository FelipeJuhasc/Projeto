class CursoController {
    constructor() {
        this._apiUrl = 'https://onrender.com';
        this._registrarRotas();
    }

    _registrarRotas() {
        router.registrar('curso/listar',      async (termo)   => await this.getAll(termo));
        router.registrar('curso/buscarPorId', async (id)      => await this.buscarPorId(id));
        router.registrar('curso/adicionar',   async (dados)   => await this.adicionar(dados));
        router.registrar('curso/atualizar',   async (payload) => await this.atualizar(payload.id, payload.dados));
        router.registrar('curso/excluir',     async (id)      => await this.excluir(id));
    }

    async getAll(termo = '') {
        try {
            const url = termo ? `${this._apiUrl}?termo=${termo}` : this._apiUrl;
            const res = await fetch(url);
            const data = await res.json();
            
            // Converte o array vindo do MongoDB (usando _id) em instâncias da classe Curso
            return data.map(c => new Curso(
                c._id, c.DTiniIncs, c.DTfimInsc, c.CargaH, c.CargaHTCC, 
                c.Codiesde, c.Gradeiesde, c.CursoInst, c.IniImediato, 
                c.IniMat, c.FimMat, c.Matcoord, c.PasSeg
            ));
        } catch (err) {
            console.error('Erro ao buscar cursos do banco:', err);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`);
            const c = await res.json();
            
            return c ? new Curso(
                c._id, c.DTiniIncs, c.DTfimInsc, c.CargaH, c.CargaHTCC, 
                c.Codiesde, c.Gradeiesde, c.CursoInst, c.IniImediato, 
                c.IniMat, c.FimMat, c.Matcoord, c.PasSeg
            ) : null;
        } catch (err) {
            console.error('Erro ao buscar curso por ID:', err);
            return null;
        }
    }

    async adicionar(dadosCurso) {
        try {
            const res = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCurso)
            });
            const c = await res.json();
            
            return new Curso(
                c._id, c.DTiniIncs, c.DTfimInsc, c.CargaH, c.CargaHTCC, 
                c.Codiesde, c.Gradeiesde, c.CursoInst, c.IniImediato, 
                c.IniMat, c.FimMat, c.Matcoord, c.PasSeg
            );
        } catch (err) {
            console.error('Erro ao adicionar curso:', err);
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
            console.error('Erro ao atualizar curso:', err);
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
            console.error('Erro ao excluir curso:', err);
            return false;
        }
    }
}

window.cursoController = new CursoController();
