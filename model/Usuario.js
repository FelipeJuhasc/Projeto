const PERMISSOES_VALIDAS = ['visao', 'edicao', 'adm'];

class Usuario {
    constructor(id, login, senha, permissao) {
        this._id        = id;
        this._login     = login;
        this._senha     = senha;
        this._permissao = permissao;
    }

    get id()        { return this._id; }
    get login()     { return this._login; }
    get senha()     { return this._senha; }
    get permissao() { return this._permissao; }

    set login(v) {
        if (v && v.trim().length > 1)
            this._login = v.trim();
        else
            console.error('[Usuario] Login inválido:', v);
    }

    set senha(v) {
        if (v && v.trim().length >= 4)
            this._senha = v.trim();
        else
            console.error('[Usuario] Senha deve ter ao menos 4 caracteres.');
    }

    set permissao(v) {
        const normalizado = v ? v.trim().toLowerCase() : '';
        if (PERMISSOES_VALIDAS.includes(normalizado))
            this._permissao = normalizado;
        else
            console.error('[Usuario] Permissão inválida. Use: visao, edicao ou adm.');
    }
}

window.Usuario = Usuario;