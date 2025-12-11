# 🗳️ Clientes gRPC - Sistema de Votação Eletrónica

# 🗳️ Clientes gRPC - Sistema de Votação Eletrónica

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![gRPC](https://img.shields.io/badge/gRPC-1.14-orange)

**Atividade II - Integração de Sistemas**  
**Ano Letivo 2025-2026**

**Atividade II - Integração de Sistemas**  
**Ano Letivo 2025-2026**

Este projeto contém dois clientes gRPC independentes para testar os serviços de votação eletrónica:
- **AR Client**: Cliente para Autoridade de Registo (emissão de credenciais)
- **AV Client**: Cliente para Autoridade de Votação (gestão de votos)

---

## 📋 Estrutura do Projeto

```
voting-grpc-clients/
├── proto/                    # Ficheiros Protocol Buffers
│   ├── voter.proto          # Definição do serviço AR
│   └── voting.proto         # Definição do serviço AV
├── ar-client/               # Cliente Autoridade de Registo
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── av-client/               # Cliente Autoridade de Votação
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🚀 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

Verificar instalação:
```bash
node --version
npm --version
```

---

## 📦 Instalação

### 1. Instalar dependências do Cliente AR

```bash
cd ar-client
npm install
```

### 2. Instalar dependências do Cliente AV

```bash
cd av-client
npm install
```

---

## ⚙️ Configuração dos Endpoints

Os endpoints dos serviços podem ser configurados através de variáveis de ambiente:

- **AR_SERVICE_URL**: URL do serviço de Autoridade de Registo (padrão: `localhost:9093`)
- **AV_SERVICE_URL**: URL do serviço de Autoridade de Votação (padrão: `localhost:9091`)

### Exemplo (Linux/Mac):
```bash
export AR_SERVICE_URL="servidor.exemplo.pt:9093"
export AV_SERVICE_URL="servidor.exemplo.pt:9091"
```

### Exemplo (Windows):
```cmd
set AR_SERVICE_URL=servidor.exemplo.pt:9093
set AV_SERVICE_URL=servidor.exemplo.pt:9091
```

---

## 🧪 Execução dos Clientes

### Cliente AR (Autoridade de Registo)

```bash
cd ar-client
npm run test
```

**O que faz:**
- Solicita credenciais de voto para diferentes números de CC
- Valida se as credenciais são válidas ou inválidas
- Exibe os resultados no terminal

### Cliente AV (Autoridade de Votação)

```bash
cd av-client
npm run test
```

**O que faz:**
- Obtém a lista de candidatos disponíveis
- Submete votos com diferentes credenciais (válidas e inválidas)
- Consulta os resultados da votação
- Exibe estatísticas e percentagens

---

## 🔧 Compilação (opcional)

Para compilar TypeScript para JavaScript:

```bash
# No cliente AR
cd ar-client
npm run build

# No cliente AV
cd av-client
npm run build
```

Os ficheiros compilados ficam na pasta `dist/`.

Para executar a versão compilada:
```bash
npm start
```

---

## 📝 Testes com grpcurl

### Pré-requisito: Instalar grpcurl

**Linux/Mac (via Homebrew):**
```bash
brew install grpcurl
```

**Windows (via Chocolatey):**
```cmd
choco install grpcurl
```

**Ou download direto:** https://github.com/fullstorydev/grpcurl/releases

### Testes AR (Autoridade de Registo)

**Obter credencial de voto:**
```bash
grpcurl -insecure -proto proto/voter.proto \
  -d '{"citizen_card_number": "123456789"}' \
  localhost:9093 \
  voting.VoterRegistrationService/IssueVotingCredential
```

### Testes AV (Autoridade de Votação)

**Obter lista de candidatos:**
```bash
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetCandidates
```

**Votar com credencial válida:**
```bash
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "CRED-ABC-123", "candidate_id": 1}' \
  localhost:9091 \
  voting.VotingService/Vote
```

**Votar com credencial inválida:**
```bash
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "INVALID-XYZ", "candidate_id": 1}' \
  localhost:9091 \
  voting.VotingService/Vote
```

**Obter resultados:**
```bash
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetResults
```

---

## 🎯 Casos de Uso Testados

### Cliente AR
1. **Solicitar Credencial**: Pede credencial com número de CC
2. **Validar Elegibilidade**: Verifica se o eleitor é elegível
3. **Classificar Credencial**: Identifica se é válida (CRED-*) ou inválida (INVALID-*)

### Cliente AV
1. **Listar Candidatos**: Obtém todos os candidatos disponíveis
2. **Votar (Válido)**: Submete voto com credencial válida
3. **Votar (Inválido)**: Tenta votar com credencial inválida (deve ser recusado)
4. **Consultar Resultados**: Obtém contagem de votos e percentagens

---

## 📊 Credenciais de Teste

Conforme especificado no enunciado, o serviço mockup funciona com:

**Credenciais VÁLIDAS (aceites):**
- `CRED-ABC-123`
- `CRED-DEF-456`
- `CRED-GHI-789`

**Credenciais INVÁLIDAS (recusadas):**
- Qualquer outra (formato: `INVALID-<hex>`)

---

## 🐛 Resolução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "connect ECONNREFUSED"
- Verificar se os serviços gRPC estão a correr
- Confirmar endpoints corretos (portas 9091 e 9093)

### Erro: "proto file not found"
- Verificar se está a executar a partir da pasta correta
- Os comandos devem ser executados dentro de `ar-client/` ou `av-client/`

---

## 👥 Autor

**Pedro Pires**  
Integração de Sistemas - 2025/2026

---

## 📄 Licença

MIT License - Projeto Académico
