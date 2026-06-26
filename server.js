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
    ativo: { type: Boolean, default: true }, // Mapeado como Boolean para facilitar filtros
    ra: { type: String, required: true, unique: true } // Número de registro do professor
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
    MatProf:  { type: String, required: true }
});

// Força o Mongoose a usar a coleção exatamente com a grafia da sua imagem: 'discinplina'
const DisciplinaModel = mongoose.model('Disciplina', DisciplinaSchema, 'discinplina');

// =================================================================
// ROTAS DA API PARA DISCIPLINA
// =================================================================
app.get('/api/disciplinas', async (req, res) => {
    try {
        const { termo, dtIni, dtFim } = req.query;
        let condicao = {};

        // 1. Text match filter for course code
        if (termo && termo !== '[object Object]') {
            condicao.CodDisc = { $regex: termo, $options: 'i' };
        }

        // 2. Strict validation matching for real dates
        // Only trigger query mutations if strings are populated and contain actual date characters
        if ((dtIni && dtIni.trim() !== '') || (dtFim && dtFim.trim() !== '')) {
            condicao.$and = [];
            
            if (dtIni && dtIni.trim() !== '') {
                const dateStart = new Date(dtIni);
                if (!isNaN(dateStart)) {
                    condicao.$and.push({ DTfim: { $gte: dateStart } });
                }
            }
            if (dtFim && dtFim.trim() !== '') {
                const dateEnd = new Date(dtFim);
                if (!isNaN(dateEnd)) {
                    condicao.$and.push({ DTini: { $lte: dateEnd } });
                }
            }
            
            // Clean up condition structure if arrays evaluated empty
            if (condicao.$and.length === 0) delete condicao.$and;
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

    // =================================================================
// SCHEMA E MODELO DE CURSO
// =================================================================
const CursoSchema = new mongoose.Schema({
    CursoInst:   { type: String, required: true },
    DTiniIncs:   { type: Date, required: true },
    DTfimInsc:   { type: Date, required: true },
    CargaH:      { type: Number, required: true },
    CargaHTCC:   { type: Number, required: true },
    Codiesde:    { type: String, required: true },
    Gradeiesde:  { type: String, required: true },
    IniImediato: { type: Boolean, default: false },
    IniMat:      { type: Date, required: true },
    FimMat:      { type: Date, required: true },
    Matcoord:    { type: String, required: true },
    PasSeg:      { type: Boolean, default: false },
    disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disciplina' }] // Ref deve bater com o nome do modelo
});
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
        // Enforce data populate operations over target array arrays
        const curso = await CursoModel.findById(req.params.id).populate('disciplinas');
        res.json(curso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Add a discipline to a course timeline schedule
app.post('/api/cursos/:cursoId/vincular-disciplina', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { disciplinaId } = req.body;

        if (!disciplinaId) {
            return res.status(400).json({ success: false, message: 'ID da disciplina é obrigatório.' });
        }

        // Busca o documento do curso na base de dados
        const cursoExistente = await CursoModel.findById(cursoId);
        if (!cursoExistente) {
            return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
        }

        // Inicializa o array caso ele não exista por conta de cadastros antigos do Atlas
        if (!cursoExistente.disciplinas) {
            cursoExistente.disciplinas = [];
        }

        // Converte o ID recebido para o formato ObjectId do Mongoose
        const oIdDisciplina = new mongoose.Types.ObjectId(disciplinaId);

        // Verifica se o ID já consta no cronograma para evitar duplicidades
        const jaExiste = cursoExistente.disciplinas.some(id => id.toString() === oIdDisciplina.toString());
        
        if (jaExiste) {
            return res.json({ success: true, message: 'Disciplina já cadastrada neste cronograma.' });
        }

        // Insere o identificador e commita na nuvem através do método save nativo
        cursoExistente.disciplinas.push(oIdDisciplina);
        await cursoExistente.save();

        // Retorna a estrutura populada usando o modelo devidamente registrado
        const cursoAtualizado = await CursoModel.findById(cursoId).populate('disciplinas');

        res.json({ success: true, curso: cursoAtualizado });
    } catch (err) {
        console.error('Erro interno detectado no Render:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});


// Remove a discipline from a course timeline schedule
app.post('/api/cursos/:cursoId/desvincular-disciplina', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { disciplinaId } = req.body;

        const cursoAtualizado = await CursoModel.findByIdAndUpdate(
            cursoId,
            { $pull: { disciplinas: disciplinaId } }, // $pull removes item from array
            { new: true }
        );

        res.json({ success: true, curso: cursoAtualizado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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