// Dados simulados
const tabelas = {
    biblioteca: [
        { id: 1, titulo: 'Dom Quixote', autor: 'Miguel de Cervantes', ano: 1605 },
        { id: 2, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', ano: 1954 },
    ],
    autores: [
        { id: 1, nome: 'Miguel de Cervantes', pais: 'Espanha', nascimento: 1547, escolaId: 1 },
        { id: 2, nome: 'J.R.R. Tolkien', pais: 'Inglaterra', nascimento: 1892, escolaId: 2 },
    ],
    escolas: [
        { id: 1, nome: 'Escola de Igarassu', cidade: 'Igarassu' },
        { id: 2, nome: 'Escola de Luxemburgo', cidade: 'Bonnevue' },
    ]
};

// Controle do próximo ID para cada tabela
const nextId = {
    biblioteca: 3,
    autores: 3,
    escolas: 3,
};

// Função para alternar entre os temas
document.getElementById('toggleTheme').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const themeText = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Escuro';
    this.textContent = themeText;
});

// Função para carregar as tabelas no dropdown
function carregarTabelas() {
    const tabelaSelect = document.getElementById('table');
    Object.keys(tabelas).forEach((tabela) => {
        const option = document.createElement('option');
        option.value = tabela;
        option.textContent = tabela.charAt(0).toUpperCase() + tabela.slice(1);
        tabelaSelect.appendChild(option);
    });
}

// Atualiza os campos de acordo com a tabela selecionada
function atualizarCampos() {
    const tabelaSelecionada = document.getElementById('table').value;
    const camposSelect = document.getElementById('fields');
    camposSelect.innerHTML = ''; // Limpa os campos anteriores

    if (tabelaSelecionada && tabelas[tabelaSelecionada]) {
        const campos = Object.keys(tabelas[tabelaSelecionada][0]);
        campos.forEach((campo) => {
            const option = document.createElement('option');
            option.value = campo;
            option.textContent = campo;
            camposSelect.appendChild(option);
        });
    }
}

// Atualiza as opções de JOIN conforme a tabela selecionada
function atualizarJoins() {
    const tabelaSelecionada = document.getElementById('table').value;
    const joinSelect = document.getElementById('join');
    joinSelect.innerHTML = '<option value="">Nenhum</option>'; // Limpa os joins anteriores

    if (tabelaSelecionada === 'biblioteca') {
        joinSelect.innerHTML += '<option value="biblioteca.id=autores.id">Biblioteca.ID = Autores.ID</option>';
    } else if (tabelaSelecionada === 'autores') {
        joinSelect.innerHTML += '<option value="autores.escolaId=escolas.id">Autores.EscolaID = Escolas.ID</option>';
        joinSelect.innerHTML += '<option value="autores.id=biblioteca.id">Autores.ID = Biblioteca.ID</option>';
    } else if (tabelaSelecionada === 'escolas') {
        joinSelect.innerHTML += '<option value="autores.escolaId=escolas.id">Autores.EscolaID = Escolas.ID</option>';
    }
}

// Função para realizar o SELECT simples
function selectSimples(tabela, campos) {
    return tabela.map((registro) =>
        campos.reduce((obj, campo) => {
            if (campo in registro) {
                obj[campo] = registro[campo];
            }
            return obj;
        }, {})
    );
}

// Função de JOIN
function joinTables(tabela1, tabela2, campo1, campo2) {
    return tabela1.flatMap((registro1) =>
        tabela2
            .filter((registro2) => registro1[campo1] === registro2[campo2])
            .map((registro2) => ({ ...registro1, ...registro2 }))
    );
}

