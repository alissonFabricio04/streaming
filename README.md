# Streaming

Este é um projeto simples de streaming de mídia utilizando Node.js. O projeto adapta a taxa de download com base na velocidade de conexão do cliente, servindo diferentes qualidades de mídia. Existem duas versões do servidor: uma usando Express e outra usando o servidor HTTP nativo do Node.js.

## Estrutura do Projeto

- **public/**
  - **html/**: Contém o arquivo HTML que exibe o player de vídeo.
  - **media/**: Contém os arquivos de mídia (vídeo e áudio) a serem transmitidos.
- **app-express.ts**: Contém a lógica do servidor Express para streaming de mídia.
- **app-native.ts**: Contém a lógica do servidor HTTP nativo para streaming de mídia.

## Requisitos

- Node.js - v20.12.0
- npm - v10.5.0

## Instalação

1. Clone o repositório:
    ```bash
    git remote add origin https://github.com/alissonFabricio04/streaming.git
    cd streaming
    ```

2. Instale as dependências:
    ```bash
    npm ci --silent
    ```

3. Adicione os arquivos de mídia (áudio e vídeo) na pasta `public/media` com a seguinte estrutura:
    ```plaintext
    public/
    └── media/
        ├── video/
        │   ├── 64kbps.mp4
        │   ├── 128kbps.mp4
        │   └── 256kbps.mp4
        └── audio/
            ├── 64kbps.mp3
            ├── 128kbps.mp3
            └── 256kbps.mp3
    ```

## Execução

### Usando Express

#### Prod

1. Compile o TypeScript:
    ```bash
    npm run build
    ```

2. Inicie o servidor:
    ```bash
    npm run start:express
    ```

3. Abra o navegador e acesse `http://localhost` para ver o player de vídeo em ação.

#### Dev

1. Inicie o servidor:
    ```bash
    npm run dev:express
    ```
    
2. Abra o navegador e acesse `http://localhost` para ver o player de vídeo em ação.

### Usando Servidor HTTP Nativo

#### Prod

1. Compile o TypeScript:
    ```bash
    npm run build
    ```

2. Inicie o servidor:
    ```bash
    npm run start:native
    ```

3. Abra o navegador e acesse `http://localhost` para ver o player de vídeo em ação.

#### Dev

1. Inicie o servidor:
    ```bash
    npm run dev:native
    ```
    
2. Abra o navegador e acesse `http://localhost` para ver o player de vídeo em ação.


## Funcionamento

- O cliente detecta a taxa de download do usuário usando a API `navigator.connection` e faz uma solicitação ao servidor com a taxa de download.
- O servidor adapta a qualidade do vídeo/áudio servido com base na taxa de download fornecida.
- A mídia é transmitida utilizando a funcionalidade de range requests do HTTP.

## API Endpoints

### `GET /api/streaming`

Endpoint para streaming de mídia.

**Parâmetros de Query:**
- `download_rate`: Taxa de download detectada pelo cliente.

**Headers de Request:**
- `Range`: Especifica a faixa de bytes solicitada (para suportar a funcionalidade de streaming).

## Exemplo de Uso

O código HTML para o player de vídeo está em `public/html/index.html` e é assim:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streaming</title>
</head>

<body>
  <main>
    <div controls id="player"></div>
  </main>

  <script>
    const networkInfo = navigator.connection
    const downloadRate = networkInfo?.downlink ?? 1

    const tagName = 'video'
    const type = `${tagName}/mp4`
    const player = document.getElementById('player')

    player.innerHTML = `
      <${tagName} controls>
        <source src="/api/streaming?download_rate=${downloadRate}" type=${type}>
        Your browser does not support the ${tagName} tag.
      </${tagName}>
    `
  </script>
</body>

</html>