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

        // Captura os dados caso venham encapsulados em um objeto da Toolbar
        if (typeof filtros === 'object' && filtros !== null) {
            termo = filtros.termo || '';
            dtIni = filtros.dtIni || '';
            dtFim = filtros.dtFim || '';
        } else {
            termo = filtros || '';
        }

        // MONTAGEM SEGURA DE URL: Só adiciona dtIni e dtFim se elas estiverem preenchidas
        let url = `${this._apiUrl}?termo=${encodeURIComponent(termo)}`;
        
        if (dtIni && dtIni.trim() !== '') {
            url += `&dtIni=${dtIni}`;
        }
        if (dtFim && dtFim.trim() !== '') {
            url += `&dtFim=${dtFim}`;
        }

        console.log("[DEBUG CONTROLLER] Buscando disciplinas na URL:", url);

        const res = await fetch(url);
        const data = await res.json();
        
        // Reconstrói a model de disciplinas a partir dos dados do MongoDB Atlas
        return data.map(d => new Disciplina(
            d._id, d.CodDisc, d.DTini, d.DTfim, d.N, d.CargH, d.Controle, d.Obrig, d.MatProf
        ));
    } catch (err) {
        console.error('Erro ao buscar disciplinas no método getAll da controller:', err);
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
