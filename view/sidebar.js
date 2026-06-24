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

function logout() {
    if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.clear();
        window.location.href = './index.html';
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
