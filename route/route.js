/**
 * Router simples — sem ES modules, funciona direto no browser via file://
 *
 *  View  --enviar(rota, dados)-->  Router  --executa-->  Controller  -->  Model
 */
class Router {
    constructor() {
        this._rotas = {};
    }

    registrar(nomeRota, callback) {
        this._rotas[nomeRota] = callback;
    }

        async enviar(nomeRota, dados) {
        const callback = this._rotas[nomeRota];
        if (!callback) {
            console.error(`[Router] Rota "${nomeRota}" não encontrada.`);
            return null;
        }
        // Added 'await' to support async controller methods
        return await callback(dados); 
    }

}

// Singleton global acessível por todos os scripts
window.router = new Router();