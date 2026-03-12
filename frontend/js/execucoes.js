const inputData = document.getElementById('data');
const btnHoje = document.getElementById('btnHoje');
const btnCarregar = document.getElementById('btnCarregar');
const btnModoDiario = document.getElementById('btnModoDiario');
const btnModoSemanal = document.getElementById('btnModoSemanal');
const btnSemanaAnterior = document.getElementById('btnSemanaAnterior');
const btnSemanaAtual = document.getElementById('btnSemanaAtual');
const btnProximaSemana = document.getElementById('btnProximaSemana');
const navegacaoSemanal = document.getElementById('navegacaoSemanal');
const resultado = document.getElementById('resultado');

const API_EXECUCOES = '/execucoes';
const API_RESPONSAVEIS = '/responsaveis';

let responsaveisGlobais = [];
let salvandoTarefas = new Set();
let filtroStatusAtual = 'TODAS';
let modoAtual = 'DIARIO';
let painelDiarioAtual = null;
let painelSemanalAtual = null;

const ORDEM_STATUS = {
    PENDENTE: 1,
    EM_ANDAMENTO: 2,
    CONCLUIDA: 3
};

const NOMES_DIAS = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
];

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

function mostrarInfo(titulo, texto = '') {
    return Swal.fire({
        icon: 'info',
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
        timer: 2200,
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

function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function definirDataAtual() {
    inputData.value = obterDataHoje();
}

function irParaHoje() {
    definirDataAtual();
    carregarVisaoAtual(false);
}

function obterMetaStatus(status) {
    const mapa = {
        PENDENTE: {
            icone: '🔴',
            texto: 'PENDENTE',
            classe: 'status-pendente'
        },
        EM_ANDAMENTO: {
            icone: '🟡',
            texto: 'EM ANDAMENTO',
            classe: 'status-andamento'
        },
        CONCLUIDA: {
            icone: '🟢',
            texto: 'CONCLUÍDA',
            classe: 'status-concluida'
        }
    };

    return mapa[status] || mapa.PENDENTE;
}

function ordenarTarefasPorStatus(tarefas = []) {
    return [...tarefas].sort((a, b) => {
        const ordemA = ORDEM_STATUS[a.status] || 99;
        const ordemB = ORDEM_STATUS[b.status] || 99;

        if (ordemA !== ordemB) {
            return ordemA - ordemB;
        }

        return String(a.tarefa_nome || '').localeCompare(String(b.tarefa_nome || ''), 'pt-BR');
    });
}

function atualizarBotoesModo() {
    btnModoDiario.classList.toggle('ativo', modoAtual === 'DIARIO');
    btnModoSemanal.classList.toggle('ativo', modoAtual === 'SEMANAL');
    navegacaoSemanal.classList.toggle('oculto', modoAtual !== 'SEMANAL');
}

function definirModo(novoModo) {
    modoAtual = novoModo;
    atualizarBotoesModo();
    carregarVisaoAtual(false);
}

function abrirDiaNoModoDiario(data) {
    inputData.value = data;
    modoAtual = 'DIARIO';
    atualizarBotoesModo();
    carregarPainelDiario(false);
}

function obterDataFormatadaBR(dataIso) {
    if (!dataIso) return '';

    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function obterNomeDiaPorData(dataIso) {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return NOMES_DIAS[data.getDay()];
}

function obterInicioDaSemana(dataIso) {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    const diaSemana = data.getDay();
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

    data.setDate(data.getDate() + diferenca);

    const anoNovo = data.getFullYear();
    const mesNovo = String(data.getMonth() + 1).padStart(2, '0');
    const diaNovo = String(data.getDate()).padStart(2, '0');

    return `${anoNovo}-${mesNovo}-${diaNovo}`;
}

function adicionarDias(dataIso, quantidade) {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() + quantidade);

    const anoNovo = data.getFullYear();
    const mesNovo = String(data.getMonth() + 1).padStart(2, '0');
    const diaNovo = String(data.getDate()).padStart(2, '0');

    return `${anoNovo}-${mesNovo}-${diaNovo}`;
}

function obterDatasDaSemana(dataBaseIso) {
    const inicio = obterInicioDaSemana(dataBaseIso);
    const datas = [];

    for (let i = 0; i < 7; i += 1) {
        datas.push(adicionarDias(inicio, i));
    }

    return datas;
}

function irParaSemanaAnterior() {
    const dataAtual = inputData.value || obterDataHoje();
    inputData.value = adicionarDias(dataAtual, -7);
    carregarPainelSemanal();
}

function irParaProximaSemana() {
    const dataAtual = inputData.value || obterDataHoje();
    inputData.value = adicionarDias(dataAtual, 7);
    carregarPainelSemanal();
}

function irParaSemanaAtual() {
    inputData.value = obterDataHoje();
    carregarPainelSemanal();
}

async function carregarResponsaveis() {
    try {
        const resposta = await fetch(API_RESPONSAVEIS);
        const dados = await resposta.json();

        responsaveisGlobais = dados.filter((responsavel) => responsavel.ativo);
    } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
        responsaveisGlobais = [];
    }
}

function montarCheckboxesResponsaveis(tarefaId, responsaveisSelecionados = []) {
    if (responsaveisGlobais.length === 0) {
        return '<p class="texto-vazio">Nenhum responsável cadastrado.</p>';
    }

    return responsaveisGlobais
        .map((responsavel) => {
            const checked = responsaveisSelecionados.includes(responsavel.id) ? 'checked' : '';

            return `
                <label class="checkbox-item">
                    <input
                        type="checkbox"
                        name="responsaveis-${tarefaId}"
                        value="${responsavel.id}"
                        ${checked}
                    >
                    ${escaparHTML(responsavel.nome)}
                </label>
            `;
        })
        .join('');
}

function calcularProgresso(tarefas = []) {
    const total = tarefas.length;
    const concluidas = tarefas.filter((tarefa) => tarefa.status === 'CONCLUIDA').length;
    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return {
        total,
        concluidas,
        percentual
    };
}

function contarPorStatus(tarefas = []) {
    return {
        todas: tarefas.length,
        pendentes: tarefas.filter((tarefa) => tarefa.status === 'PENDENTE').length,
        emAndamento: tarefas.filter((tarefa) => tarefa.status === 'EM_ANDAMENTO').length,
        concluidas: tarefas.filter((tarefa) => tarefa.status === 'CONCLUIDA').length
    };
}

function filtrarTarefasPorStatus(tarefas = []) {
    if (filtroStatusAtual === 'TODAS') {
        return tarefas;
    }

    return tarefas.filter((tarefa) => tarefa.status === filtroStatusAtual);
}

function montarBlocoProgresso(tarefas = [], data) {
    const { total, concluidas, percentual } = calcularProgresso(tarefas);

    return `
        <div class="card-progresso">
            <div class="progresso-topo">
                <div>
                    <h2>Progresso do dia</h2>
                    <p class="progresso-texto">
                        ${concluidas} de ${total} tarefa(s) concluída(s)
                    </p>
                </div>

                <div class="acoes-progresso">
                    <span class="progresso-percentual">${percentual}%</span>
                    <button
                        type="button"
                        class="btn-concluir-todas"
                        onclick="concluirTodasTarefas('${data}')"
                    >
                        ✔ Concluir todas
                    </button>
                </div>
            </div>

            <div class="barra-progresso">
                <div class="barra-progresso-preenchimento" style="width: ${percentual}%"></div>
            </div>
        </div>
    `;
}

function montarBlocoFiltros(tarefas = []) {
    const contadores = contarPorStatus(tarefas);

    return `
        <div class="card-filtros-status">
            <div class="filtros-status-topo">
                <h3>Filtrar tarefas</h3>
            </div>

            <div class="grupo-filtros-status">
                <button
                    type="button"
                    class="chip-filtro ${filtroStatusAtual === 'TODAS' ? 'ativo' : ''}"
                    onclick="aplicarFiltroStatus('TODAS')"
                >
                    Todas (${contadores.todas})
                </button>

                <button
                    type="button"
                    class="chip-filtro chip-pendente ${filtroStatusAtual === 'PENDENTE' ? 'ativo' : ''}"
                    onclick="aplicarFiltroStatus('PENDENTE')"
                >
                    🔴 Pendentes (${contadores.pendentes})
                </button>

                <button
                    type="button"
                    class="chip-filtro chip-andamento ${filtroStatusAtual === 'EM_ANDAMENTO' ? 'ativo' : ''}"
                    onclick="aplicarFiltroStatus('EM_ANDAMENTO')"
                >
                    🟡 Em andamento (${contadores.emAndamento})
                </button>

                <button
                    type="button"
                    class="chip-filtro chip-concluida ${filtroStatusAtual === 'CONCLUIDA' ? 'ativo' : ''}"
                    onclick="aplicarFiltroStatus('CONCLUIDA')"
                >
                    🟢 Concluídas (${contadores.concluidas})
                </button>
            </div>
        </div>
    `;
}

function montarCardTarefa(tarefa, data) {
    const metaStatus = obterMetaStatus(tarefa.status || 'PENDENTE');

    return `
        <div class="card-tarefa ${metaStatus.classe}" id="card-tarefa-${tarefa.tarefa_id}">
            <div class="topo-tarefa">
                <h3>${escaparHTML(tarefa.tarefa_nome)}</h3>
                <span class="badge-status" id="badge-status-${tarefa.tarefa_id}">
                    ${metaStatus.icone} ${metaStatus.texto}
                </span>
            </div>

            <p><strong>Dia da semana:</strong> ${escaparHTML(tarefa.dia_semana)}</p>

            <div class="campo">
                <label for="status-${tarefa.tarefa_id}">Status</label>
                <select
                    id="status-${tarefa.tarefa_id}"
                    onchange="alterarStatusRapido(${tarefa.tarefa_id}, '${data}')"
                >
                    <option value="PENDENTE" ${tarefa.status === 'PENDENTE' ? 'selected' : ''}>🔴 PENDENTE</option>
                    <option value="EM_ANDAMENTO" ${tarefa.status === 'EM_ANDAMENTO' ? 'selected' : ''}>🟡 EM ANDAMENTO</option>
                    <option value="CONCLUIDA" ${tarefa.status === 'CONCLUIDA' ? 'selected' : ''}>🟢 CONCLUÍDA</option>
                </select>
            </div>

            <div class="campo">
                <label>Responsáveis</label>
                <div class="grupo-checkbox">
                    ${montarCheckboxesResponsaveis(tarefa.tarefa_id, tarefa.responsaveis || [])}
                </div>
            </div>

            <div class="campo">
                <label for="observacao-${tarefa.tarefa_id}">Observação</label>
                <textarea
                    id="observacao-${tarefa.tarefa_id}"
                    rows="3"
                    placeholder="Digite uma observação, se necessário"
                >${escaparHTML(tarefa.observacao || '')}</textarea>
            </div>

            <div class="acoes-tarefa">
                <button type="button" onclick="salvarExecucao(${tarefa.tarefa_id}, '${data}', true)">
                    Salvar
                </button>

                <button
                    type="button"
                    class="btn-concluir"
                    onclick="concluirTarefa(${tarefa.tarefa_id}, '${data}')"
                >
                    ✔ Concluir
                </button>
            </div>
        </div>
    `;
}

function montarCardSemanalTarefa(tarefa) {
    const metaStatus = obterMetaStatus(tarefa.status || 'PENDENTE');

    return `
        <div class="semana-tarefa ${metaStatus.classe}">
            <div class="semana-tarefa-topo">
                <strong>${escaparHTML(tarefa.tarefa_nome)}</strong>
            </div>
            <div class="semana-tarefa-status">${metaStatus.icone} ${metaStatus.texto}</div>
        </div>
    `;
}

function montarColunaSemanal(dia) {
    const tarefasOrdenadas = ordenarTarefasPorStatus(dia.tarefas || []);
    const { total, concluidas, percentual } = calcularProgresso(tarefasOrdenadas);

    return `
        <div
            class="coluna-semana clicavel"
            onclick="abrirDiaNoModoDiario('${dia.data}')"
            title="Clique para abrir este dia no modo diário"
        >
            <div class="coluna-semana-topo">
                <h3>${escaparHTML(dia.nomeDia)}</h3>
                <p>${escaparHTML(obterDataFormatadaBR(dia.data))}</p>
            </div>

            <div class="mini-resumo-semana">
                <span>${concluidas}/${total} concluídas</span>
                <span>${percentual}%</span>
            </div>

            <div class="mini-barra-progresso">
                <div class="mini-barra-progresso-preenchimento" style="width: ${percentual}%"></div>
            </div>

            <div class="lista-semana-tarefas">
                ${tarefasOrdenadas.length === 0
            ? '<p class="texto-vazio">Sem tarefas</p>'
            : tarefasOrdenadas.map(montarCardSemanalTarefa).join('')}
            </div>
        </div>
    `;
}

function montarResumoSemanal(dias = []) {
    const tarefasSemana = dias.flatMap((dia) => dia.tarefas || []);
    const { total, concluidas, percentual } = calcularProgresso(tarefasSemana);

    return `
        <div class="card-progresso semanal">
            <div class="progresso-topo">
                <div>
                    <h2>Resumo da semana</h2>
                    <p class="progresso-texto">
                        ${concluidas} de ${total} tarefa(s) concluída(s) na semana
                    </p>
                </div>

                <div class="acoes-progresso">
                    <span class="progresso-percentual">${percentual}%</span>
                </div>
            </div>

            <div class="barra-progresso">
                <div class="barra-progresso-preenchimento" style="width: ${percentual}%"></div>
            </div>
        </div>
    `;
}

function obterPayloadTarefa(tarefaId, data, statusForcado = null) {
    const status = statusForcado || document.getElementById(`status-${tarefaId}`).value;
    const observacao = document.getElementById(`observacao-${tarefaId}`).value.trim();

    const checkboxes = document.querySelectorAll(`input[name="responsaveis-${tarefaId}"]:checked`);
    const responsaveis = Array.from(checkboxes).map((checkbox) => Number(checkbox.value));

    return {
        tarefa_id: tarefaId,
        data_execucao: data,
        status,
        observacao,
        responsaveis
    };
}

function atualizarEstadoVisualSalvando(tarefaId, salvando = true) {
    const card = document.getElementById(`card-tarefa-${tarefaId}`);
    if (!card) return;

    if (salvando) {
        card.classList.add('salvando');
    } else {
        card.classList.remove('salvando');
    }
}

function renderizarPainelDiario(dados) {
    const tarefasOriginais = ordenarTarefasPorStatus(dados.tarefas || []);
    const tarefasFiltradas = filtrarTarefasPorStatus(tarefasOriginais);

    let html = `
        <h2>Tarefas do dia</h2>
        <p><strong>Data:</strong> ${escaparHTML(obterDataFormatadaBR(dados.data))} - ${escaparHTML(obterNomeDiaPorData(dados.data))}</p>
        ${montarBlocoProgresso(tarefasOriginais, dados.data)}
        ${montarBlocoFiltros(tarefasOriginais)}
    `;

    if (tarefasFiltradas.length === 0) {
        html += `
            <div class="card-sem-tarefas-filtradas">
                <p>Nenhuma tarefa encontrada para o filtro selecionado.</p>
            </div>
        `;
    } else {
        tarefasFiltradas.forEach((tarefa) => {
            html += montarCardTarefa(tarefa, dados.data);
        });
    }

    resultado.innerHTML = html;
}

function renderizarPainelSemanal(dadosSemana) {
    const inicio = obterDataFormatadaBR(dadosSemana.inicioSemana);
    const fim = obterDataFormatadaBR(dadosSemana.fimSemana);

    let html = `
        <h2>Visão semanal</h2>
        <p><strong>Período:</strong> ${escaparHTML(inicio)} até ${escaparHTML(fim)}</p>
        ${montarResumoSemanal(dadosSemana.dias)}
        <div class="grade-semanal">
            ${dadosSemana.dias.map(montarColunaSemanal).join('')}
        </div>
    `;

    resultado.innerHTML = html;
}

async function buscarPainelDia(data) {
    const resposta = await fetch(`${API_EXECUCOES}/painel/${data}`);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao carregar painel do dia.');
    }

    return dados;
}

async function carregarPainelDiario(mostrarAlertaSemTarefas = false) {
    const data = inputData.value;

    if (!data) {
        await mostrarAviso('Data obrigatória', 'Selecione uma data para carregar as tarefas.');
        return;
    }

    try {
        resultado.innerHTML = '<p>Carregando tarefas...</p>';

        await carregarResponsaveis();

        const dados = await buscarPainelDia(data);

        if (!dados.tarefas || dados.tarefas.length === 0) {
            resultado.innerHTML = `
                <h2>Resultado</h2>
                <p><strong>Data:</strong> ${escaparHTML(obterDataFormatadaBR(dados.data))} - ${escaparHTML(obterNomeDiaPorData(dados.data))}</p>
                <p>Não há tarefas cadastradas para este dia.</p>
            `;

            painelDiarioAtual = dados;

            if (mostrarAlertaSemTarefas) {
                await mostrarInfo('Nenhuma tarefa encontrada', 'Não há tarefas cadastradas para a data selecionada.');
            }

            return;
        }

        painelDiarioAtual = dados;
        renderizarPainelDiario(dados);
    } catch (error) {
        console.error('Erro ao carregar painel diário:', error);
        resultado.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
        await mostrarErro('Erro ao carregar painel', error.message || 'Não foi possível carregar as tarefas do dia.');
    }
}

async function carregarPainelSemanal() {
    const dataBase = inputData.value;

    if (!dataBase) {
        await mostrarAviso('Data obrigatória', 'Selecione uma data para carregar a semana.');
        return;
    }

    try {
        resultado.innerHTML = '<p>Carregando semana...</p>';

        const datasSemana = obterDatasDaSemana(dataBase);
        const respostas = await Promise.all(datasSemana.map((data) => buscarPainelDia(data)));

        const dias = respostas.map((dados) => ({
            data: dados.data,
            nomeDia: obterNomeDiaPorData(dados.data),
            tarefas: ordenarTarefasPorStatus(dados.tarefas || [])
        }));

        painelSemanalAtual = {
            inicioSemana: datasSemana[0],
            fimSemana: datasSemana[6],
            dias
        };

        renderizarPainelSemanal(painelSemanalAtual);
    } catch (error) {
        console.error('Erro ao carregar painel semanal:', error);
        resultado.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
        await mostrarErro('Erro ao carregar semana', error.message || 'Não foi possível carregar a visão semanal.');
    }
}

async function carregarVisaoAtual(mostrarAlertaSemTarefas = false) {
    if (modoAtual === 'SEMANAL') {
        await carregarPainelSemanal();
        return;
    }

    await carregarPainelDiario(mostrarAlertaSemTarefas);
}

async function salvarExecucao(tarefaId, data, mostrarToast = true, statusForcado = null) {
    if (salvandoTarefas.has(tarefaId)) {
        return;
    }

    salvandoTarefas.add(tarefaId);
    atualizarEstadoVisualSalvando(tarefaId, true);

    try {
        const payload = obterPayloadTarefa(tarefaId, data, statusForcado);

        const resposta = await fetch(API_EXECUCOES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            await mostrarErro('Erro ao salvar', dados.erro || 'Erro ao salvar execução.');
            return;
        }

        if (mostrarToast) {
            await mostrarToastSucesso(dados.mensagem || 'Execução salva com sucesso!');
        }

        await carregarVisaoAtual(false);
    } catch (error) {
        console.error('Erro ao salvar execução:', error);
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    } finally {
        salvandoTarefas.delete(tarefaId);
        atualizarEstadoVisualSalvando(tarefaId, false);
    }
}

async function concluirTarefa(tarefaId, data) {
    await salvarExecucao(tarefaId, data, true, 'CONCLUIDA');
}

async function alterarStatusRapido(tarefaId, data) {
    await salvarExecucao(tarefaId, data, false);
}

async function concluirTodasTarefas(data) {
    const cards = document.querySelectorAll('[id^="card-tarefa-"]');

    if (cards.length === 0) {
        await mostrarInfo('Sem tarefas', 'Não há tarefas para concluir nesta data.');
        return;
    }

    const confirmacao = await Swal.fire({
        icon: 'question',
        title: 'Concluir todas as tarefas?',
        text: 'Todas as tarefas deste dia serão marcadas como concluídas.',
        showCancelButton: true,
        confirmButtonText: 'Sim, concluir todas',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!confirmacao.isConfirmed) {
        return;
    }

    try {
        Swal.fire({
            title: 'Concluindo tarefas...',
            text: 'Aguarde um instante.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const selects = document.querySelectorAll('select[id^="status-"]');

        for (const select of selects) {
            const tarefaId = Number(select.id.replace('status-', ''));
            select.value = 'CONCLUIDA';
            await salvarExecucao(tarefaId, data, false, 'CONCLUIDA');
        }

        Swal.close();
        await mostrarToastSucesso('Todas as tarefas do dia foram concluídas!');
    } catch (error) {
        Swal.close();
        console.error('Erro ao concluir todas as tarefas:', error);
        await mostrarErro('Erro ao concluir', 'Não foi possível concluir todas as tarefas.');
    }
}

function aplicarFiltroStatus(status) {
    filtroStatusAtual = status;

    if (modoAtual === 'DIARIO' && painelDiarioAtual) {
        renderizarPainelDiario(painelDiarioAtual);
    }
}

btnCarregar.addEventListener('click', () => carregarVisaoAtual(true));
btnHoje.addEventListener('click', irParaHoje);
btnModoDiario.addEventListener('click', () => definirModo('DIARIO'));
btnModoSemanal.addEventListener('click', () => definirModo('SEMANAL'));
btnSemanaAnterior.addEventListener('click', irParaSemanaAnterior);
btnSemanaAtual.addEventListener('click', irParaSemanaAtual);
btnProximaSemana.addEventListener('click', irParaProximaSemana);

window.salvarExecucao = salvarExecucao;
window.concluirTarefa = concluirTarefa;
window.alterarStatusRapido = alterarStatusRapido;
window.concluirTodasTarefas = concluirTodasTarefas;
window.aplicarFiltroStatus = aplicarFiltroStatus;
window.abrirDiaNoModoDiario = abrirDiaNoModoDiario;

definirDataAtual();
atualizarBotoesModo();
carregarVisaoAtual(false);