// server.js

// Importações dos módulos necessários
import express from 'express';    // Framework para o servidor web
import dotenv from 'dotenv';      // Para carregar variáveis de ambiente
import axios from 'axios';        // Para fazer requisições HTTP

// Carrega variáveis de ambiente do arquivo .env para process.env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();

// Define a porta para o servidor backend.
// Usa a variável de ambiente PORT se definida, caso contrário, usa 3001.
// É importante usar uma porta diferente do seu frontend (ex: Live Server em 5500).
const port = process.env.PORT || 3001;

// Pega a chave da API OpenWeatherMap das variáveis de ambiente
const apiKey = process.env.OPENWEATHER_API_KEY;

/**
 * Middleware para habilitar CORS (Cross-Origin Resource Sharing).
 * Permite que o frontend (rodando em uma porta/domínio diferente)
 * faça requisições para este backend.
 * Em um ambiente de produção, 'Access-Control-Allow-Origin' deve ser
 * restrito ao domínio específico do seu frontend.
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Para desenvolvimento. Em produção, restrinja!
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next(); // Passa para a próxima função de middleware ou rota
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
/**
 * Rota GET para /api/previsao/:cidade
 * Busca a previsão do tempo para uma cidade especificada.
 * :cidade é um parâmetro de rota dinâmico.
 */
app.get('/api/previsao/:cidade', async (req, res) => {
    // Extrai o parâmetro 'cidade' da URL (ex: /api/previsao/Londres -> cidade = "Londres")
    const { cidade } = req.params;

    // Validação 1: Verifica se a API Key está configurada no servidor
    if (!apiKey) {
        console.error('[Servidor] Chave da API OpenWeatherMap não configurada.');
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }

    // Validação 2: Verifica se o nome da cidade foi fornecido
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    // Monta a URL para a API OpenWeatherMap
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        // Faz a requisição para a API OpenWeatherMap usando axios
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap.');

        // Opcional: Logar a estrutura completa da resposta da API no console do servidor (útil para depuração inicial)
        // console.log(JSON.stringify(apiResponse.data, null, 2));

        // Envia a resposta da API OpenWeatherMap diretamente de volta para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        // Trata erros que podem ocorrer ao chamar a API externa
        console.error("[Servidor] Erro ao buscar previsão:", error.response?.data || error.message);

        // Determina o status e a mensagem de erro a serem enviados ao frontend
        const status = error.response?.status || 500; // Usa o status do erro da API externa ou 500 (Internal Server Error)
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';
        res.status(status).json({ error: message });
    }
});

// Inicia o servidor e o faz escutar na porta definida
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    console.log('Aperte CTRL+C para parar o servidor.');
});