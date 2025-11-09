// URL do seu backend
const apiUrl = 'http://localhost:8080/pessoa';

// Função para buscar as pessoas e exibir na lista
function getPessoa() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const pessoaList = document.getElementById('pessoa-list');
            pessoaList.innerHTML = ''; // Limpa a lista antes de adicionar as novas pessoas

            // Preenche a lista com as pessoas
            data.forEach(pessoa => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    Nome: ${pessoa.nome} | E-mail: ${pessoa.email} | CPF: ${pessoa.cpf} | 
                    Departamento: ${pessoa.departamento} | Cargo: ${pessoa.cargo} | 
                    Ativo: ${pessoa.ativo ? 'Sim' : 'Não'}
                    <select onchange="handleSelectAction(event, ${pessoa.id})">
                        <option value="">Ação</option>
                        <option value="editar">Editar</option>
                        <option value="excluir">Excluir</option>
                    </select>
                `;
                pessoaList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Erro ao buscar pessoas:', error));
}

// Função para criar ou editar uma pessoa
function createPessoa(event) {
    event.preventDefault();  // Evita o envio padrão do formulário

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('email').value;
    const departamento = document.getElementById('departamento').value;
    const cargo = document.getElementById('cargo').value;
    const ativo = document.getElementById('ativo').checked;
    const pessoaId = document.getElementById('pessoa-id').value;

    const novaPessoa = {
        nome: nome,
        cpf: cpf,
        email: email,
        departamento: departamento,
        cargo: cargo,
        ativo: ativo
    };

    // Editar pessoa
    if (pessoaId) {
    fetch(`${apiUrl}`, {  // remove o /${pessoaId}
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...novaPessoa, id: pessoaId }) // envia o id no corpo
    })
        .then(response => response.json())
        .then(data => {
            console.log('Pessoa editada:', data);
            getPessoa(); // Recarrega a lista de pessoas após edição
            document.getElementById('pessoa-form').reset(); // Limpa o formulário
            const submitBtn = document.querySelector('#pessoa-form button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Cadastrar';
        })
        .catch(error => console.error('Erro ao editar pessoa:', error));
    } else {
        // Cadastrar nova pessoa
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaPessoa)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Pessoa cadastrada:', data);
            getPessoa(); // Recarrega a lista de pessoas após o cadastro
            document.getElementById('pessoa-form').reset(); // Limpa o formulário
            const submitBtn = document.querySelector('#pessoa-form button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Cadastrar';
        })
        .catch(error => console.error('Erro ao cadastrar pessoa:', error));
    }
}

// Função para lidar com a seleção de ações (editar ou excluir)
function handleSelectAction(event, pessoaId) {
    const action = event.target.value;

    if (action === 'editar') {
    // Como não há GET /pessoa/{id}, vamos buscar todos e filtrar o ID desejado
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const pessoa = data.find(p => p.id === pessoaId);
            if (!pessoa) return alert("Pessoa não encontrada!");
            document.getElementById('nome').value = pessoa.nome;
            document.getElementById('cpf').value = pessoa.cpf;
            document.getElementById('email').value = pessoa.email;
            document.getElementById('departamento').value = pessoa.departamento;
            document.getElementById('cargo').value = pessoa.cargo;
            document.getElementById('ativo').checked = pessoa.ativo;
            document.getElementById('pessoa-id').value = pessoa.id;
            const submitBtn = document.querySelector('#pessoa-form button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Salvar Edição';
        })
        .catch(err => console.error("Erro ao carregar pessoa:", err))
    }

    if (action === 'excluir') {
        // Exibir popup de confirmação para excluir
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';

        const confirmDelete = document.getElementById('confirm-delete');
        const cancelDelete = document.getElementById('cancel-delete');

        confirmDelete.onclick = () => {
            // Chamar a função para excluir a pessoa
            deletePessoa(pessoaId);
            popup.style.display = 'none'; // Fechar popup após exclusão
        };

        cancelDelete.onclick = () => {
            popup.style.display = 'none'; // Fechar popup sem excluir
        };
    }
}

// Função para excluir pessoa
function deletePessoa(pessoaId) {
    fetch(`${apiUrl}/${pessoaId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log(`Pessoa com ID ${pessoaId} excluída`);
            getPessoa();  // Atualiza a lista de pessoas após a exclusão
        }
    })
    .catch(error => console.error('Erro ao excluir pessoa:', error));
}

// Carregar a lista de pessoas ao carregar a página
window.onload = getPessoa;

// Adiciona o evento de submit ao formulário
document.getElementById('pessoa-form').addEventListener('submit', createPessoa);


