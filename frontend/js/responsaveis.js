const formResponsavel = document.getElementById('formResponsavel');
const inputNome = document.getElementById('nome');
const listaResponsaveis = document.getElementById('listaResponsaveis');

const API_URL = 'http://localhost:3000/responsaveis';

let editandoId = null;

function mostrarSucesso(titulo, texto = '') {
    return Swal.fire({
        icon: 'success',
        title: titulo,
        text: texto,
        confirmButtonText: 'OK'
    });
}

function mostrarErro(titulo, texto = '') {
    return Swal.fire({
        icon: 'error',
        title: titulo,
        text: texto,
        confirmButtonText: 'OK'
    });
}

function mostrarAviso(titulo, texto = '') {
    return Swal.fire({
        icon: 'warning',
        title: titulo,
        text: texto,
        confirmButtonText: 'OK'
    });
}

function mostrarToastSucesso(mensagem) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });

    return Toast.fire({
        icon: 'success',
        title: mensagem
    });
}

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function resetarFormulario() {
    inputNome.value = '';
    editandoId = null;
    formResponsavel.querySelector('button[type="submit"]').textContent = 'Cadastrar';
}

async function carregarResponsaveis() {
    try {
        const resposta = await fetch(API_URL);
        const responsaveis = await resposta.json();

        listaResponsaveis.innerHTML = '';

        responsaveis.forEach((responsavel) => {
            const item = document.createElement('li');

            const nomeSeguro = escaparHTML(responsavel.nome);
            const nomeParaEdicao = JSON.stringify(responsavel.nome);

            item.innerHTML = `
                <div class="item-linha">
                    <span>${nomeSeguro}</span>
                    <div class="acoes">
                        <button type="button" class="btn-editar" onclick='editarResponsavel(${responsavel.id}, ${nomeParaEdicao})'>Editar</button>
                        <button type="button" class="btn-excluir" onclick="excluirResponsavel(${responsavel.id})">Excluir</button>
                    </div>
                </div>
            `;

            listaResponsaveis.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
        await mostrarErro('Erro ao carregar', 'Não foi possível carregar a lista de responsáveis.');
    }
}

formResponsavel.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = inputNome.value.trim();

    if (!nome) {
        await mostrarAviso('Campo obrigatório', 'Digite o nome do responsável.');
        return;
    }

    try {
        let resposta;

        if (editandoId) {
            resposta = await fetch(`${API_URL}/${editandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome })
            });
        } else {
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome })
            });
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            await mostrarErro('Erro ao salvar', dados.erro || 'Erro ao salvar responsável.');
            return;
        }

        const estavaEditando = Boolean(editandoId);

        resetarFormulario();
        await carregarResponsaveis();

        if (estavaEditando) {
            await mostrarToastSucesso('Responsável atualizado com sucesso!');
        } else {
            await mostrarToastSucesso('Responsável cadastrado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao salvar responsável:', error);
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    }
});

function editarResponsavel(id, nome) {
    inputNome.value = nome;
    editandoId = id;
    formResponsavel.querySelector('button[type="submit"]').textContent = 'Atualizar';
    inputNome.focus();
}

async function excluirResponsavel(id) {
    const resultado = await Swal.fire({
        icon: 'question',
        title: 'Deseja excluir este responsável?',
        text: 'Essa ação não poderá ser desfeita.',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!resultado.isConfirmed) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            await mostrarErro('Erro ao excluir', dados.erro || 'Erro ao excluir responsável.');
            return;
        }

        await carregarResponsaveis();
        await mostrarToastSucesso('Responsável excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir responsável:', error);
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    }
}

window.editarResponsavel = editarResponsavel;
window.excluirResponsavel = excluirResponsavel;

carregarResponsaveis();