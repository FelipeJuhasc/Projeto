function toCurso(){
    window.location.href = './view/cursoView.html';
}
function toLogin(){
    window.location.href = './view/login.html';
}
function toLista(){
    window.location.href = './view/listaView.html';
}
function toUsuario(){
    window.location.href = './view/usuarioView.html';
}
function toTestes(){
    window.location.href = './view/abaParaTestesIA.html';
}
function toProfessor(){
    window.location.href = './view/professor.html';
}

// NOVA FUNÇÃO: Limpa a sessão do navegador e desloga o usuário
function logout() {
    if (confirm("Deseja realmente sair do sistema?")) {
        // Limpa a permissão e o login que guardamos no localStorage
        localStorage.clear();

        // Verifica se o usuário já está dentro da pasta 'view' ou se está na raiz do projeto
        const naPastaView = window.location.pathname.includes('/view/');

        if (naPastaView) {
            // Se estiver dentro da pasta view, volta uma pasta para achar a index.html
            window.location.href = '../index.html';
        } else {
            // Se já estiver na raiz, abre a index.html direto
            window.location.href = './index.html';
        }
    }
}

const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

// Adiciona evento de clique no conteúdo
content.addEventListener('click', () => {
    // Alterna a classe 'minimized' na barra e no conteúdo
    sidebar.classList.toggle('minimized');
    content.classList.toggle('minimized');
});
