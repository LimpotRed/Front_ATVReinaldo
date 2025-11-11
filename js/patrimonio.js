const apiUrl = 'http://localhost:8080/patrimonio';

function listarPatrimonios() {
  fetch(apiUrl)
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('patrimonio-list');
      list.innerHTML = '';
      data.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
          ID: ${p.id} |
          Desc: ${p.descricao || '-'} |
          QR: ${p.qrCode || '-'} |
          Tag: ${p.tag || '-'} |
          Status: ${p.status || '-'} |
          Data: ${p.dataAquisicao ? String(p.dataAquisicao).slice(0,10) : '-'} |
          Custo: R$ ${p.custo ?? '-'} |
          CatID: ${p.categoria?.id ?? '-'} |
          LocID: ${p.localizacao?.id ?? '-'} |
          RespID: ${p.pessoaResponsavel?.id ?? '-'}
          <select onchange="handleAction(event, ${p.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        `;
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Erro ao listar patrimônios:', err));
}

function salvarPatrimonio(e) {
  e.preventDefault();
  const id = document.getElementById('patrimonio-id').value;

  const dataInput = document.getElementById('dataAquisicao').value;
  const dataISO = dataInput && dataInput.length >= 10
    ? dataInput
    : new Date().toISOString().slice(0,10);

  const categoriaId = Number(document.getElementById('categoriaId').value);
  const localizacaoId = Number(document.getElementById('localizacaoId').value);
  const pessoaResponsavelIdRaw = document.getElementById('pessoaResponsavelId').value;
  const pessoaResponsavelId = pessoaResponsavelIdRaw ? Number(pessoaResponsavelIdRaw) : null;

  const payload = {
    descricao: document.getElementById('descricao').value,
    qrcode: document.getElementById('qrCode').value,
    tag: document.getElementById('tag').value,
    status: document.getElementById('status').value,
    dataAquisicao: dataISO,
    custo: document.getElementById('custo').value ? Number(document.getElementById('custo').value) : 0,
    categoria:   { id: categoriaId },
    localizacao: { id: localizacaoId },
    // se tiver relação com Pessoa:
    pessoaResponsavel: pessoaResponsavelId ? { id: pessoaResponsavelId } : null
  };

  const method = id ? 'PUT' : 'POST';
  const body = id ? { ...payload, id: Number(id) } : payload;

  fetch(apiUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(async resp => {
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Erro ${resp.status}: ${txt}`);
    }
    return resp.json().catch(() => ({}));
  })
  .then(() => {
    listarPatrimonios();
    e.target.reset();
    document.getElementById('patrimonio-id').value = '';
    document.querySelector('#patrimonio-form button').textContent = 'Cadastrar';
  })
  .catch(err => {
    console.error('Falha ao salvar patrimônio:', err);
    alert('Erro ao salvar patrimônio. Veja o console para detalhes.');
  });
}

function handleAction(e, id) {
  const action = e.target.value;

  if (action === 'editar') {
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        const item = data.find(i => i.id === id);
        if (!item) return alert('Patrimônio não encontrado!');

        document.getElementById('descricao').value = item.descricao || '';
        document.getElementById('qrCode').value = item.qrCode || '';
        document.getElementById('tag').value = item.tag || '';
        document.getElementById('status').value = item.status || '';
        document.getElementById('dataAquisicao').value = item.dataAquisicao ? String(item.dataAquisicao).slice(0,10) : '';
        document.getElementById('custo').value = item.custo ?? '';
        document.getElementById('categoriaId').value = item.categoria?.id ?? '';
        document.getElementById('localizacaoId').value = item.localizacao?.id ?? '';
        document.getElementById('pessoaResponsavelId').value = item.pessoaResponsavel?.id ?? '';

        document.getElementById('patrimonio-id').value = id;
        document.querySelector('#patrimonio-form button').textContent = 'Salvar Edição';
      });
  }

  if (action === 'excluir') {
    const popup = document.getElementById('popup');
    const confirmDelete = document.getElementById('confirm-delete');
    const cancelDelete  = document.getElementById('cancel-delete');

    popup.style.display = 'flex';
    confirmDelete.onclick = () => {
      fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
        .then(() => { listarPatrimonios(); popup.style.display = 'none'; });
    };
    cancelDelete.onclick = () => popup.style.display = 'none';
  }
}

window.onload = listarPatrimonios;
document.getElementById('patrimonio-form').addEventListener('submit', salvarPatrimonio);
