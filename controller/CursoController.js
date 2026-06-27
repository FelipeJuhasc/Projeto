class CursoController {
    constructor() {
        this._apiUrl = '/api/cursos';
        this._registrarRotas();
    }

    _registrarRotas() {
        if (typeof router === 'undefined') {
            console.warn('Router não encontrado!');
            return;
        }

        router.registrar('curso/listar',      async (filtros) => await this.getAll(filtros));
        router.registrar('curso/buscarPorId', async (id)      => await this.buscarPorId(id));
        router.registrar('curso/adicionar',   async (dados)   => await this.adicionar(dados));
        router.registrar('curso/atualizar',   async (payload) => await this.atualizar(payload.id, payload.dados));
        router.registrar('curso/excluir',     async (id)      => await this.excluir(id));
    }

    async getAll(filtros = {}) {
        try {
            const { termo = '', dtIni = '', dtFim = '' } = filtros;

            let url = this._apiUrl;
            const params = new URLSearchParams();

            if (termo) params.append('termo', termo);
            if (dtIni) params.append('dtIni', dtIni);
            if (dtFim) params.append('dtFim', dtFim);

            if (params.toString()) url += '?' + params.toString();

            const res = await fetch(url);
            if (!res.ok) throw new Error('Erro na API');

            const data = await res.json();

            return data.map(c => new Curso(
                c._id || c.id,
                c.DTiniIncs,
                c.DTfimInsc,
                c.CargaH,
                c.CargaHTCC,
                c.Codiesde,
                c.Gradeiesde,
                c.CursoInst,
                c.IniImediato,
                c.IniMat,
                c.FimMat,
                c.Matcoord,
                c.PasSeg
            ));
        } catch (err) {
            console.error('Erro ao buscar cursos:', err);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`);
            if (!res.ok) throw new Error('Curso não encontrado');
            const c = await res.json();

            return new Curso(
                c._id || c.id, c.DTiniIncs, c.DTfimInsc, c.CargaH, c.CargaHTCC,
                c.Codiesde, c.Gradeiesde, c.CursoInst, c.IniImediato,
                c.IniMat, c.FimMat, c.Matcoord, c.PasSeg
            );
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
            return new Curso(...Object.values(c)); // simplificado
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
            console.error('Erro ao atualizar:', err);
            return false;
        }
    }

    async excluir(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`, { method: 'DELETE' });
            return res.ok;
        } catch (err) {
            console.error('Erro ao excluir:', err);
            return false;
        }
    }
}

window.cursoController = new CursoController();