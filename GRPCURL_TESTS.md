# 🧪 Guia de Testes com grpcurl

Este documento contém todos os comandos grpcurl para testar os serviços gRPC.

---

## 📥 Instalação do grpcurl

### Linux/Mac (Homebrew)
```bash
brew install grpcurl
```

### Windows (Chocolatey)
```cmd
choco install grpcurl
```

### Download Direto
https://github.com/fullstorydev/grpcurl/releases

### Verificar instalação
```bash
grpcurl --version
```

---

## 🔍 Explorar Serviços Disponíveis

### Listar serviços da AR
```bash
grpcurl -insecure -proto proto/voter.proto localhost:9093 list
```

### Listar serviços da AV
```bash
grpcurl -insecure -proto proto/voting.proto localhost:9091 list
```

### Descrever serviço AR
```bash
grpcurl -insecure -proto proto/voter.proto localhost:9093 describe voting.VoterRegistrationService
```

### Descrever serviço AV
```bash
grpcurl -insecure -proto proto/voting.proto localhost:9091 describe voting.VotingService
```

---

## 🎫 Testes - Autoridade de Registo (AR)

### Teste 1: Obter credencial (CC válido)
```bash
grpcurl -insecure -proto proto/voter.proto \
  -d '{"citizen_card_number": "123456789"}' \
  localhost:9093 \
  voting.VoterRegistrationService/IssueVotingCredential
```

**Resultado esperado:**
- 70% das vezes: credencial válida (CRED-ABC-123, CRED-DEF-456, CRED-GHI-789)
- 30% das vezes: credencial inválida (INVALID-<hex>)

### Teste 2: Obter credencial (outro CC)
```bash
grpcurl -insecure -proto proto/voter.proto \
  -d '{"citizen_card_number": "987654321"}' \
  localhost:9093 \
  voting.VoterRegistrationService/IssueVotingCredential
```

### Teste 3: Múltiplas solicitações
```bash
# Executar várias vezes para observar distribuição 70/30
for i in {1..10}; do
  echo "=== Tentativa $i ==="
  grpcurl -insecure -proto proto/voter.proto \
    -d "{\"citizen_card_number\": \"11122233$i\"}" \
    localhost:9093 \
    voting.VoterRegistrationService/IssueVotingCredential
  echo ""
done
```

---

## 🗳️ Testes - Autoridade de Votação (AV)

### Teste 1: Obter lista de candidatos
```bash
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetCandidates
```

**Resultado esperado:**
```json
{
  "candidates": [
    {"id": 1, "name": "Candidato A"},
    {"id": 2, "name": "Candidato B"},
    {"id": 3, "name": "Candidato C"}
  ]
}
```

### Teste 2: Votar com credencial VÁLIDA
```bash
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "CRED-ABC-123", "candidate_id": 1}' \
  localhost:9091 \
  voting.VotingService/Vote
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Voto registado com sucesso"
}
```

### Teste 3: Votar com credencial INVÁLIDA
```bash
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "INVALID-XYZ", "candidate_id": 1}' \
  localhost:9091 \
  voting.VotingService/Vote
```

**Resultado esperado:**
```json
{
  "success": false,
  "message": "Credencial inválida ou já utilizada"
}
```

### Teste 4: Tentar usar mesma credencial 2x
```bash
# Primeiro voto (deve funcionar)
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "CRED-DEF-456", "candidate_id": 2}' \
  localhost:9091 \
  voting.VotingService/Vote

# Segundo voto com mesma credencial (deve falhar)
grpcurl -insecure -proto proto/voting.proto \
  -d '{"voting_credential": "CRED-DEF-456", "candidate_id": 3}' \
  localhost:9091 \
  voting.VotingService/Vote
```

### Teste 5: Obter resultados da votação
```bash
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetResults
```

**Resultado esperado:**
```json
{
  "results": [
    {"id": 1, "name": "Candidato A", "votes": 5},
    {"id": 2, "name": "Candidato B", "votes": 3},
    {"id": 3, "name": "Candidato C", "votes": 2}
  ]
}
```

---

## 🎯 Cenário de Teste Completo

Script bash para executar um cenário completo de votação:

```bash
#!/bin/bash

echo "=== CENÁRIO COMPLETO DE VOTAÇÃO ==="
echo ""

# 1. Obter candidatos
echo "1️⃣ Obtendo lista de candidatos..."
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetCandidates
echo ""

# 2. Obter credencial para eleitor 1
echo "2️⃣ Obtendo credencial para eleitor 1..."
CRED1=$(grpcurl -insecure -proto proto/voter.proto \
  -d '{"citizen_card_number": "123456789"}' \
  localhost:9093 \
  voting.VoterRegistrationService/IssueVotingCredential | \
  grep voting_credential | cut -d'"' -f4)
echo "Credencial obtida: $CRED1"
echo ""

# 3. Votar
if [[ $CRED1 == CRED-* ]]; then
  echo "3️⃣ Submetendo voto..."
  grpcurl -insecure -proto proto/voting.proto \
    -d "{\"voting_credential\": \"$CRED1\", \"candidate_id\": 1}" \
    localhost:9091 \
    voting.VotingService/Vote
else
  echo "3️⃣ ❌ Credencial inválida, não é possível votar"
fi
echo ""

# 4. Ver resultados
echo "4️⃣ Consultando resultados..."
grpcurl -insecure -proto proto/voting.proto \
  localhost:9091 \
  voting.VotingService/GetResults
echo ""

echo "=== FIM DO CENÁRIO ==="
```

Salvar como `test-scenario.sh` e executar:
```bash
chmod +x test-scenario.sh
./test-scenario.sh
```

---

## 🔍 Análise de Limitações

Durante os testes com grpcurl, identificar as seguintes limitações:

### Limitações de Segurança
- [ ] Conexões inseguras (sem TLS)
- [ ] Sem autenticação de utilizador
- [ ] Credenciais em texto simples

### Limitações de Robustez
- [ ] Votos em memória (perdem-se ao reiniciar)
- [ ] Sem persistência de dados
- [ ] Sem logs de auditoria
- [ ] Sem validação de unicidade de voto por CC

### Limitações de Escalabilidade
- [ ] Sem load balancing
- [ ] Sem cache
- [ ] Sem rate limiting

### Limitações de Funcionalidade
- [ ] Sem encriptação de votos
- [ ] Sem assinatura digital
- [ ] Sem verificação de integridade
- [ ] Mock probabilístico (70/30) não realista

---

## 📝 Notas Importantes

1. **Endpoints**: Atualizar quando o professor disponibilizar os URLs reais
2. **Certificados**: Os serviços usam conexões inseguras (`-insecure`)
3. **Formato JSON**: O grpcurl aceita JSON que é convertido para Protocol Buffers
4. **Ordem dos testes**: Executar GetCandidates antes de votar para conhecer os IDs

---

## 🆘 Troubleshooting

### Erro: "Failed to dial target host"
→ Verificar se o serviço está a correr na porta correta

### Erro: "unknown service"
→ Verificar se o ficheiro .proto está correto e o caminho é válido

### Erro: "certificate signed by unknown authority"
→ Usar flag `-insecure` para ambientes de teste

---

**Última atualização:** Dezembro 2025
