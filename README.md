# 📌 Sistema de Processamento de Arquivos

Este projeto é responsável por receber arquivos CSV, processá-los e enviar eventos para o Kafka para geração de boletos e envio de e-mails.

---

## 🏗️ Arquitetura

Cada módulo foi projetado de forma independente, podendo ser transformado em micro-serviços separados.

### 📂 Estrutura do Projeto

```
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
$ git clone <URL_DO_REPOSITORIO>

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

1. 📜 Acesse o Swagger pela URL: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)
2. 📎 Anexe um arquivo `bankslips.csv`
3. 📡 Chame a API

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
- 📄 **Listar arquivos no bucket**:
  ```sh
  aws --endpoint-url=http://localhost:4566 s3 ls s3://files-bankslip/ --recursive --human-readable --summarize
  ```

---

### ✨ Feito com 💙 para automação e eficiência 🚀

