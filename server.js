const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 
const db = require('./banco.js'); // Your banco.js file

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); 

// =================================================================
// 2. SCHEMAS & MONGOOSE MODELS (No block wrapper braces!)
// =================================================================
const UsuarioSchema = new mongoose.Schema({
    login: { type: String, required: true },
    senha: { type: String, required: true },
    permissao: { type: String, enum: ['visao', 'edicao', 'adm'], required: true }
});
const UsuarioModel = mongoose.model('Usuario', UsuarioSchema, 'usuario');

// =================================================================
// 3. API ENDPOINTS
// =================================================================

// --- LOGIN AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
        const { login, senha } = req.body;
        const usuarioEncontrado = await UsuarioModel.findOne({ login: login, senha: senha });

        if (usuarioEncontrado) {
            res.json({ 
                success: true, 
                message: 'Autenticado com sucesso!',
                permissao: usuarioEncontrado.permissao 
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- USUARIOS CRUD ---
app.get('/api/usuarios', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        let condicao = {};
        if (termo) {
            condicao = { login: { $regex: termo, $options: 'i' } }; 
        }
        const usuarios = await db.buscarWhere(UsuarioModel, condicao);
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await db.buscarPorId(UsuarioModel, req.params.id);
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/usuarios', async (req, res) => {
    try {
        const novoId = await db.inserir(UsuarioModel, req.body);
        res.json({ _id: novoId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    try {
        await db.atualizar(UsuarioModel, req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.deletar(UsuarioModel, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ** NOTE: Keep your Professor, Disciplina, and Curso endpoints placed right here **

// =================================================================
// 4. STATIC FRONTEND ROUTING (Always keep at the absolute bottom!)
// =================================================================
app.use(express.static(__dirname)); 
app.use('/view', express.static(path.join(__dirname, 'view')));
app.use('/controller', express.static(path.join(__dirname, 'controller')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

{
// =================================================================
// SCHEMA E MODELO DE PROFESSOR
// =================================================================
const ProfessorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    graduacao: { type: String, required: true },
    ativo: { type: Boolean, default: true } // Mapeado como Boolean para facilitar filtros
});

// Força o Mongoose a usar a coleção singular 'professor' do seu banco 'conexao'
const ProfessorModel = mongoose.model('Professor', ProfessorSchema, 'professor');

// =================================================================
// ROTAS DA API PARA PROFESSOR
// =================================================================
app.get('/api/professores', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        let condicao = {};
        if (termo) {
            condicao = { nome: { $regex: termo, $options: 'i' } }; // Busca por nome (case-insensitive)
        }
        const professores = await db.buscarWhere(ProfessorModel, condicao);
        res.json(professores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/professores/:id', async (req, res) => {
    try {
        const professor = await db.buscarPorId(ProfessorModel, req.params.id);
        res.json(professor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/professores', async (req, res) => {
    try {
        const novoId = await db.inserir(ProfessorModel, req.body);
        res.json({ _id: novoId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/professores/:id', async (req, res) => {
    try {
        await db.atualizar(ProfessorModel, req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/professores/:id', async (req, res) => {
    try {
        await db.deletar(ProfessorModel, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
}

{
    // =================================================================
// SCHEMA E MODELO DE DISCIPLINA
// =================================================================
const DisciplinaSchema = new mongoose.Schema({
    CodDisc:  { type: String, required: true },
    DTini:    { type: Date, required: true },
    DTfim:    { type: Date, required: true },
    N:        { type: Number, required: true },
    CargH:    { type: Number, required: true },
    Controle: { type: String, required: true },
    Obrig:    { type: Boolean, default: true },
    MatProf:  { type: String, required: true } // Matrícula do professor vinculado
});

// Força o Mongoose a usar a coleção exatamente com a grafia da sua imagem: 'discinplina'
const DisciplinaModel = mongoose.model('Disciplina', DisciplinaSchema, 'discinplina');

// =================================================================
// ROTAS DA API PARA DISCIPLINA
// =================================================================
app.get('/api/disciplinas', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        let condicao = {};
        if (termo) {
            condicao = { CodDisc: { $regex: termo, $options: 'i' } }; // Busca pelo código da disciplina
        }
        const disciplinas = await db.buscarWhere(DisciplinaModel, condicao);
        res.json(disciplinas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/disciplinas/:id', async (req, res) => {
    try {
        const disciplina = await db.buscarPorId(DisciplinaModel, req.params.id);
        res.json(disciplina);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/disciplinas', async (req, res) => {
    try {
        const novoId = await db.inserir(DisciplinaModel, req.body);
        res.json({ _id: novoId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/disciplinas/:id', async (req, res) => {
    try {
        await db.atualizar(DisciplinaModel, req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/disciplinas/:id', async (req, res) => {
    try {
        await db.deletar(DisciplinaModel, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

}

{
    // =================================================================
// SCHEMA E MODELO DE CURSO
// =================================================================
const CursoSchema = new mongoose.Schema({
    DTiniIncs:   { type: Date, required: true },
    DTfimInsc:   { type: Date, required: true },
    CargaH:      { type: Number, required: true },
    CargaHTCC:   { type: Number, required: true },
    Codiesde:    { type: String, required: true },
    Gradeiesde:  { type: String, required: true },
    CursoInst:   { type: String, required: true },
    IniImediato: { type: Boolean, default: false },
    IniMat:      { type: Date, required: true },
    FimMat:      { type: Date, required: true },
    Matcoord:    { type: String, required: true },
    PasSeg:      { type: Boolean, default: false }
});

// Força o Mongoose a usar a coleção singular 'curso' do seu banco 'conexao'
const CursoModel = mongoose.model('Curso', CursoSchema, 'curso');

// =================================================================
// ROTAS DA API PARA CURSO
// =================================================================
app.get('/api/cursos', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        let condicao = {};
        if (termo) {
            condicao = { CursoInst: { $regex: termo, $options: 'i' } }; // Busca pelo nome da instituição/curso
        }
        const cursos = await db.buscarWhere(CursoModel, condicao);
        res.json(cursos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cursos/:id', async (req, res) => {
    try {
        const curso = await db.buscarPorId(CursoModel, req.params.id);
        res.json(curso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cursos', async (req, res) => {
    try {
        const novoId = await db.inserir(CursoModel, req.body);
        res.json({ _id: novoId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cursos/:id', async (req, res) => {
    try {
        await db.atualizar(CursoModel, req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cursos/:id', async (req, res) => {
    try {
        await db.deletar(CursoModel, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

}

// =================================================================
// 5. SERVER RUNTIME ENGINE INITIALIZATION
// =================================================================
const PORT = process.env.PORT || 3000;

async function iniciarSistema() {
    try {
        // Force establish database pool pipeline connection first
        await db.testarConexao();
        
        // Start processing network server traffic streams
        app.listen(PORT, () => console.log(`Servidor rodando com sucesso na porta ${PORT}`));
    } catch (error) {
        console.error("Erro crítico na inicialização do ecossistema:", error.message);
    }
}

iniciarSistema();
