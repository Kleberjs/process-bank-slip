# 📌 Sistema de Processamento de Arquivos

Este projeto é responsável por receber arquivos CSV, processá-los e enviar eventos para o Kafka para geração de boletos e envio de e-mails.

---

## 🏗️ Arquitetura

Cada módulo foi projetado de forma independente, podendo ser transformado em micro-serviços separados.

## ⚙️ Funcionamento dos Módulos

### 1. **upload-bank-slip**
O módulo **upload-bank-slip** é responsável pelo processamento inicial do arquivo CSV. Ele realiza as seguintes ações:

- **Valida o envio duplicado**: Verifica se o arquivo já foi enviado anteriormente.
- **Valida o formato do arquivo**: Confirma que o arquivo é um CSV válido e que o cabeçalho segue o padrão esperado.
- **Armazenamento eficiente no S3**: Utiliza **Multipart Upload** para enviar arquivos grandes, evitando sobrecarga de memória.
- **Emite evento para o Kafka**: Após salvar o arquivo, emite um evento com o nome do arquivo salvo, acionando o próximo módulo.

### 2. **get-file-s3**
O módulo **get-file-s3** é responsável pela busca do arquivo salvo no bucket s3. Ele realiza as seguintes ações:

- **Busca arquivo salvo no bucket s3** - Recebe o nome do arquivo quando é emitido um novo evento na fila e busca no bucket s3.
- **Itera no arquivo** - O arquivo é transformado em um Readable Stream e é iterado utilizando async iterator do javascript
- **Emite evento no Kafka** - Cada linha iterada é enviado para um novo tópico no kafka

### 3. **generate-bank-slip**
O módulo **generate-bank-slip** é responsável por ouvir novas informações no tópico para geração de boleto e envio de e-mail.

- **Validação de boletos gerados** - Checa se o boleto recebido pelo kafka já foi processado.
- **Validação de envio de email** - Checa se já foi enviado o e-mail para o usuário após a geração do boleto.


### 📂 Estrutura do Projeto

```⚔
- src/
  - modules/ ➝ Contém os módulos da aplicação
    - upload-bank-slip/ ➝ Salva arquivos no bucket S3 e emite evento no Kafka
    - get-file-s3/ ➝ Busca arquivos no S3 e envia linhas iteradas para o Kafka
    - generate-bank-slip/ ➝ Gera boletos e envia e-mails com base nos eventos do Kafka
  - infra/ ➝ Arquivos de uso global
    - database/ ➝ Configuração do TypeORM
    - providers/ ➝ Comunicação com Kafka, S3, geração de PDF e envio de e-mail
```

---

## ✅ Pré-requisitos

- 🟢 **Node.js** >= 22.x
- 🐳 **Docker e Docker Compose**
- 🐘 **PostgreSQL**
- 🎧 **Kafka**
- ☁️ **AWS CLI**

---

## 📊 Schemas Utilizados

- **📁 FileUploaded** ➝ Responsável por registrar os arquivos enviados pela API
- **🏦 BankSlip** ➝ Responsável por manter o controle de boletos gerados e e-mails enviados

---

## 🚀 Comandos Necessários para Iniciar o Projeto

```sh
# Clonar o repositório
$ git clone https://github.com/Kleberjs/process-bank-slip.git

# Instalar as dependências
$ cd process-bank-slip

# Instalar as dependências
$ npm install

# Criar as variáveis de ambiente
$ cp .env.example .env

# Subir os containers
$ docker-compose up -d

# Criar as migrations
$ npm run migrate:run

# Criar o bucket S3
$ aws --endpoint-url=http://localhost:4566 s3 mb s3://files-bankslip

# Iniciar o projeto
$ npm start
```

---

## 🧪 Testando a API `/bank-slip/upload`

1. 📜 Acessar o Swagger pela URL: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)
2. 📎 Anexar o arquivo `bankslips.csv` (https://drive.google.com/file/d/1V9BpXlXU7Kj5bTsIgVqR4PtJjIPFpuSi/view?usp=share_link)
3. 📡 Chamar a API

---

## 🔍 Comandos para Execução dos Testes

- 🧪 **Testes Unitários**: `npm test`
- 🚦 **Testes de Integração**: `npm run test:e2e`

---

## 🛠️ Comandos Úteis e Interfaces

- 📜 **Swagger**: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)
- 🎛️ **Kafdrop**: [http://localhost:9000](http://localhost:9000)
- 🗂️ **Listar buckets criados**:
  ```sh
  aws --endpoint-url=http://localhost:4566 s3 ls
  ```
- 📄 **Listar arquivos salvo no bucket**:
  ```sh
  aws --endpoint-url=http://localhost:4566 s3 ls s3://files-bankslip/ --recursive --human-readable --summarize
  ```

---

