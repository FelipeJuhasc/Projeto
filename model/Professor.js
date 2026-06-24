class Professor {
    constructor(id, nome, graduacao, ativo = true) {
        this._id = id;
        this._nome = nome;
        this._graduacao = graduacao;
        this._ativo = ativo;
    }

    get id()        { return this._id; }
    get nome()      { return this._nome; }
    get graduacao() { return this._graduacao; }

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
}

// Disponível globalmente para o Controller
window.Professor = Professor;