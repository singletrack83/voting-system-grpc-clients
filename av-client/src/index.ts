import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

// Configuração do endpoint (será atualizado quando o professor disponibilizar)
const AV_SERVICE_URL = process.env.AV_SERVICE_URL || 'localhost:9091';

// Carregar o ficheiro proto
const PROTO_PATH = path.join(__dirname, '../../proto/voting.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const voting = protoDescriptor.voting;

/**
 * Cliente para a Autoridade de Votação (AV)
 * Responsável por gerir o processo de votação
 */
class AVClient {
  private client: any;

  constructor(serviceUrl: string) {
    // Criar cliente gRPC
    this.client = new voting.VotingService(
      serviceUrl,
      grpc.credentials.createInsecure()
    );
    
    console.log(`🔗 Cliente AV conectado a: ${serviceUrl}`);
  }

  /**
   * Obter lista de candidatos disponíveis
   */
  async getCandidates(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      console.log(`\n📋 A obter lista de candidatos...`);

      this.client.GetCandidates({}, (error: grpc.ServiceError | null, response: any) => {
        if (error) {
          console.error('❌ Erro ao obter candidatos:', error.message);
          reject(error);
          return;
        }

        console.log('\n✅ Candidatos disponíveis:');
        response.candidates.forEach((candidate: any) => {
          console.log(`   [${candidate.id}] ${candidate.name}`);
        });

        resolve(response.candidates);
      });
    });
  }

  /**
   * Submeter um voto
   * @param votingCredential Credencial de votação obtida da AR
   * @param candidateId ID do candidato escolhido
   */
  async vote(votingCredential: string, candidateId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\n🗳️  A submeter voto...`);
      console.log(`   Credencial: ${votingCredential}`);
      console.log(`   Candidato ID: ${candidateId}`);

      const request = {
        voting_credential: votingCredential,
        candidate_id: candidateId,
      };

      this.client.Vote(request, (error: grpc.ServiceError | null, response: any) => {
        if (error) {
          console.error('❌ Erro ao votar:', error.message);
          reject(error);
          return;
        }

        console.log('\n📨 Resposta:');
        console.log(`   Sucesso: ${response.success ? 'Sim ✓' : 'Não ✗'}`);
        console.log(`   Mensagem: ${response.message}`);

        if (response.success) {
          console.log('   🎉 Voto registado com sucesso!');
        } else {
          console.log('   ⚠️  Voto recusado!');
        }

        resolve();
      });
    });
  }

  /**
   * Obter resultados da votação
   */
  async getResults(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\n📊 A obter resultados da votação...`);

      this.client.GetResults({}, (error: grpc.ServiceError | null, response: any) => {
        if (error) {
          console.error('❌ Erro ao obter resultados:', error.message);
          reject(error);
          return;
        }

        console.log('\n✅ Resultados da Votação:');
        console.log('='.repeat(50));
        
        let totalVotes = 0;
        response.results.forEach((result: any) => {
          totalVotes += result.votes;
        });

        response.results.forEach((result: any) => {
          const percentage = totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(2) : '0.00';
          console.log(`   [${result.id}] ${result.name}`);
          console.log(`       Votos: ${result.votes} (${percentage}%)`);
        });

        console.log('='.repeat(50));
        console.log(`   Total de votos: ${totalVotes}`);

        resolve();
      });
    });
  }

  /**
   * Fechar conexão
   */
  close(): void {
    grpc.closeClient(this.client);
    console.log('\n🔌 Conexão fechada.');
  }
}

/**
 * Função principal para testar o cliente
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🗳️  CLIENTE AUTORIDADE DE VOTAÇÃO (AV)');
  console.log('='.repeat(60));

  const client = new AVClient(AV_SERVICE_URL);

  try {
    // Teste 1: Obter lista de candidatos
    const candidates = await client.getCandidates();

    // Teste 2: Votar com credencial válida
    await client.vote('CRED-ABC-123', 1);

    // Teste 3: Tentar votar com credencial inválida
    await client.vote('INVALID-XYZ', 2);

    // Teste 4: Votar com outra credencial válida
    await client.vote('CRED-DEF-456', 2);

    // Teste 5: Obter resultados
    await client.getResults();

  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    client.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testes concluídos!');
  console.log('='.repeat(60));
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { AVClient };
