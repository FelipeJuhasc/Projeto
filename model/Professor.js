class Professor {
    constructor(id, nome, graduacao, ativo = true, ra) {
        this._id = id;
        this._nome = nome;
        this._graduacao = graduacao;
        this._ativo = ativo;
        this._ra = ra;
    }

    get id()        { return this._id; }
    get nome()      { return this._nome; }
    get graduacao() { return this._graduacao; }
    get ra()        { return this._ra; }

    set nome(novoNome) {
        // Aceita letras, acentos, espaços e hifens (nomes reais)
        if (novoNome && novoNome.trim().length > 1)
            this._nome = novoNome.trim();
        else
            console.error('Nome inválido:', novoNome);
    }

    set graduacao(novaGraduacao) {
        if (novaGraduacao && novaGraduacao.trim().length > 1)
            this._graduacao = novaGraduacao.trim();
        else
            console.error('Graduação inválida:', novaGraduacao);
    }
    get ativo(){
        return this._ativo;
    }

    set ativo(Novoativo){
        if(Novoativo != this._ativo)
            this._ativo = Novoativo;
    }

    set ra(novoRA){
        if(novoRA > 0 && Number.isInteger(novoRA))
            this._ra = novoRA;
        else
            console.error('RA inválido:', novoRA);
    }
}

// Disponível globalmente para o Controller
window.Professor = Professor;