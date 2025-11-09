const apiUrl = 'http://localhost:8080/localizacao';

const form = document.getElementById('local-form');
const list = document.getElementById('local-list');

const idInput   = document.getElementById('local-id');
const nomeInput = document.getElementById('local-nome');  // <- usar o id do HTML
const descInput = document.getElementById('local-desc');  // <- usar o id do HTML
const submitBtn = form.querySelector('button');

function listarLocalizacoes() {
  fetch(apiUrl)
    .then(r => r.json())
    .then(data => {
      list.innerHTML = '';
      data.forEach(l => {
        const li = document.createElement('li');
        li.innerHTML = `
          ID: ${l.id} | Nome: ${l.nome} | Desc: ${l.descricao || '-'}
          <select onchange="handleAction(event, ${l.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        `;
        list.appendChild(li);
      });
    });
}

function salvarLocalizacao(e) {
  e.preventDefault();
  const id = idInput.value;

  const payload = {
    nome: nomeInput.value,
    descricao: descInput.value
  };

  const method = id ? 'PUT' : 'POST';
  const body = id ? { ...payload, id: Number(id) } : payload;

  fetch(apiUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(() => {
    listarLocalizacoes();
    form.reset();
    idInput.value = '';
    submitBtn.textContent = 'Cadastrar';
  })
  .catch(err => console.error('Erro ao salvar localização:', err));
}

function handleAction(e, id) {
  const action = e.target.value;

  if (action === 'editar') {
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        const item = data.find(i => i.id === id);
        if (!item) return alert('Localização não encontrada!');
        idInput.value   = item.id;
        nomeInput.value = item.nome || '';
        descInput.value = item.descricao || '';
        submitBtn.textContent = 'Salvar Edição';
      });
  }

  if (action === 'excluir') {
    const popup = document.getElementById('popup');
    const confirmDelete = document.getElementById('confirm-delete');
    const cancelDelete  = document.getElementById('cancel-delete');

    popup.style.display = 'flex';
    confirmDelete.onclick = () => {
      fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
        .then(() => { listarLocalizacoes(); popup.style.display = 'none'; });
    };
    cancelDelete.onclick = () => popup.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', listarLocalizacoes);
form.addEventListener('submit', salvarLocalizacao);
