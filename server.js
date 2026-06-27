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

const cron = require('node-cron');

// 1. FUNÇÃO GLOBAL QUE VARRE E ROTACIONA TODOS OS CURSOS AUTOMATICAMENTE
async function executarRotacaoAutomaticaMensal() {
    console.log(`[AUTOMAÇÃO REAL] ${new Date().toISOString()} - Iniciando rotação mensal automática de cronogramas...`);
    try {
        const cursos = await CursoModel.find({});
        
        for (let curso of cursos) {
            if (!curso.disciplinas || curso.disciplinas.length <= 1) continue;

            const posicoesFixas = curso.disciplinas.filter(d => d.fixa).map(d => d.ordem);
            const totalDisciplinas = curso.disciplinas.length;
            let naoFixas = curso.disciplinas.filter(d => !d.fixa);

            naoFixas.forEach(d => {
                let novaOrdem = d.ordem - 1;
                if (novaOrdem < 1) novaOrdem = totalDisciplinas;
                d.ordem = novaOrdem;
            });

            let houveColisao;
            do {
                houveColisao = false;
                naoFixas.forEach(d => {
                    if (posicoesFixas.includes(d.ordem)) {
                        d.ordem = d.ordem - 1;
                        if (d.ordem < 1) d.ordem = totalDisciplinas;
                        houveColisao = true;
                    }
                });
            } while (houveColisao);

            const todasAtualizadas = [
                ...curso.disciplinas.filter(d => d.fixa),
                ...naoFixas
            ];

            todasAtualizadas.sort((a, b) => a.ordem - b.ordem);
            
            let ordemEsperada = 1;
            todasAtualizadas.forEach(d => {
                d.ordem = ordemEsperada++;
            });

            curso.disciplinas = todasAtualizadas;
            await curso.save();
            console.log(`[AUTOMAÇÃO] Curso ID ${curso._id} rotacionado com sucesso via calendário real.`);
        }
        console.log("[AUTOMAÇÃO REAL] Todos os cronogramas foram atualizados para o novo mês.");
    } catch (err) {
        console.error("[ERRO CRÍTICO AUTOMAÇÃO]:", err.message);
    }
}

// 2. AGENDADOR CRON (Padrão de tempo: Minuto Hora DiaDoMês Mês DiaDaSemana)
// A expressão '1 0 1 * *' significa: Todo dia 1º de cada mês, às 00:01 da manhã
cron.schedule('1 0 1 * *', async () => {
    await executarRotacaoAutomaticaMensal();
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo" // Força o fuso horário correto do Brasil
});


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

