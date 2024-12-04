const tabelas = {
    biblioteca: [
        { id: 1, titulo: 'Dom Quixote', autor: 'Miguel de Cervantes', ano: 1605 },
        { id: 2, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', ano: 1954 },
    ],
    autores: [
        { id: 1, nome: 'Miguel de Cervantes', pais: 'Espanha', nascimento: 1547 },
        { id: 2, nome: 'J.R.R. Tolkien', pais: 'Inglaterra', nascimento: 1892 },
    ],
};

const nextId = {
    biblioteca: 3,
    autores: 3,
};

// Alternar modo escuro
document.getElementById('toggleTheme').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    this.textContent = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Escuro';
});

// Carregar tabelas no dropdown
function carregarTabelas() {
    const tableSelect = document.getElementById('table');
    tableSelect.innerHTML = ''; // Limpar opções antigas

    Object.keys(tabelas).forEach((tabela) => {
        const option = document.createElement('option');
        option.value = tabela;
        option.textContent = tabela.charAt(0).toUpperCase() + tabela.slice(1);
        tableSelect.appendChild(option);
    });
}

// Atualizar campos com base na tabela selecionada
function atualizarCampos() {
    const tabelaSelecionada = document.getElementById('table').value;
    const fieldsSelect = document.getElementById('fields');
    fieldsSelect.innerHTML = ''; // Limpar campos antigos

    if (tabelas[tabelaSelecionada]) {
        Object.keys(tabelas[tabelaSelecionada][0]).forEach((campo) => {
            const option = document.createElement('option');
            option.value = campo;
            option.textContent = campo.charAt(0).toUpperCase() + campo.slice(1);
            fieldsSelect.appendChild(option);
        });
    }
}

// Criar nova tabela
function criarNovaTabela() {
    const nomeTabela = document.getElementById('newTableName').value.trim();
    const fields = Array.from(document.querySelectorAll('.field-group')).map((group) => {
        const nome = group.querySelector('.field-name').value.trim();
        const valor = group.querySelector('.field-value').value.trim();
        return { [nome]: valor };
    });

    if (!nomeTabela || fields.length === 0) {
        alert('Preencha o nome da tabela e pelo menos um campo!');
        return;
    }

    const novoRegistro = fields.reduce((obj, field) => ({ ...obj, ...field }), {});
    const idTabela = nextId[nomeTabela] || 1;
    nextId[nomeTabela] = idTabela + 1;

    tabelas[nomeTabela] = [
        { id: idTabela, ...novoRegistro }
    ];

    carregarTabelas();
    alert(`Tabela "${nomeTabela}" criada com sucesso!`);

    // Limpar campos após criar a tabela, mantendo apenas o primeiro
    document.getElementById('newTableName').value = ''; // Limpar nome da tabela

    const fieldGroups = document.querySelectorAll('.field-group');
    fieldGroups.forEach((group, index) => {
        if (index > 0) {
            group.remove(); // Remover os campos adicionais
        } else {
            // Limpar o primeiro campo (nome e valor)
            group.querySelector('.field-name').value = '';
            group.querySelector('.field-value').value = '';
        }
    });
}

// Adicionar novo campo
document.getElementById('addField').addEventListener('click', function() {
    const container = document.getElementById('fieldContainer');
    const fieldGroup = document.createElement('div');
    fieldGroup.classList.add('field-group');

    const inputNome = document.createElement('input');
    inputNome.classList.add('field-name');
    inputNome.placeholder = 'Nome do Campo';

    const inputValor = document.createElement('input');
    inputValor.classList.add('field-value');
    inputValor.placeholder = 'Valor do Campo';

    fieldGroup.appendChild(inputNome);
    fieldGroup.appendChild(inputValor);
    container.appendChild(fieldGroup);
});

