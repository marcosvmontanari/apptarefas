const btnGerar = document.getElementById('btnGerar');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const resultado = document.getElementById('resultado');

const API_RELATORIOS = 'http://localhost:3000/relatorios';

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

function formatarResumo(resumo) {
    return `
        <div class="card">
            <h2>Resumo do período</h2>

            <p><strong>Período:</strong> ${escaparHTML(resumo.inicio)} até ${escaparHTML(resumo.fim)}</p>
            <p><strong>Total de tarefas:</strong> ${escaparHTML(String(resumo.total_tarefas ?? 0))}</p>
            <p><strong>Concluídas:</strong> ${escaparHTML(String(resumo.concluidas ?? 0))}</p>
            <p><strong>Pendentes:</strong> ${escaparHTML(String(resumo.pendentes ?? 0))}</p>
            <p><strong>Em andamento:</strong> ${escaparHTML(String(resumo.em_andamento ?? 0))}</p>
            <p><strong>Percentual de conclusão:</strong> ${escaparHTML(String(resumo.percentual_conclusao ?? 0))}%</p>
        </div>
    `;
}

function formatarRanking(rankingDados) {
    if (!rankingDados.ranking || rankingDados.ranking.length === 0) {
        return `
            <div class="card">
                <h2>Ranking de responsáveis</h2>
                <p>Nenhuma participação encontrada no período.</p>
            </div>
        `;
    }

    return `
        <div class="card">
            <h2>Ranking de responsáveis</h2>
            <p><strong>Total de participações:</strong> ${escaparHTML(String(rankingDados.total_participacoes ?? 0))}</p>
            <ul class="lista-ranking">
                ${rankingDados.ranking
            .map((item, index) => `
                        <li>
                            <span class="posicao">${index + 1}º</span>
                            <span class="nome">${escaparHTML(item.nome)}</span>
                            <span class="dados">
                                ${escaparHTML(String(item.total_tarefas ?? 0))} tarefa(s) - ${escaparHTML(String(item.percentual ?? 0))}%
                            </span>
                        </li>
                    `)
            .join('')}
            </ul>
        </div>
    `;
}

async function gerarRelatorio() {
    const inicio = dataInicio.value;
    const fim = dataFim.value;

    if (!inicio || !fim) {
        await mostrarAviso('Datas obrigatórias', 'Selecione a data inicial e a data final.');
        return;
    }

    if (inicio > fim) {
        await mostrarAviso('Período inválido', 'A data inicial não pode ser maior que a data final.');
        return;
    }

    try {
        const [resumoResponse, rankingResponse] = await Promise.all([
            fetch(`${API_RELATORIOS}/geral?inicio=${inicio}&fim=${fim}`),
            fetch(`${API_RELATORIOS}/responsaveis?inicio=${inicio}&fim=${fim}`)
        ]);

        const resumo = await resumoResponse.json();
        const rankingDados = await rankingResponse.json();

        if (!resumoResponse.ok) {
            resultado.innerHTML = `<p>${escaparHTML(resumo.erro || 'Erro ao carregar resumo.')}</p>`;
            await mostrarErro('Erro ao gerar relatório', resumo.erro || 'Não foi possível carregar o resumo do período.');
            return;
        }

        if (!rankingResponse.ok) {
            resultado.innerHTML = `<p>${escaparHTML(rankingDados.erro || 'Erro ao carregar ranking.')}</p>`;
            await mostrarErro('Erro ao gerar relatório', rankingDados.erro || 'Não foi possível carregar o ranking dos responsáveis.');
            return;
        }

        resultado.innerHTML = `
            ${formatarResumo(resumo)}
            ${formatarRanking(rankingDados)}
        `;

        await mostrarToastSucesso('Relatório gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        resultado.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
        await mostrarErro('Erro de conexão', 'Não foi possível conectar com o servidor.');
    }
}

btnGerar.addEventListener('click', gerarRelatorio);