// NOVA ROTA: Retorna apenas os docentes aptos para novos agendamentos
app.get('/api/professores/ativos', async (req, res) => {
    try {
        // Filtra estritamente por documentos que possuem a propriedade ativo como verdadeira
        const professoresAtivos = await ProfessorModel.find({ ativo: true }).lean();
        res.json(professoresAtivos);
    } catch (err) {
        console.error('Erro ao buscar professores ativos para o dropdown:', err.message);
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
    MatProf:  { type: String, required: true } // Guarda o ID/Matrícula do professor vinculado
});

const DisciplinaModel = mongoose.model('Disciplina', DisciplinaSchema, 'disciplina');



// =================================================================
// ROTAS DA API PARA DISCIPLINA
// =================================================================
app.get('/api/disciplinas', async (req, res) => {
    try {
        const { termo, dtIni, dtFim } = req.query;
        let condicao = {};

        // 1. Filtro por código da disciplina (texto)
        if (termo && termo !== '[object Object]' && termo !== 'undefined') {
            condicao.CodDisc = { $regex: termo, $options: 'i' };
        }

        // 2. Filtro estrito de datas (ignora lixo de requisição)
        if (dtIni && dtIni.trim() !== "" && dtIni !== "undefined" && dtIni !== "[object Object]" || 
            dtFim && dtFim.trim() !== "" && dtFim !== "undefined" && dtFim !== "[object Object]") {
            
            condicao.$and = [];
            
            if (dtIni && dtIni.trim() !== "" && dtIni !== "undefined") {
                const dateStart = new Date(dtIni);
                if (!isNaN(dateStart)) {
                    condicao.$and.push({ DTfim: { $gte: dateStart } });
                }
            }
            if (dtFim && dtFim.trim() !== "" && dtFim !== "undefined") {
                const dateEnd = new Date(dtFim);
                if (!isNaN(dateEnd)) {
                    condicao.$and.push({ DTini: { $lte: dateEnd } });
                }
            }
            
            if (condicao.$and.length === 0) delete condicao.$and;
        }

        console.log("[DIAGNÓSTICO] Buscando disciplinas com a query:", JSON.stringify(condicao));

        // CORREÇÃO DA PERSISTÊNCIA: Usamos o .find() nativo do Mongoose em vez do db.buscarWhere.
        // Adicionamos o .lean() para transformar o retorno em objetos JavaScript puros de alta velocidade.
        const dadosBrutos = await DisciplinaModel.find(condicao).lean();
        
        // MAPEAMENTO DE COMPATIBILIDADE: Garante que cada item devolvido possua tanto o campo _id quanto o campo id.
        // Isso resolve o problema de a View não conseguir ler o identificador único!
        const disciplinasFormatadas = dadosBrutos.map(d => ({
            id: d._id.toString(), // Cria o .id estrito esperado pelo (disc.id === selecionadoId) da View
            _id: d._id.toString(),
            CodDisc: d.CodDisc,
            DTini: d.DTini,
            DTfim: d.DTfim,
            N: d.N,
            CargH: d.CargH,
            Controle: d.Controle,
            Obrig: d.Obrig,
            MatProf: d.MatProf
        }));

        console.log(`[DIAGNÓSTICO] Sucesso! Enviando ${disciplinasFormatadas.length} disciplinas para a View.`);
        res.json(disciplinasFormatadas);

    } catch (err) {
        console.error('Erro crítico na rota de disciplinas:', err.message);
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
        // Inserção através do seu utilitário de persistência do banco.js
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
    disciplinas: [{
        disciplinaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disciplina' },
        ordem:        { type: Number, required: true, default: 1 },
        fixa:         { type: Boolean, required: true, default: false }
    }]
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
        // Modificado para caminhar por dentro do novo array de objetos do Mongoose
        const curso = await CursoModel.findById(req.params.id).populate('disciplinas.disciplinaId');
        res.json(curso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cursos/:cursoId/rotacionar-cronograma', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const curso = await CursoModel.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, message: 'Curso não encontrado.' });

        if (!curso.disciplinas || curso.disciplinas.length <= 1) {
            return res.json({ success: true, message: 'Quantidade insuficiente de disciplinas para rotacionar.', curso });
        }

        // 1. Mapeia e separa as posições que estão ocupadas por disciplinas FIXAS
        const posicoesFixas = curso.disciplinas.filter(d => d.fixa).map(d => d.ordem);
        const totalDisciplinas = curso.disciplinas.length;

        // 2. Cria uma lista das disciplinas que PODEM rodar (não-fixas)
        let naoFixas = curso.disciplinas.filter(d => !d.fixa);

        // 3. Aplica a rotação lógica descendo 1 posição e jogando o 1 para o final
        naoFixas.forEach(d => {
            let novaOrdem = d.ordem - 1;

            // Se chegou a 1 ou menos na contagem, vira o último na ordem (fim da fila)
            if (novaOrdem < 1) {
                novaOrdem = totalDisciplinas;
            }

            d.ordem = novaOrdem;
        });

        // 4. Resolve colisões com posições fixas (ajusta recursivamente se bater com um fixo)
        let houveColisao;
        do {
            houveColisao = false;
            naoFixas.forEach(d => {
                // Se colidir com a posição de um fixo, desce mais 1 posição (pula a contagem)
                if (posicoesFixas.includes(d.ordem)) {
                    d.ordem = d.ordem - 1;
                    if (d.ordem < 1) d.ordem = totalDisciplinas;
                    houveColisao = true;
                }
            });
        } while (houveColisao);

        // 5. Junta novamente o array atualizado de fixas e não-fixas
        const todasAtualizadas = [
            ...curso.disciplinas.filter(d => d.fixa),
            ...naoFixas
        ];

        // Ordena para garantir integridade numérica de 1 até o total
        todasAtualizadas.sort((a, b) => a.ordem - b.ordem);
        
        // Corrige duplicidades raras forçando a sequência linear nas não-fixas se necessário
        let ordemEsperada = 1;
        todasAtualizadas.forEach(d => {
            d.ordem = ordemEsperada++;
        });

        // Salva as novas ordens de rotação no MongoDB Atlas
        curso.disciplinas = todasAtualizadas;
        await curso.save();

        const cursoFinal = await CursoModel.findById(cursoId).populate('disciplinas.disciplinaId');
        res.json({ success: true, curso: cursoFinal });

    } catch (err) {
        console.error('Erro ao rotacionar cronograma:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});



// 1. ROTA DE VÍNCULO ATUALIZADA (Calcula a ordem automaticamente)
app.post('/api/cursos/:cursoId/vincular-disciplina', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { disciplinaId } = req.body;

        const cursoExistente = await CursoModel.findById(cursoId);
        if (!cursoExistente) return res.status(404).json({ success: false, message: 'Curso não encontrado.' });

        if (!cursoExistente.disciplinas) cursoExistente.disciplinas = [];

        // Verifica se a disciplina já está no cronograma deste curso
        const jaExiste = cursoExistente.disciplinas.some(d => d.disciplinaId && d.disciplinaId.toString() === disciplinaId);
        if (jaExiste) return res.json({ success: true, message: 'Disciplina já agendada.' });

        // Calcula o próximo número da ordem (maior ordem atual + 1)
        const maiorOrdem = cursoExistente.disciplinas.reduce((max, d) => d.ordem > max ? d.ordem : max, 0);
        const proximaOrdem = maiorOrdem + 1;

        // Insere a nova estrutura com ordem e flag padrão (false/não fixa)
        cursoExistente.disciplinas.push({
            disciplinaId: new mongoose.Types.ObjectId(disciplinaId),
            ordem: proximaOrdem,
            fixa: false
        });

        await cursoExistente.save();
        const cursoAtualizado = await CursoModel.findById(cursoId).populate('disciplinas.disciplinaId');
        res.json({ success: true, curso: cursoAtualizado });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. NOVA ROTA: PERMITE EDITAR A ORDEM (ROTAÇÃO) E A FLAG FIXA DE UMA DISCIPLINA NO CRONOGRAMA
app.put('/api/cursos/:cursoId/disciplinas/:disciplinaId/propriedades', async (req, res) => {
    try {
        const { cursoId, WoodId, disciplinaId } = req.params;
        const { ordem, fixa } = req.body; // Recebe os novos valores editados na tela

        // Atualiza os campos específicos do objeto interno do array utilizando os filtros do Mongoose
        const cursoAtualizado = await CursoModel.findOneAndUpdate(
            { _id: cursoId, "disciplinas.disciplinaId": disciplinaId },
            { 
                $set: { 
                    "disciplinas.$.ordem": Number(ordem),
                    "disciplinas.$.fixa": Boolean(fixa)
                } 
            },
            { new: true }
        ).populate('disciplinas.disciplinaId');

        res.json({ success: true, curso: cursoAtualizado });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. ROTA DE DESVINCULAR ATUALIZADA (Remove o subobjeto do array corretamente)
app.post('/api/cursos/:cursoId/desvincular-disciplina', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { disciplinaId } = req.body;

        // Remove o item se ele for um ID puro (modelo antigo) OU se estiver dentro da propriedade disciplinaId (modelo novo)
        const cursoAtualizado = await CursoModel.findByIdAndUpdate(
            cursoId,
            { 
                $pull: { 
                    disciplinas: {
                        $or: [
                            { $eq: disciplinaId },
                            { disciplinaId: disciplinaId }
                        ]
                    }
                } 
            },
            { new: true }
        ).populate('disciplinas.disciplinaId');

        res.json({ success: true, curso: cursoAtualizado });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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