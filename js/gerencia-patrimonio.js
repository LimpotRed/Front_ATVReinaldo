// ======== CATEGORIA ========
const apiCategoria = 'http://localhost:8080/categoria';
const categoriaForm = document.getElementById('categoria-form');
const categoriaList = document.getElementById('categoria-list');

function listarCategorias() {
  fetch(apiCategoria)
    .then(r => r.json())
    .then(data => {
      categoriaList.innerHTML = '';
      data.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
          ID: ${c.id} | Nome: ${c.nome}
          <select onchange="handleCategoriaAction(event, ${c.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        `;
        categoriaList.appendChild(li);
      });
    });
}

function salvarCategoria(e) {
  e.preventDefault();
  const id = document.getElementById('categoria-id').value;
  const nome = document.getElementById('categoria-nome').value;
  const categoria = { nome };
  const method = id ? 'PUT' : 'POST';
  const body = id ? { ...categoria, id } : categoria;

  fetch(apiCategoria, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(() => {
    listarCategorias();
    categoriaForm.reset();
    categoriaForm.querySelector('button').textContent = 'Cadastrar';
  });
}

function handleCategoriaAction(e, id) {
  const action = e.target.value;
  if (action === 'editar') {
    fetch(apiCategoria)
      .then(r => r.json())
      .then(data => {
        const item = data.find(i => i.id === id);
        if (!item) return alert('Categoria não encontrada!');
        document.getElementById('categoria-id').value = item.id;
        document.getElementById('categoria-nome').value = item.nome;
        categoriaForm.querySelector('button').textContent = 'Salvar Edição';
      });
  }
  if (action === 'excluir') {
    abrirPopup(() => {
      fetch(`${apiCategoria}/${id}`, { method: 'DELETE' }).then(() => listarCategorias());
    });
  }
}
categoriaForm.addEventListener('submit', salvarCategoria);
window.onload = listarCategorias;


// ======== BAIXA ========
const apiBaixa = 'http://localhost:8080/baixa';
const baixaForm = document.getElementById('baixa-form');
const baixaList = document.getElementById('baixa-list');

function listarBaixas() {
  fetch(apiBaixa)
    .then(r => r.json())
    .then(data => {
      baixaList.innerHTML = '';
      data.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `
          ID: ${b.id} | Patrimônio: ${b.patrimonioId} | Motivo: ${b.motivo} | Data: ${b.data}
          <select onchange="handleBaixaAction(event, ${b.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        `;
        baixaList.appendChild(li);
      });
    });
}

function salvarBaixa(e) {
  e.preventDefault();
  const id = document.getElementById('baixa-id').value;
  const baixa = {
    patrimonioId: document.getElementById('baixa-patrimonioId').value,
    motivo: document.getElementById('baixa-motivo').value,
    data: document.getElementById('baixa-data').value
  };
  const method = id ? 'PUT' : 'POST';
  const body = id ? { ...baixa, id } : baixa;

  fetch(apiBaixa, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(() => {
    listarBaixas();
    baixaForm.reset();
    baixaForm.querySelector('button').textContent = 'Registrar Baixa';
  });
}

function handleBaixaAction(e, id) {
  const action = e.target.value;
  if (action === 'editar') {
    fetch(apiBaixa)
      .then(r => r.json())
      .then(data => {
        const item = data.find(i => i.id === id);
        if (!item) return alert('Baixa não encontrada!');
        document.getElementById('baixa-id').value = item.id;
        document.getElementById('baixa-patrimonioId').value = item.patrimonioId;
        document.getElementById('baixa-motivo').value = item.motivo;
        document.getElementById('baixa-data').value = item.data;
        baixaForm.querySelector('button').textContent = 'Salvar Edição';
      });
  }
  if (action === 'excluir') {
    abrirPopup(() => {
      fetch(`${apiBaixa}/${id}`, { method: 'DELETE' }).then(() => listarBaixas());
    });
  }
}
baixaForm.addEventListener('submit', salvarBaixa);
window.onload = () => { listarCategorias(); listarBaixas(); listarMovimentacoes(); };


// ======== MOVIMENTAÇÃO ========
const apiMov = 'http://localhost:8080/movimentacao';
const movForm = document.getElementById('mov-form');
const movList = document.getElementById('mov-list');

function listarMovimentacoes() {
  fetch(apiMov)
    .then(r => r.json())
    .then(data => {
      movList.innerHTML = '';
      data.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `
          ID: ${m.id} | Patrimônio: ${m.patrimonioId} | Origem: ${m.origemId} | Destino: ${m.destinoId} | Data: ${m.data} | Obs: ${m.observacao || '-'}
          <select onchange="handleMovAction(event, ${m.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        `;
        movList.appendChild(li);
      });
    });
}

function salvarMovimentacao(e) {
  e.preventDefault();
  const id = document.getElementById('mov-id').value;
  const mov = {
    patrimonioId: document.getElementById('mov-patrimonioId').value,
    origemId: document.getElementById('mov-origemId').value,
    destinoId: document.getElementById('mov-destinoId').value,
    data: document.getElementById('mov-data').value,
    observacao: document.getElementById('mov-obs').value
  };
  const method = id ? 'PUT' : 'POST';
  const body = id ? { ...mov, id } : mov;

  fetch(apiMov, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(() => {
    listarMovimentacoes();
    movForm.reset();
    movForm.querySelector('button').textContent = 'Registrar Movimentação';
  });
}

function handleMovAction(e, id) {
  const action = e.target.value;
  if (action === 'editar') {
    fetch(apiMov)
      .then(r => r.json())
      .then(data => {
        const item = data.find(i => i.id === id);
        if (!item) return alert('Movimentação não encontrada!');
        document.getElementById('mov-id').value = item.id;
        document.getElementById('mov-patrimonioId').value = item.patrimonioId;
        document.getElementById('mov-origemId').value = item.origemId;
        document.getElementById('mov-destinoId').value = item.destinoId;
        document.getElementById('mov-data').value = item.data;
        document.getElementById('mov-obs').value = item.observacao;
        movForm.querySelector('button').textContent = 'Salvar Edição';
      });
  }
  if (action === 'excluir') {
    abrirPopup(() => {
      fetch(`${apiMov}/${id}`, { method: 'DELETE' }).then(() => listarMovimentacoes());
    });
  }
}
movForm.addEventListener('submit', salvarMovimentacao);

// ======== POPUP REUTILIZÁVEL ========
function abrirPopup(confirmCallback) {
  const popup = document.getElementById('popup');
  popup.style.display = 'flex';
  const confirmBtn = document.getElementById('confirm-delete');
  const cancelBtn = document.getElementById('cancel-delete');
  confirmBtn.onclick = () => {
    confirmCallback();
    popup.style.display = 'none';
  };
  cancelBtn.onclick = () => popup.style.display = 'none';
}
