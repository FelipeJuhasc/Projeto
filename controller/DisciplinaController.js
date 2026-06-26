class DisciplinaController {
    constructor() {
        this._apiUrl = '/api/disciplinas';
        this._registrarRotas();
    }

    _registrarRotas() {
    router.registrar('disciplina/listar',      async (termo)   => await this.getAll(termo));
    router.registrar('disciplina/buscarPorId', async (id)      => await this.buscarPorId(id));
    router.registrar('disciplina/adicionar',   async (dados)   => await this.adicionar(dados));
    router.registrar('disciplina/atualizar',   async (payload) => await this.atualizar(payload.id, payload.dados));
    router.registrar('disciplina/excluir',     async (id)      => await this.excluir(id));
    
    // Garanta que essas duas linhas abaixo estejam salvas no seu arquivo DisciplinaController.js externo:
    router.registrar('curso/vincular',         async (p)       => await this.vincularDisciplina(p.cursoId, p.disciplinaId));
    router.registrar('curso/desvincular',      async (p)       => await this.desvincularDisciplina(p.cursoId, p.disciplinaId));
}


    async getAll(filtros = '') {
    try {
        let termo = '';
        let dtIni = '';
        let dtFim = '';

        // Tratamento inteligente: verifica se o filtro recebido é o novo objeto ou texto comum
        if (typeof filtros === 'object' && filtros !== null) {
            termo = filtros.termo || '';
            dtIni = filtros.dtIni || '';
            dtFim = filtros.dtFim || '';
        } else {
            termo = filtros || '';
        }

        // Constrói a URL de forma segura enviando os parâmetros para o Render
        const url = `${this._apiUrl}?termo=${encodeURIComponent(termo)}&dtIni=${dtIni}&dtFim=${dtFim}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        // Mapeia o resultado retornado do MongoDB Atlas
        return data.map(d => new Disciplina(
            d._id, d.CodDisc, d.DTini, d.DTfim, d.N, d.CargH, d.Controle, d.Obrig, d.MatProf
            
        ));
    } catch (err) {
        console.error('Erro ao buscar disciplinas no banco:', err);
        return [];
    }
}


    async buscarPorId(id) {
        try {
            const res = await fetch(`${this._apiUrl}/${id}`);
            const d = await res.json();
            
            return d ? new Disciplina(
                d._id, 
                d.CodDisc, 
                d.DTini, 
                d.DTfim, 
                d.N, 
                d.CargH, 
                d.Controle, 
                d.Obrig, 
                d.MatProf
            ) : null;
        } catch (err) {
            console.error('Erro ao buscar disciplina por ID:', err);
            return null;
        }
    }

    async adicionar(dadosDisciplina) {
        try {
            const res = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosDisciplina)
            });
            const d = await res.json();
            
            return new Disciplina(
                d._id, 
                d.CodDisc, 
                d.DTini, 
                d.DTfim, 
                d.N, 
                d.CargH, 
                d.Controle, 
                d.Obrig, 
                d.MatProf
            );
        } catch (err) {
            console.error('Erro ao adicionar disciplina:', err);
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
            console.error('Erro ao atualizar disciplina:', err);
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
            console.error('Erro ao excluir disciplina:', err);
            return false;
        }
    }
}

window.disciplinaController = new DisciplinaController();
