const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']); // Configura servidores DNS confiáveis

// Função para testar a conexão com o banco de dados
const connectdb = async () => {
    await mongoose.connect('mongodb+srv://felipejuhasc0_db_user:a1b2c3d4@conjunto.7d1bfau.mongodb.net/')
    console.log(mongoose.connection.host);
}

connectdb();