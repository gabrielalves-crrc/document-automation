/**
 * Formulário de Reembolso para Viagens - Anexo 3
 * Financeiro 011 -- 财务011
 */
const ReembolsoViagem = {

  /**
   * URL dos dados - Pode ser JSON local ou API
   */
  URL_DADOS: 'data/projetos.json',

  /**
   * Cache dos dados
   */
  dadosProjetos: null,

  /**
   * Calcular valor em Reais baseado no valor original e câmbio
   */
  calcularValorReais: function (valor, cambio) {
    return valor * cambio;
  },

  /**
   * Formatar valor para moeda brasileira
   */
  formatarMoeda: function (valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  },

  /**
   * Calcular todos os valores de transporte
   */
  calcularTransporte: function () {
    let totalTransporte = 0;

    for (let i = 1; i <= 2; i++) {
      const valor = parseFloat(document.getElementById(`transp_valor_${i}`)?.value) || 0;
      const cambio = parseFloat(document.getElementById(`transp_cambio_${i}`)?.value) || 1;
      const reais = this.calcularValorReais(valor, cambio);

      const campoReais = document.getElementById(`transp_reais_${i}`);
      if (campoReais) {
        campoReais.value = this.formatarMoeda(reais);
      }

      totalTransporte += reais;
    }

    return totalTransporte;
  },

  /**
   * Calcular todos os valores de hospedagem
   */
  calcularHospedagem: function () {
    let totalHospedagem = 0;

    for (let i = 1; i <= 2; i++) {
      const valor = parseFloat(document.getElementById(`hosp_valor_${i}`)?.value) || 0;
      const cambio = parseFloat(document.getElementById(`hosp_cambio_${i}`)?.value) || 1;
      const reais = this.calcularValorReais(valor, cambio);

      const campoReais = document.getElementById(`hosp_reais_${i}`);
      if (campoReais) {
        campoReais.value = this.formatarMoeda(reais);
      }

      totalHospedagem += reais;
    }

    return totalHospedagem;
  },

  /**
   * Calcular valor das diárias
   */
  calcularDiarias: function () {
    const valor = parseFloat(document.getElementById('diaria_valor')?.value) || 0;
    const cambio = parseFloat(document.getElementById('diaria_cambio')?.value) || 1;
    const reais = this.calcularValorReais(valor, cambio);

    const campoReais = document.getElementById('diaria_reais');
    if (campoReais) {
      campoReais.value = this.formatarMoeda(reais);
    }

    return reais;
  },

  /**
   * Calcular todos os valores do formulário
   */
  calcularTodosValores: function () {
    // Calcular cada seção
    const totalTransp = this.calcularTransporte();
    const totalHosp = this.calcularHospedagem();
    const totalDiaria = this.calcularDiarias();

    // Pegar valores das outras despesas
    const servicos = parseFloat(document.getElementById('servicos_valor')?.value) || 0;
    const outras = parseFloat(document.getElementById('outras_valor')?.value) || 0;

    // Calcular total geral
    const totalGeral = totalTransp + totalHosp + totalDiaria + servicos + outras;

    // Atualizar campo de total
    const totalElement = document.getElementById('total_geral');
    if (totalElement) {
      totalElement.innerHTML = this.formatarMoeda(totalGeral);
    }

    // Sugestão automática para valor por extenso (simplificado)
    const extensoField = document.getElementById('valor_extenso');
    if (extensoField && totalGeral > 0) {
      extensoField.value = totalGeral.toFixed(2).replace('.', ',') + ' reais';
    }

    return totalGeral;
  },

  /**
   * Gerar PDF para impressão/assinatura
   */
  gerarPDF: function () {
    // Esconder botões e elementos que não devem aparecer no PDF
    document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');

    // Configurar página para impressão
    const style = document.createElement('style');
    style.innerHTML = `
      @page {
        size: A4 landscape;
        margin: 0.3in;
      }
      body {
        padding: 0.1in;
      }
    `;
    document.head.appendChild(style);

    // Chamar impressão do navegador
    window.print();

    // Restaurar botões após impressão (com pequeno delay)
    setTimeout(() => {
      document.querySelectorAll('.no-print').forEach(el => el.style.display = 'block');
    }, 100);
  },

  /**
   * Salvar rascunho no localStorage
   */
  salvarRascunho: function () {
    const dados = {};

    // Salvar todos os inputs, selects e textareas
    document.querySelectorAll('input, select, textarea').forEach(campo => {
      if (campo.id && campo.type !== 'button' && campo.type !== 'submit') {
        dados[campo.id] = campo.value;
      }
    });

    localStorage.setItem('rascunhoReembolso', JSON.stringify(dados));
    alert('✓ Rascunho salvo com sucesso!');
  },

  /**
   * Limpar todo o formulário
   */
  limparFormulario: function () {
    if (confirm('Tem certeza que deseja limpar todo o formulário?')) {
      document.querySelectorAll('input, select, textarea').forEach(campo => {
        if (campo.type !== 'button' && campo.type !== 'submit') {
          if (campo.tagName === 'SELECT') {
            campo.selectedIndex = 0;
          } else {
            campo.value = '';
          }
        }
      });

      document.getElementById('total_geral').innerHTML = 'R$ 0,00';
      localStorage.removeItem('rascunhoReembolso');
    }
  },

  /**
   * Carregar projetos do arquivo JSON
   */
  carregarProjetos: async function () {
    try {
      // Tentar carregar do cache primeiro
      if (this.dadosProjetos) {
        this.popularSelects(this.dadosProjetos);
        return;
      }

      // Carregar do localStorage (cache de 1 hora)
      const cache = localStorage.getItem('cache_projetos');
      const cacheTimestamp = localStorage.getItem('cache_projetos_timestamp');

      if (cache && cacheTimestamp) {
        const agora = new Date().getTime();
        const umaHora = 60 * 60 * 1000;

        if (agora - parseInt(cacheTimestamp) < umaHora) {
          this.dadosProjetos = JSON.parse(cache);
          this.popularSelects(this.dadosProjetos);
          return;
        }
      }

      // Carregar do arquivo JSON
      const resposta = await fetch(this.URL_DADOS);
      const dados = await resposta.json();

      // Salvar no cache
      this.dadosProjetos = dados;
      localStorage.setItem('cache_projetos', JSON.stringify(dados));
      localStorage.setItem('cache_projetos_timestamp', new Date().getTime().toString());

      this.popularSelects(dados);

    } catch (erro) {
      console.error('Erro ao carregar projetos:', erro);

      // Fallback: dados embutidos (caso o arquivo não exista)
      const dadosFallback = {
        projetos: [
          { id: 1, codigo: "STM 001/2025", nome_pt: "SP - Trem Linha 1/2/3", nome_zh: "圣保罗地铁1/2/3号线", contrato: "STM 001/2025" },
          { id: 2, codigo: "NORTE-2025", nome_pt: "SP - Manutenção da Linha Norte do Trem", nome_zh: "圣保罗城际铁路北线维保项目", contrato: null },
          { id: 3, codigo: "SFBX-2024-023", nome_pt: "HK - TIC trem do norte", nome_zh: "香港TIC北轴城铁路项目", contrato: "SFBX-2024-023" },
          { id: 4, codigo: "SFHW-QT-2025-048", nome_pt: "Serviço Pós-Venda Da Vale", nome_zh: "淡水河谷售后服务", contrato: "SFHW-QT-2025-048" },
          { id: 5, codigo: "SFHW-QT-2025-059", nome_pt: "Serviço por projeto", nome_zh: "项目委托服务", contrato: "SFHW-QT-2025-059" },
          { id: 6, codigo: "TIC-ENG-2026", nome_pt: "Veículo de Engenharia TIC", nome_zh: "TIC工程车项目", contrato: null }
        ],
        wbs: ["WBS-2025-001", "WBS-2025-002", "WBS-2025-003", "WBS-2026-001"],
        centros_custo: [
          { id: "CC001", nome: "Centro de Custo São Paulo", nome_zh: "圣保罗成本中心" },
          { id: "CC002", nome: "Centro de Custo Hong Kong", nome_zh: "香港成本中心" }
        ]
      };

      this.popularSelects(dadosFallback);

      // Mostrar aviso
      alert('⚠️ Arquivo de projetos não encontrado. Usando dados padrão.\nCrie o arquivo: data/projetos.json');
    }
  },

  /**
   * Popular todos os selects com os dados carregados
   */
  popularSelects: function (dados) {
    // Popular select de projetos
    const selectProjeto = document.getElementById('projeto_select');
    if (selectProjeto) {
      selectProjeto.innerHTML = '<option value="">-- Selecione o Projeto --</option>';

      dados.projetos.forEach(projeto => {
        const option = document.createElement('option');
        option.value = projeto.codigo || projeto.id;

        // Texto: "STM 001/2025 - SP - Trem Linha 1/2/3"
        let texto = projeto.codigo ? `${projeto.codigo} - ` : '';
        texto += projeto.nome_pt;

        option.textContent = texto;

        // Guardar dados completos como atributo
        option.dataset.nomeZh = projeto.nome_zh;
        option.dataset.contrato = projeto.contrato || '';
        option.dataset.id = projeto.id;

        selectProjeto.appendChild(option);
      });
    }

    // Popular WBS
    const selectWBS = document.getElementById('wbs_select');
    if (selectWBS && dados.wbs) {
      selectWBS.innerHTML = '<option value="">-- WBS --</option>';
      dados.wbs.forEach(wbs => {
        const option = document.createElement('option');
        option.value = wbs;
        option.textContent = wbs;
        selectWBS.appendChild(option);
      });
    }

    // Popular Centros de Custo
    const selectCC = document.getElementById('centro_custo_select');
    if (selectCC && dados.centros_custo) {
      selectCC.innerHTML = '<option value="">-- Centro Custo --</option>';
      dados.centros_custo.forEach(cc => {
        const option = document.createElement('option');
        option.value = cc.id;
        option.textContent = `${cc.id} - ${cc.nome}`;
        selectCC.appendChild(option);
      });
    }

    // Adicionar event listeners
    this.adicionarEventListenersProjetos();
  },

  /**
   * Adicionar listeners para quando o projeto for selecionado
   */
  adicionarEventListenersProjetos: function () {
    const selectProjeto = document.getElementById('projeto_select');
    const detalhesDiv = document.getElementById('detalhes_projeto');
    const campoHidden = document.getElementById('projeto');

    if (selectProjeto) {
      selectProjeto.addEventListener('change', function () {
        const selected = this.options[this.selectedIndex];

        if (this.value && selected) {
          // Mostrar detalhes
          if (detalhesDiv) {
            detalhesDiv.style.display = 'block';

            const contrato = selected.dataset.contrato;
            const nomeZh = selected.dataset.nomeZh;

            let html = `<strong>${selected.textContent}</strong><br>`;
            html += `<span class="zh">${nomeZh || ''}</span><br>`;

            if (contrato) {
              html += `<span class="tag-contrato">📄 Contrato: ${contrato}</span>`;
            }

            detalhesDiv.innerHTML = html;
          }

          // Preencher campo hidden para compatibilidade
          if (campoHidden) {
            campoHidden.value = this.value;
          }

        } else {
          if (detalhesDiv) detalhesDiv.style.display = 'none';
          if (campoHidden) campoHidden.value = '';
        }
      });
    }
  },

  /**
   * Carregar rascunho salvo
   */
  carregarRascunho: function () {
    const rascunho = localStorage.getItem('rascunhoReembolso');
    if (rascunho) {
      if (confirm('Há um rascunho salvo. Deseja carregá-lo?')) {
        const dados = JSON.parse(rascunho);
        Object.keys(dados).forEach(id => {
          const campo = document.getElementById(id);
          if (campo) {
            campo.value = dados[id] || '';
          }
        });
        this.calcularTodosValores();
      }
    }
  },

  /**
   * Configurar eventos de auto-cálculo
   */
  configurarAutoCalculo: function () {
    document.querySelectorAll('input[type="number"], select').forEach(campo => {
      campo.addEventListener('change', () => this.calcularTodosValores());
      campo.addEventListener('keyup', () => this.calcularTodosValores());
    });
  },

  /**
   * Inicializar tudo
   */
  inicializar: function () {
    // Carregar projetos
    this.carregarProjetos();

    // Carregar rascunho
    this.carregarRascunho();

    // Configurar cálculos automáticos
    this.configurarAutoCalculo();

    console.log('✅ Formulário de reembolso inicializado com sucesso!');
  }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  ReembolsoViagem.inicializar();
});