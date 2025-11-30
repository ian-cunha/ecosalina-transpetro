## ⚓ EcoSalina: Sistema Inteligente de Monitoramento e Previsão de Bioincrustação

**Otimizando a Eficiência Naval da Transpetro**

---

### 📚 Sobre o Projeto

O **EcoSalina** é um projeto estratégico desenvolvido para enfrentar o desafio crítico da **bioincrustação (biofouling)** nos cascos das embarcações da Transpetro. O nome reflete o duplo foco em **ecologia (redução de GEE)** e o **ambiente marinho (salina)**.

O acúmulo de organismos marinhos (cracas, algas) aumenta drasticamente o **arrasto hidrodinâmico**, resultando em:
1.  📈 **Alto Consumo de Combustível** e custos operacionais elevados.
2.  ☁️ **Aumento das Emissões de Gases de Efeito Estufa (GEE)**.
3.  ⚠️ **Risco de Violações Regulatórias** (ex: NORMAM 401).

O EcoSalina transforma a manutenção reativa em uma estratégia preditiva, fornecendo o **momento exato** para a limpeza do casco, maximizando a eficiência e sustentabilidade da frota.

### 🎯 Objetivos

1.  **Monitoramento Contínuo:** Utilizar sensores e dados operacionais para medir o nível de arrasto em tempo real.
2.  **Previsão Inteligente:** Aplicar modelos de Machine Learning (ML) para prever a taxa de crescimento da incrustação e seu impacto no consumo.
3.  **Otimização da Manutenção:** Determinar o **Ponto de Limpeza Ideal (PLI)**, equilibrando o custo da limpeza com a economia de combustível projetada.

### 🛠️ Estrutura do Projeto

O projeto é dividido em quatro componentes principais, abrangendo hardware e software:

#### 1. Módulo de Aquisição de Dados (Hardware & Sensores)

| Componente | Função | Tecnologia Chave |
| :--- | :--- | :--- |
| **Sensores de Arrasto/Pressão** | Medição direta e contínua do aumento do arrasto hidrodinâmico. | Sensores piezoresistivos de alta sensibilidade. |
| **Integração com Sensores Navais** | Coleta de variáveis operacionais (velocidade, RPM, consumo de combustível). | Protocolos de comunicação NMEA 2000/Modbus. |
| **Dados Ambientais** | Coleta de temperatura da água, salinidade e rotas de navegação. | APIs de dados oceanográficos e sistemas GPS. |

#### 2. Modelo Preditivo Core (Backend/Machine Learning)

* **Tecnologia:** Python, Bibliotecas de ML (Scikit-learn, TensorFlow/Keras).
* **Função:** Treinar modelos de **Séries Temporais** (ex: ARIMA, Prophet) ou **Redes Neurais Recorrentes (RNN/LSTM)** para correlacionar variáveis ambientais/operacionais com o histórico de incrustação/arrasto e prever o futuro estado do casco.
* **Saída:** Cálculo do aumento percentual de consumo de combustível e a previsão do nível de incrustação (escala 0-5).

#### 3. Algoritmo de Otimização (Business Logic)

* **Função:** Receber a previsão do ML e aplicar uma lógica de **Custo-Benefício** para sugerir o **Ponto de Limpeza Ideal (PLI)**, minimizando o TCO (Custo Total de Propriedade).

#### 4. Dashboard EcoSalina (Frontend)
