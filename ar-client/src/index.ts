import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

// Configuração do endpoint (será atualizado quando o professor disponibilizar)
const AR_SERVICE_URL = process.env.AR_SERVICE_URL || 'localhost:9093';

// Carregar o ficheiro proto
const PROTO_PATH = path.join(__dirname, '../../proto/voter.proto');

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
 * Cliente para a Autoridade de Registo (AR)
 * Responsável por obter credenciais de voto
 */
class ARClient {
  private client: any;

  constructor(serviceUrl: string) {
    // Criar cliente gRPC
    this.client = new voting.VoterRegistrationService(
      serviceUrl,
      grpc.credentials.createInsecure()
    );
    
    console.log(`🔗 Cliente AR conectado a: ${serviceUrl}`);
  }

  /**
   * Solicitar credencial de voto para um eleitor
   * @param citizenCardNumber Número do Cartão de Cidadão
   */
  async issueVotingCredential(citizenCardNumber: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\n📋 A solicitar credencial para CC: ${citizenCardNumber}...`);

      const request = { citizen_card_number: citizenCardNumber };

      this.client.IssueVotingCredential(
        request,
        (error: grpc.ServiceError | null, response: any) => {
          if (error) {
            console.error('❌ Erro ao obter credencial:', error.message);
            reject(error);
            return;
          }

          console.log('\n✅ Resposta recebida:');
          console.log(`   Elegível: ${response.is_eligible ? 'Sim' : 'Não'}`);
          console.log(`   Credencial: ${response.voting_credential}`);

          // Validar credencial
          if (response.voting_credential.startsWith('CRED-')) {
            console.log('   ✓ Credencial VÁLIDA (pode votar)');
          } else if (response.voting_credential.startsWith('INVALID-')) {
            console.log('   ✗ Credencial INVÁLIDA (não pode votar)');
          }

          resolve();
        }
      );
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
  console.log('🗳️  CLIENTE AUTORIDADE DE REGISTO (AR)');
  console.log('='.repeat(60));

  const client = new ARClient(AR_SERVICE_URL);

  try {
    // Teste 1: Solicitar credencial
    await client.issueVotingCredential('123456789');

    // Teste 2: Outra solicitação
    await client.issueVotingCredential('987654321');

    // Teste 3: Mais uma tentativa
    await client.issueVotingCredential('111222333');

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

export { ARClient };
