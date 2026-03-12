const formTarefa = document.getElementById('formTarefa');
const inputNome = document.getElementById('nome');
const listaTarefas = document.getElementById('listaTarefas');
const checkboxesDias = document.querySelectorAll('input[name="dias_semana"]');

const API_URL = 'http://localhost:3000/tarefas';

let editandoId = null;

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
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function obterDiasSelecionados() {
    return Array.from(checkboxesDias)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => Number(checkbox.value))
        .sort((a, b) => a - b);
}

function marcarDiasSelecionados(diasSelecionados = []) {
    checkboxesDias.forEach((checkbox) => {
        checkbox.checked = diasSelecionados.includes(Number(checkbox.value));
    });
}

function resetarFormulario() {
    inputNome.value = '';
    marcarDiasSelecionados([]);
    editandoId = null;
    formTarefa.querySelector('button[type="submit"]').textContent = 'Cadastrar';
}

async function carregarTarefas() {
    try {
        const resposta = await fetch(API_URL);
        const tarefas = await resposta.json();

        listaTarefas.innerHTML = '';

        tarefas.forEach((tarefa) => {
            const item = document.createElement('li');

            const linha = document.createElement('div');
            linha.className = 'item-linha';

            const texto = document.createElement('span');
            texto.innerHTML = `
                <strong>${escaparHTML(tarefa.nome)}</strong><br>
                <small>${escaparHTML(tarefa.dias_semana)}</small>
            `;

            const acoes = document.createElement('div');
            acoes.className = 'acoes';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-editar';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => {
                editarTarefa(tarefa.id, tarefa.nome, tarefa.dias_semana_ids || []);
            });

            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn-excluir';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => {
                excluirTarefa(tarefa.id);
            });

            acoes.appendChild(btnEditar);
            acoes.appendChild(btnExcluir);

            linha.appendChild(texto);
            linha.appendChild(acoes);

            item.appendChild(linha);
            listaTarefas.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        await mostrarErro('Erro ao carregar', 'Não foi possível carregar a lista de tarefas.');
    }
}

formTarefa.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = inputNome.value.trim();
    const dias_semana_ids = obterDiasSelecionados();

    if (!nome) {
        await mostrarAviso('Campo obrigatório', 'Digite o nome da tarefa.');
        return;
    }

    if (dias_semana_ids.length === 0) {
        await mostrarAviso('Dias obrigatórios', 'Selecione pelo menos um dia da semana.');
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
                body: JSON.stringify({
                    nome,
                    dias_semana_ids
                })
            });
        } else {
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    dias_semana_ids
                })
            });
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            await mostrarErro('Erro ao salvar', dados.erro || 'Não foi possível salvar a tarefa.');
            return;
        }

        const estavaEditando = Boolean(editandoId);

        resetarFormulario();
        await carregarTarefas();

        if (estavaEditando) {
            await mostrarToastSucesso('Tarefa atualizada com sucesso!');
        } else {
            await mostrarToastSucesso('Tarefa cadastrada com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    }
});

function editarTarefa(id, nome, dias_semana_ids) {
    inputNome.value = nome;
    marcarDiasSelecionados(dias_semana_ids);
    editandoId = id;
    formTarefa.querySelector('button[type="submit"]').textContent = 'Atualizar';
    inputNome.focus();
}

async function excluirTarefa(id) {
    const resultado = await Swal.fire({
        icon: 'question',
        title: 'Deseja excluir esta tarefa?',
        text: 'Essa ação removerá a tarefa de todos os dias cadastrados.',
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
            await mostrarErro('Erro ao excluir', dados.erro || 'Não foi possível excluir a tarefa.');
            return;
        }

        await carregarTarefas();
        await mostrarToastSucesso('Tarefa excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    }
}

carregarTarefas();