// Executar consulta
function executarConsulta() {
    const tabelaSelecionada = document.getElementById('table').value;
    const camposSelecionados = Array.from(document.getElementById('fields').selectedOptions).map((o) => o.value);
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Limpar resultados anteriores

    if (!tabelaSelecionada || camposSelecionados.length === 0) {
        resultDiv.textContent = 'Selecione uma tabela e pelo menos um campo.';
        return;
    }

    const resultado = tabelas[tabelaSelecionada].map((registro) =>
        camposSelecionados.reduce((obj, campo) => {
            obj[campo] = registro[campo];
            return obj;
        }, {}));

    if (resultado.length === 0) {
        resultDiv.textContent = 'Nenhum resultado encontrado.';
    } else {
        const table = document.createElement('table');
        table.classList.add('result-table');
        const headerRow = document.createElement('tr');
        camposSelecionados.forEach((campo) => {
            const th = document.createElement('th');
            th.textContent = campo.charAt(0).toUpperCase() + campo.slice(1);
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        resultado.forEach((registro, index) => {
            const row = document.createElement('tr');
            camposSelecionados.forEach((campo) => {
                const td = document.createElement('td');
                td.textContent = registro[campo] || '-';
                row.appendChild(td);
            });

            // Adicionar botão de editar
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editarRegistro(tabelaSelecionada, index);
            const tdEdit = document.createElement('td');
            tdEdit.appendChild(editButton);

            // Adicionar botão de excluir
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deletarRegistro(tabelaSelecionada, index);
            const tdDelete = document.createElement('td');
            tdDelete.appendChild(deleteButton);

            row.appendChild(tdEdit);
            row.appendChild(tdDelete);

            table.appendChild(row);
        });

        resultDiv.appendChild(table);
    }
}

// Editar registro, incluindo a possibilidade de adicionar campos, editar o nome da tabela e adicionar registros
function editarRegistro(tabelaNome, index) {
    const registro = tabelas[tabelaNome][index];
    const campos = Object.keys(registro);

    let editForm = `
        <div>
            <label for="novoNomeTabela">Novo Nome da Tabela:</label>
            <input type="text" id="novoNomeTabela" value="${tabelaNome}" />
        </div>
        <h3>Editar Registro</h3>
    `;

    campos.forEach(campo => {
        editForm += `
            <div>
                <label for="${campo}">${campo.charAt(0).toUpperCase() + campo.slice(1)}:</label>
                <input type="text" id="${campo}" value="${registro[campo]}" />
            </div>
        `;
    });

    editForm += `
        <button onclick="adicionarCampo('${tabelaNome}')">Adicionar Novo Campo</button>
        <div id="novoCampoContainer"></div>
        <h3>Adicionar Novo Registro</h3>
        <div id="novoRegistroContainer"></div>
        <button onclick="adicionarRegistro('${tabelaNome}')">Adicionar Novo Registro</button>
        <button onclick="salvarEdicao('${tabelaNome}', ${index})">Salvar</button>
    `;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = editForm;
}

// Adicionar um novo campo ao formulário de edição
function adicionarCampo(tabelaNome) {
    const container = document.getElementById('novoCampoContainer');
    const novoCampo = document.createElement('div');

    novoCampo.innerHTML = `
        <label>Nome do Novo Campo:</label>
        <input type="text" class="novoCampoNome" placeholder="Nome do Campo" />
        <label>Valor Padrão:</label>
        <input type="text" class="novoCampoValor" placeholder="Valor Padrão" />
    `;

    container.appendChild(novoCampo);
}

// Adicionar um novo registro à tabela
function adicionarRegistro(tabelaNome) {
    const container = document.getElementById('novoRegistroContainer');
    const novoRegistro = document.createElement('div');
    const camposExistentes = Object.keys(tabelas[tabelaNome][0]);

    novoRegistro.classList.add('novo-registro');
    camposExistentes.forEach(campo => {
        novoRegistro.innerHTML += `
            <label for="${campo}">${campo.charAt(0).toUpperCase() + campo.slice(1)}:</label>
            <input type="text" class="novoRegistroCampo" data-campo="${campo}" placeholder="Valor para ${campo}" />
        `;
    });

    container.appendChild(novoRegistro);
}

// Salvar edições na tabela
function salvarEdicao(tabelaNome, index) {
    const registro = tabelas[tabelaNome][index];
    const campos = Object.keys(registro);

    // Atualizar o nome da tabela
    const novoNomeTabela = document.getElementById('novoNomeTabela').value.trim();
    if (novoNomeTabela && novoNomeTabela !== tabelaNome) {
        tabelas[novoNomeTabela] = tabelas[tabelaNome];
        delete tabelas[tabelaNome];
        tabelaNome = novoNomeTabela;
        alert('Nome da tabela atualizado com sucesso!');
    }

    // Atualizar campos do registro atual
    campos.forEach(campo => {
        const novoValor = document.getElementById(campo).value;
        registro[campo] = novoValor;
    });

    // Adicionar novos campos à tabela
    const novosCampos = document.querySelectorAll('#novoCampoContainer .novoCampoNome');
    novosCampos.forEach((campoEl, i) => {
        const nomeCampo = campoEl.value.trim();
        const valorPadrao = document.querySelectorAll('#novoCampoContainer .novoCampoValor')[i].value.trim();
        if (nomeCampo) {
            tabelas[tabelaNome].forEach(registro => {
                registro[nomeCampo] = valorPadrao;
            });
        }
    });

    // Adicionar novos registros
    const novosRegistros = document.querySelectorAll('.novo-registro');
    novosRegistros.forEach(registroEl => {
        const novoRegistro = {};
        const campos = registroEl.querySelectorAll('.novoRegistroCampo');
        campos.forEach(campoEl => {
            const nomeCampo = campoEl.dataset.campo;
            novoRegistro[nomeCampo] = campoEl.value.trim();
        });

        if (Object.values(novoRegistro).some(val => val)) {
            novoRegistro.id = nextId[tabelaNome]++;
            tabelas[tabelaNome].push(novoRegistro);
        }
    });

    alert('Alterações salvas com sucesso!');
    carregarTabelas(); // Atualizar dropdown de tabelas
    executarConsulta(); // Mostrar alterações
}


// Função para deletar registro
function deletarRegistro(tabelaNome, index) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        tabelas[tabelaNome].splice(index, 1); // Remove o registro da tabela
        alert('Registro excluído com sucesso!');
        executarConsulta(); // Re-executar a consulta para atualizar a visualização
    }
}
function excluirTabela() {
    const tabelaSelecionada = document.getElementById('table').value;

    // Verifica se uma tabela foi selecionada
    if (!tabelaSelecionada) {
        alert('Selecione uma tabela para excluir.');
        return;
    }

    // Confirmação antes de excluir a tabela
    if (confirm(`Tem certeza que deseja excluir a tabela "${tabelaSelecionada}"?`)) {
        // Exclui a tabela do objeto 'tabelas' e 'nextId'
        delete tabelas[tabelaSelecionada];
        delete nextId[tabelaSelecionada];

        // Atualiza o dropdown para refletir a exclusão
        carregarTabelas();

        // Exibe uma mensagem de sucesso
        alert(`Tabela "${tabelaSelecionada}" excluída com sucesso!`);
    }
}
function buscarInformacao() {
    const valorBusca = document.getElementById('searchValue').value.trim();
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = ''; // Limpar resultados anteriores

    if (!valorBusca) {
        alert('Por favor, insira um valor para buscar.');
        return;
    }

    const resultadosEncontrados = [];

    // Percorrer todas as tabelas
    Object.keys(tabelas).forEach(tabelaNome => {
        tabelas[tabelaNome].forEach(registro => {
            // Verificar se algum valor no registro contém o valor buscado
            if (Object.values(registro).some(value => value.toString().includes(valorBusca))) {
                resultadosEncontrados.push({ tabela: tabelaNome, registro });
            }
        });
    });

    // Mostrar resultados
    if (resultadosEncontrados.length === 0) {
        searchResultsDiv.textContent = 'Nenhum resultado encontrado.';
    } else {
        const resultsTable = document.createElement('table');
        resultsTable.classList.add('result-table');

        // Criar cabeçalho da tabela de resultados
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Tabela</th><th>Registro</th>';
        resultsTable.appendChild(headerRow);

        resultadosEncontrados.forEach(({ tabela, registro }) => {
            const row = document.createElement('tr');
            const tdTabela = document.createElement('td');
            tdTabela.textContent = tabela;
            const tdRegistro = document.createElement('td');
            tdRegistro.textContent = JSON.stringify(registro); // Exibir o registro como JSON para simplicidade
            row.appendChild(tdTabela);
            row.appendChild(tdRegistro);
            resultsTable.appendChild(row);
        });

        searchResultsDiv.appendChild(resultsTable);
    }
}


// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarTabelas();
    document.getElementById('table').addEventListener('change', atualizarCampos);
});