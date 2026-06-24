const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']); // Configura servidores DNS confiáveis

// IMPORTANT: Replace this with your actual connection URI string
const MONGO_URI = 'mongodb+srv://felipejuhasc0_db_user:a1b2c3d4@conjunto.7d1bfau.mongodb.net/conexao?retryWrites=true&w=majority';

// Função 1: Conectar e testar conexão com o MongoDB
async function testarConexao() {
    try {
        // Mongoose manages its own internal connection pool automatically
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI);
        }
        console.log('Conexão com MongoDB realizada com sucesso!');
        return true;
    } catch (err) {
        console.error('Erro ao conectar no MongoDB:', err.message);
        return false;
    }
}

// Função 2: Buscar todos os documentos de uma coleção
// Pass the Mongoose Model instead of a table name string
async function buscarTodos(Model) {
    try {
        const docs = await Model.find({});
        return docs;
    } catch (err) {
        console.error('Erro ao buscar documentos:', err.message);
        throw err;
    }
}

// Função 3: Buscar por ID (Aceita a string de ID hexadecimal padrão do MongoDB)
async function buscarPorId(Model, id) {
    try {
        const doc = await Model.findById(id);
        return doc;
    } catch (err) {
        console.error('Erro ao buscar por ID:', err.message);
        throw err;
    }
}

// Função 4: Inserir novo registro (Documento)
async function inserir(Model, dados) {
    try {
        const novoDocumento = new Model(dados);
        const result = await novoDocumento.save();
        
        console.log(`Inserido com sucesso! ID: ${result._id}`);
        return result._id;
    } catch (err) {
        console.error('Erro ao inserir:', err.message);
        throw err;
    }
}

// Função 5: Atualizar registro por ID
async function atualizar(Model, id, dados) {
    try {
        // { new: true } returns the updated document data instead of the old one
        const result = await Model.findByIdAndUpdate(id, dados, { new: true });
        
        if (result) {
            console.log(`Documento atualizado com sucesso!`);
            return 1; // Equivalente a 1 linha afetada
        }
        console.log(`Nenhum documento encontrado para atualizar.`);
        return 0;
    } catch (err) {
        console.error('Erro ao atualizar:', err.message);
        throw err;
    }
}

// Função 6: Deletar registro por ID
async function deletar(Model, id) {
    try {
        const result = await Model.findByIdAndDelete(id);
        
        if (result) {
            console.log(`Documento deletado com sucesso!`);
            return 1; // Equivalente a 1 linha deletada
        }
        console.log(`Nenhum documento encontrado para deletar.`);
        return 0;
    } catch (err) {
        console.error('Erro ao deletar:', err.message);
        throw err;
    }
}

// Função 7: Busca personalizada (com query object customizado do MongoDB)
// Exemplo de uso: buscarWhere(UsuarioModel, { idade: 25, status: 'ativo' })
async function buscarWhere(Model, condicoes = {}) {
    try {
        const docs = await Model.find(condicoes);
        return docs;
    } catch (err) {
        console.error('Erro na busca personalizada:', err.message);
        throw err;
    }
}

// Função 8: Encerrar conexão
async function fecharConexao() {
    await mongoose.connection.close();
    console.log('Conexão com MongoDB encerrada.');
}

// Exportar todas as funções
module.exports = {
    testarConexao,
    buscarTodos,
    buscarPorId,
    inserir,
    atualizar,
    deletar,
    buscarWhere,
    fecharConexao
};
