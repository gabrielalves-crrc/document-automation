/**
 * Formulário de Reembolso para Viagens - Anexo 3
 * Financeiro 011 -- 财务011
 */
const ReembolsoViagem = {
  
  /**
   * Calcular valor em Reais baseado no valor original e câmbio
   */
  calcularValorReais: function(valor, cambio) {
    return valor * cambio;
  },
  
  /**
   * Formatar valor para moeda brasileira
   */
  formatarMoeda: function(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  },
  
  /**
   * Calcular todos os valores de transporte
   */
  calcularTransporte: function() {
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
  calcularHospedagem: function() {
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
  calcularDiarias: function() {
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
  calcularTodosVal