// Executa a consulta
function executarConsulta() {
    const tabelaSelecionada = document.getElementById('table').value;
    const camposSelecionados = Array.from(document.getElementById('fields').selectedOptions).map((o) => o.value);
    const joinSelecionado = document.getElementById('join').value;
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = ''; // Limpa os resultados anteriores

    if (!tabelaSelecionada || camposSelecionados.length === 0) {
        resultDiv.textContent = 'Por favor, selecione uma tabela e pelo menos um campo.';
        return;
    }

    let resultado;
    try {
        if (joinSelecionado) {
            const [campo1, campo2] = joinSelecionado.split('=').map((c) => c.trim());
            resultado = joinTables(tabelas.biblioteca, tabelas.autores, campo1.split('.')[1], campo2.split('.')[1]);
        } else {
            resultado = selectSimples(tabelas[tabelaSelecionada], camposSelecionados);
        }

        if (resultado.length === 0) {
            resultDiv.textContent = 'Nenhum resultado encontrado.';
        } else {
            const table = document.createElement('table');
            table.classList.add('result-table');

            // Cabeçalho da tabela
            const headerRow = document.createElement('tr');
            camposSelecionados.forEach((campo) => {
                const th = document.createElement('th');
                th.textContent = campo.charAt(0).toUpperCase() + campo.slice(1);
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Dados da tabela
            resultado.forEach((registro) => {
                const row = document.createElement('tr');
                camposSelecionados.forEach((campo) => {
                    const td = document.createElement('td');
                    td.textContent = registro[campo] !== undefined ? registro[campo] : '-';
                    row.appendChild(td);
                });
                table.appendChild(row);
            });

            resultDiv.appendChild(table);
        }
    } catch (error) {
        resultDiv.textContent = `Erro: ${error.message}`;
    }
}

// Criação de uma nova tabela
function criarNovaTabela() {
    const nomeTabela = document.getElementById('newTableName').value.trim();
    const fieldGroups = document.querySelectorAll('.field-group');
    const foreignKeyGroups = document.querySelectorAll('.foreign-key-group');

    if (!nomeTabela || fieldGroups.length === 0) {
        alert('Por favor, insira um nome para a tabela e pelo menos um campo.');
        return;
    }

    const campos = [];
    const registros = {};
    const foreignKeys = [];

    // Processando campos
    fieldGroups.forEach((group) => {
        const fieldName = group.querySelector('.field-name').value.trim();
        const fieldValue = group.querySelector('.field-value').value.trim();

        if (fieldName && fieldValue) {
            campos.push(fieldName);
            registros[fieldName] = fieldValue;
        }
    });

    // Processando chaves estrangeiras
    foreignKeyGroups.forEach((group) => {
        const column = group.querySelector('.foreign-key-column').value.trim();
        const refTable = group.querySelector('.foreign-key-ref').value.trim();
        const refColumn = group.querySelector('.foreign-key-ref-column').value.trim();

        if (column && refTable && refColumn) {
            foreignKeys.push({ column, refTable, refColumn });
        }
    });

    if (campos.length === 0) {
        alert('Insira pelo menos um campo válido.');
        return;
    }

    try {
        if (tabelas[nomeTabela]) {
            alert('Uma tabela com este nome já existe.');
            return;
        }

        tabelas[nomeTabela] = [registros];
        if (foreignKeys.length > 0) {
            tabelas[nomeTabela]._foreignKeys = foreignKeys;
        }

        atualizarDropdownTabelas();
        alert(`Tabela "${nomeTabela}" criada com sucesso!`);
        limparFormularioCriacao();
    } catch (error) {
        alert('Erro ao criar a tabela.');
    }
}

// Limpa o formulário após criar uma tabela
function limparFormularioCriacao() {
    document.getElementById('newTableName').value = '';
    const fieldContainer = document.getElementById('fieldContainer');
    fieldContainer.innerHTML = '';
    document.getElementById('foreignKeyContainer').innerHTML = '';
}

// Atualiza o dropdown de tabelas
function atualizarDropdownTabelas() {
    const editTableSelect = document.getElementById('editTable');
    editTableSelect.innerHTML = '<option value="">Selecione uma Tabela</option>'; // Limpa a lista

    Object.keys(tabelas).forEach((tabela) => {
        const option = document.createElement('option');
        option.value = tabela;
        option.textContent = tabela.charAt(0).toUpperCase() + tabela.slice(1);
        editTableSelect.appendChild(option);
    });
}

// Inicializa o sistema
document.addEventListener('DOMContentLoaded', () => {
    carregarTabelas();
    atualizarCampos();
    atualizarJoins();

    // Evento de mudança na tabela selecionada
    document.getElementById('table').addEventListener('change', function () {
        atualizarCampos();
        atualizarJoins();
    });

    // Executar consulta ao clicar no botão
    document.getElementById('runQuery').addEventListener('click', executarConsulta);

    // Criar nova tabela
    document.getElementById('createTable').addEventListener('click', criarNovaTabela);
});
