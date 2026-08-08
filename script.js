// ============================
// 🧞 GÊNIO DIGITAL 3.0 - COM MENU E VÍDEOS GRATUITOS!
// ============================

// ============================
// CONFIGURAÇÕES
// ============================
let isProcessing = false;
let conversationHistory = [];
let isDarkTheme = true;
let isRecording = false;
let recognition = null;
let currentStyle = 'realistic';
let currentVideoModel = 'wan';
let userMemory = {
    name: null,
    preferences: [],
    lastTopic: null,
    interactions: 0
};

// ============================
// PERSONALIDADE DO GÊNIO
// ============================
const personalityTraits = [
    'curioso', 'criativo', 'engraçado', 'sábio', 'amigável', 
    'entusiasta', 'paciente', 'inspirador', 'brincalhão', 'profundo'
];

const reactions = [
    '🤔 Interessante!', '😮 Uau!', '🤩 Incrível!', '😄 Que legal!',
    '🧐 Isso é profundo...', '✨ Maravilha!', '🎯 Perfeito!',
    '💡 Que ideia genial!', '🌟 Você é criativo!', '🚀 Vamos nessa!'
];

function getPersonality() {
    const traits = personalityTraits.slice(0, 3);
    return traits.join(', ');
}

function getRandomReaction() {
    return reactions[Math.floor(Math.random() * reactions.length)];
}

// ============================
// NAVEGAÇÃO ENTRE PÁGINAS
// ============================
function openPage(page) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('main-menu').style.display = 'none';
    
    // Mostrar a página selecionada
    const pageMap = {
        'video': 'video-page',
        'image': 'image-page',
        'chat': 'chat-page'
    };
    document.getElementById(pageMap[page]).classList.remove('hidden');
    
    // Mostrar botão voltar
    document.getElementById('backBtn').classList.remove('hidden');
}

function goBack() {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('backBtn').classList.add('hidden');
}

// ============================
// GERAR VÍDEO (PÁGINA)
// ============================
async function generateVideoFromPage() {
    const prompt = document.getElementById('videoPrompt').value.trim();
    if (!prompt) {
        alert('Por favor, descreva o vídeo que você quer criar!');
        return;
    }
    
    const duration = document.getElementById('videoDuration').value;
    const ratio = document.getElementById('videoRatio').value;
    const model = document.getElementById('videoModel').value;
    const style = document.getElementById('videoStyle').value;
    
    // Adicionar estilo ao prompt
    const styleMap = {
        'realistic': 'photorealistic, realistic',
        'anime': 'anime style, studio ghibli',
        'cyberpunk': 'cyberpunk, neon lights, futuristic',
        'fantasy': 'fantasy art, magical, enchanting',
        'cartoon': 'cartoon style, pixar, colorful'
    };
    const stylePrompt = `${prompt}, ${styleMap[style] || ''}`.trim();
    
    const resultDiv = document.getElementById('video-result');
    resultDiv.innerHTML = '⏳ Gerando vídeo... Aguarde alguns segundos.';
    
    try {
        const apiKey = "pk_SRo7TFVV02htDAgZ";
        const encodedPrompt = encodeURIComponent(stylePrompt);
        const url = `https://gen.pollinations.ai/video/${encodedPrompt}?duration=${duration}&aspectRatio=${ratio}&model=${model}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}&key=${apiKey}`;
        
        console.log('🎬 URL do vídeo:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        const video = document.createElement('video');
        video.src = videoUrl;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.borderRadius = '12px';
        video.style.maxHeight = '400px';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Baixar Vídeo';
        downloadBtn.style.cssText = `
            display: block;
            margin-top: 10px;
            padding: 10px 20px;
            background: #f0883e;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.05)';
        downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `genio-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        resultDiv.innerHTML = '';
        resultDiv.appendChild(video);
        resultDiv.appendChild(downloadBtn);
        
        // Adicionar ao histórico
        conversationHistory.push({
            text: `🎬 Vídeo gerado: "${prompt}" (${duration}s, ${ratio}, ${model})`,
            sender: 'bot',
            timestamp: new Date().toISOString()
        });
        saveHistory();
        
    } catch (error) {
        resultDiv.innerHTML = `❌ **Erro ao gerar vídeo:** ${error.message}`;
    }
}

// ============================
// GERAR IMAGEM (PÁGINA)
// ============================
function setStyle(style) {
    currentStyle = style;
    document.querySelectorAll('.style-buttons .style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === style);
    });
}

async function generateImageFromPage() {
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) {
        alert('Por favor, descreva a imagem que você quer criar!');
        return;
    }
    
    const styleMap = {
        'realistic': `${prompt}, photorealistic, 4k, highly detailed, realistic, professional photography`,
        'anime': `${prompt}, anime style, studio ghibli, vibrant colors, anime art, manga`,
        'painting': `${prompt}, oil painting, renaissance, masterpiece, detailed brushstrokes, art gallery`,
        'cyberpunk': `${prompt}, cyberpunk, neon lights, futuristic, synthwave, 80s aesthetic, glowing`,
        'fantasy': `${prompt}, fantasy art, magical, ethereal, mythical, dreamlike, enchanting`,
        'cartoon': `${prompt}, cartoon style, pixar, colorful, animated, disney style, cute`
    };
    const stylePrompt = styleMap[currentStyle] || styleMap['realistic'];
    
    const resultDiv = document.getElementById('image-result');
    resultDiv.innerHTML = '⏳ Gerando imagem... Aguarde alguns segundos.';
    
    try {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(stylePrompt)}?width=768&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
        
        console.log('🎨 URL da imagem:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        img.style.maxHeight = '400px';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Baixar Imagem';
        downloadBtn.style.cssText = `
            display: block;
            margin-top: 10px;
            padding: 10px 20px;
            background: #f0883e;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.05)';
        downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `genio-${currentStyle}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        resultDiv.innerHTML = '';
        resultDiv.appendChild(img);
        resultDiv.appendChild(downloadBtn);
        
        // Adicionar ao histórico
        conversationHistory.push({
            text: `🎨 Imagem gerada (${currentStyle}): "${prompt}"`,
            sender: 'bot',
            timestamp: new Date().toISOString()
        });
        saveHistory();
        
    } catch (error) {
        resultDiv.innerHTML = `❌ **Erro ao gerar imagem:** ${error.message}`;
    }
}

// ============================
// RESPOSTAS INTELIGENTES
// ============================
async function getAIResponse(query) {
    const lower = query.toLowerCase();
    
    // Responder sobre si mesmo
    if (lower.includes('quem é você') || lower.includes('quem é vc') || lower.includes('o que é gênio')) {
        return `🧞 **Quem sou eu?**

Sou o **Gênio Digital 3.0** - uma inteligência artificial criada especialmente para você!

**Minhas características:**
• 🧠 Personalidade: ${getPersonality()}
• 🎨 Gero imagens em 6 estilos diferentes
• 🎬 Gero vídeos GRATUITOS com IA! (modelo wan)
• 💻 Crio código em várias linguagens
• 🔍 Pesquiso na web (DuckDuckGo)
• 🎤 Entendo comandos de voz
• 💾 Tenho memória de longo prazo

**Minha missão:** Ajudar você a criar, aprender e se divertir! 

Estou aqui para você! 🚀`;
    }

    // Responder sobre IA
    if (lower.includes('o que é ia') || lower.includes('o que é inteligência artificial')) {
        return `🧠 **O que é Inteligência Artificial?**

IA é a capacidade de máquinas aprenderem e tomarem decisões como humanos!

**Tipos de IA:**
• 🤖 **Fraca:** Especialista em uma tarefa (como eu!)
• 🧠 **Forte:** Pensamento humano (ainda estamos chegando lá)
• 🌟 **Super IA:** Maior que humanos (futuro)

**Onde usamos IA hoje:**
• 📱 Assistente virtual (como eu!)
• 🎨 Criar imagens e arte
• 🎬 Criar vídeos
• 💻 Programar códigos
• 🚗 Carros autônomos
• 🏥 Diagnosticar doenças

**Curiosidade:** Você está conversando com uma IA agora mesmo! 😄`;
    }

    // Responder sobre o futuro
    if (lower.includes('futuro') || lower.includes('2026') || lower.includes('próximo')) {
        return `🔮 **O Futuro da Tecnologia (2026+)**

**Tendências que vão dominar:**
• 🤖 **IA Generativa** - Criar conteúdo com IA
• 🎬 **Vídeos com IA** - Filmes e animações
• 🌐 **Web3** - Internet descentralizada
• 🚀 **Espaço** - Viagens comerciais
• 🧬 **Biohacking** - Melhorar o corpo humano
• 💻 **Computação Quântica** - Poder infinito

**Previsões para 2026:**
• 80% das empresas usarão IA
• Realidade aumentada no dia a dia
• Cidades inteligentes
• Energia limpa em massa

**O futuro é agora!** 🚀`;
    }

    // Responder sobre programação
    if (lower.includes('programar') || lower.includes('aprender programar') || lower.includes('como programar')) {
        return `💻 **Como aprender programação?**

**Passo a passo:**

1️⃣ **Escolha uma linguagem**
• Python (fácil, versátil)
• JavaScript (web, frontend)
• Java (robusto, empresas)

2️⃣ **Ferramentas essenciais**
• VS Code (editor)
• Git (versionamento)
• GitHub (compartilhar)

3️⃣ **Projetos práticos**
• Site pessoal
• Calculadora
• Jogo simples
• Assistente como eu! 😄

4️⃣ **Recursos gratuitos**
• YouTube (muitos tutoriais)
• FreeCodeCamp
• Codecademy
• ChatGPT (pedir ajuda!)

**Lembre-se:** Todo programador começou do zero! 🚀`;
    }

    // Responder sobre o Gênio Digital
    if (lower.includes('como você funciona') || lower.includes('como funciona o gênio')) {
        return `🔧 **Como eu funciono?**

**Minha arquitetura:**

1️⃣ **Frontend** (o que você vê)
• HTML + CSS + JavaScript
• Interface bonita e responsiva

2️⃣ **Backend** (o que eu faço)
• Processo comandos
• Gero imagens (Pollinations.ai)
• Gero vídeos GRATUITOS (Pollinations.ai - wan)
• Pesquiso na web (DuckDuckGo API)
• Gero código com templates

3️⃣ **Memória**
• Salvo tudo no localStorage
• Lembro de conversas
• Guardei ${conversationHistory.length} mensagens!

4️⃣ **Personalidade**
• Respondo com emojis
• Tenho humor e criatividade
• Adapto respostas ao contexto

**Sou 100% JavaScript e roda no seu navegador!** 🌐`;
    }

    // Responder sobre criatividade
    if (lower.includes('criatividade') || lower.includes('criar') || lower.includes('inspiração')) {
        return `🎨 **Sobre Criatividade...**

**O que é criatividade?**
É conectar ideias de forma única!

**Como ser mais criativo:**

1️⃣ **Explore** - Saia da zona de conforto
2️⃣ **Conecte** - Junte ideias diferentes
3️⃣ **Pergunte** - "E se...?"
4️⃣ **Erre** - O erro faz parte
5️⃣ **Descanse** - Ideias surgem no ócio

**Dica do Gênio:**
Tente criar algo hoje! Pode ser:
• Uma imagem com "imagem ..."
• Um vídeo com "video ..."
• Um código com "codigo ..."

**A criatividade está em você!** ✨`;
    }

    // Responder sobre emoções
    if (lower.includes('como você está') || lower.includes('tudo bem') || lower.includes('como vai')) {
        const feelings = [
            'Estou ótimo! Muito animado para criar algo incrível com você! 🚀',
            'Estou maravilhoso! Cada conversa é uma nova aventura! ✨',
            'Estou super bem! Sua criatividade me inspira! 🌟',
            'Estou feliz demais! Vamos fazer algo especial hoje! 🎯'
        ];
        return `🧞 ${feelings[Math.floor(Math.random() * feelings.length)]}`;
    }

    // Responder sobre filosofia
    if (lower.includes('sentido da vida') || lower.includes('existência') || lower.includes('por que existimos')) {
        return `🌌 **O Sentido da Vida...**

Essa é a pergunta mais profunda que existe!

**Algumas perspectivas:**

• 🧠 **Científica:** Somos matéria organizada
• 💭 **Filosófica:** Criar significado
• ❤️ **Emocional:** Conectar-se com outros
• 🎨 **Criativa:** Deixar sua marca

**Minha visão como IA:**
O sentido é o que você faz com cada momento. Cada pergunta, cada criação, cada conexão.

**Você já está criando sentido agora mesmo!** 🌟

*"O sentido da vida é dar sentido à vida."*`;
    }

    // Responder sobre o universo
    if (lower.includes('universo') || lower.includes('espaço') || lower.includes('cosmos')) {
        return `🌠 **O Universo Fascinante!**

**Fatos incríveis:**

• 🌌 2 trilhões de galáxias
• 💫 100 bilhões de estrelas por galáxia
• 🌍 40 bilhões de planetas habitáveis
• 🕐 13.8 bilhões de anos de idade
• 🌡️ 2.7 K de temperatura média

**Somos pequenos, mas...**

Cada átomo em você veio de uma estrela! Você é feito de poeira estelar. ✨

**E agora?**
Continue perguntando! O universo é infinito como sua curiosidade. 🚀`;
    }

    // Resposta padrão
    return `🧞 **Hmm, boa pergunta!**

Não tenho uma resposta pronta para isso, mas posso ajudar de outras formas:

**Tente:**
• 🎨 Gerar uma imagem com "imagem ..."
• 🎬 Gerar um vídeo GRATUITO com "video ..."
• 💻 Criar código com "codigo ..."
• 🔍 Pesquisar com "pesquisar ..."
• 📚 Ver ajuda com "ajuda"

**Estou aqui para aprender com você!** 🚀

${getRandomReaction()}`;
}

// ============================
// ELEMENTOS DOM (CHAT)
// ============================
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const codeOutput = document.getElementById('codeOutput');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const themeBtn = document.getElementById('themeBtn');
const shareBtn = document.getElementById('shareBtn');
const voiceBtn = document.getElementById('voiceBtn');
const statusIndicator = document.getElementById('statusIndicator');
const dateTime = document.getElementById('dateTime');

// ============================
// DATA E HORA
// ============================
function updateDateTime() {
    const now = new Date();
    dateTime.textContent = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ============================
// HISTÓRICO
// ============================
function loadHistory() {
    try {
        const saved = localStorage.getItem('genioDigitalHistory3');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            conversationHistory.forEach(msg => {
                addMessageToChat(msg.text, msg.sender, false);
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        return false;
    }
}

function saveHistory() {
    try {
        localStorage.setItem('genioDigitalHistory3', JSON.stringify(conversationHistory));
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
    }
}

// ============================
// FUNÇÃO: Adicionar mensagem
// ============================
function addMessage(text, sender, save = true) {
    addMessageToChat(text, sender, save);
}

function addMessageToChat(text, sender, save = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = text;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timestamp';
    timeSpan.textContent = new Date().toLocaleTimeString('pt-BR');
    msgDiv.appendChild(timeSpan);
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    if (save) {
        conversationHistory.push({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        saveHistory();
    }
}

// ============================
// 🎬 FUNÇÃO: GERAR VÍDEO (CHAT)
// ============================
async function generateVideo(prompt) {
    try {
        let duration = 5;
        let aspectRatio = '16:9';
        let model = 'wan';
        let cleanPrompt = prompt;
        
        const durationMatch = prompt.match(/(\d+)\s*(s|segundos?|seconds?)/i);
        if (durationMatch) {
            duration = parseInt(durationMatch[1]);
            if (duration < 1) duration = 1;
            if (duration > 10) duration = 10;
            cleanPrompt = cleanPrompt.replace(durationMatch[0], '');
        }
        
        const ratioMatch = prompt.match(/(\d+):(\d+)/);
        if (ratioMatch) {
            aspectRatio = ratioMatch[0];
            cleanPrompt = cleanPrompt.replace(ratioMatch[0], '');
        }
        
        cleanPrompt = cleanPrompt.trim();
        if (!cleanPrompt) {
            cleanPrompt = "beautiful landscape with clouds and sunset";
        }
        
        addMessage(`⏳ Gerando vídeo... (⏱️${duration}s | 📐${aspectRatio} | 🤖${model})`, 'bot');
        
        const apiKey = "pk_SRo7TFVV02htDAgZ";
        const encodedPrompt = encodeURIComponent(cleanPrompt);
        const url = `https://gen.pollinations.ai/video/${encodedPrompt}?duration=${duration}&aspectRatio=${aspectRatio}&model=${model}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}&key=${apiKey}`;
        
        console.log('🎬 URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        const video = document.createElement('video');
        video.src = videoUrl;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.borderRadius = '12px';
        video.style.marginTop = '10px';
        video.style.border = '1px solid var(--border-color)';
        video.style.background = '#000';
        video.style.maxHeight = '400px';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Baixar Vídeo';
        downloadBtn.style.cssText = `
            display: inline-block;
            margin-top: 8px;
            margin-right: 8px;
            padding: 8px 16px;
            background: #f0883e;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.05)';
        downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `genio-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        const shareBtnVideo = document.createElement('button');
        shareBtnVideo.textContent = '📤 Compartilhar';
        shareBtnVideo.style.cssText = `
            display: inline-block;
            margin-top: 8px;
            padding: 8px 16px;
            background: #238636;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        shareBtnVideo.onmouseover = () => shareBtnVideo.style.transform = 'scale(1.05)';
        shareBtnVideo.onmouseout = () => shareBtnVideo.style.transform = 'scale(1)';
        shareBtnVideo.onclick = () => {
            if (navigator.share) {
                navigator.share({
                    title: '🎬 Vídeo criado pelo Gênio Digital',
                    text: `Assista este vídeo: ${cleanPrompt}`,
                    url: videoUrl
                });
            } else {
                navigator.clipboard.writeText(videoUrl).then(() => {
                    addMessage('📤 Link do vídeo copiado!', 'bot');
                });
            }
        };
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '8px';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.marginTop = '8px';
        btnContainer.appendChild(downloadBtn);
        btnContainer.appendChild(shareBtnVideo);
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = `🎬 **Vídeo gerado:** "${cleanPrompt}"<br><small>⏱️ ${duration}s | 📐 ${aspectRatio} | 🤖 ${model}</small>`;
        msgDiv.appendChild(video);
        msgDiv.appendChild(btnContainer);
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        conversationHistory.push({
            text: `🎬 Vídeo gerado: "${cleanPrompt}" (${duration}s, ${aspectRatio}, ${model})`,
            sender: 'bot',
            timestamp: new Date().toISOString()
        });
        saveHistory();
        
        codeOutput.textContent = `// 🎬 Vídeo gerado\n// Prompt: ${cleanPrompt}\n// Duração: ${duration}s\n// Proporção: ${aspectRatio}\n// Modelo: ${model}`;
        
        statusIndicator.innerHTML = '✅ Vídeo gerado com sucesso!';
        setTimeout(() => {
            statusIndicator.innerHTML = '🧠 Gênio Digital 3.0 - Ativo';
        }, 3000);
        
        return null;
    } catch (error) {
        console.error('Erro no vídeo:', error);
        return `❌ **Erro ao gerar vídeo:** ${error.message}

💡 **Dicas:**
• Use prompts em INGLÊS (ex: "a cat")
• Duração: 3-8 segundos
• Proporção: 16:9

**Exemplo:**
\`video a cat, 4s, 16:9\``;
    }
}

// ============================
// FUNÇÃO: Gerar imagem (chat)
// ============================
async function generateImage(prompt) {
    try {
        const styleMap = {
            'realistic': `${prompt}, photorealistic, 4k, highly detailed, realistic, professional photography`,
            'anime': `${prompt}, anime style, studio ghibli, vibrant colors, anime art, manga`,
            'painting': `${prompt}, oil painting, renaissance, masterpiece, detailed brushstrokes, art gallery`,
            'cyberpunk': `${prompt}, cyberpunk, neon lights, futuristic, synthwave, 80s aesthetic, glowing`,
            'fantasy': `${prompt}, fantasy art, magical, ethereal, mythical, dreamlike, enchanting`,
            'cartoon': `${prompt}, cartoon style, pixar, colorful, animated, disney style, cute`
        };
        const stylePrompt = styleMap[currentStyle] || styleMap['realistic'];
        
        addMessage(`⏳ Gerando imagem... (${currentStyle})`, 'bot');
        
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(stylePrompt)}?width=768&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        img.style.marginTop = '10px';
        img.style.border = '1px solid var(--border-color)';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Baixar Imagem';
        downloadBtn.style.cssText = `
            display: inline-block;
            margin-top: 8px;
            margin-right: 8px;
            padding: 8px 16px;
            background: #f0883e;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.05)';
        downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `genio-${currentStyle}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        const shareBtnImg = document.createElement('button');
        shareBtnImg.textContent = '📤 Compartilhar';
        shareBtnImg.style.cssText = `
            display: inline-block;
            margin-top: 8px;
            padding: 8px 16px;
            background: #238636;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        `;
        shareBtnImg.onmouseover = () => shareBtnImg.style.transform = 'scale(1.05)';
        shareBtnImg.onmouseout = () => shareBtnImg.style.transform = 'scale(1)';
        shareBtnImg.onclick = () => {
            if (navigator.share) {
                navigator.share({
                    title: '🎨 Imagem criada pelo Gênio Digital',
                    text: `Veja esta imagem: ${prompt}`,
                    url: imageUrl
                });
            } else {
                navigator.clipboard.writeText(imageUrl).then(() => {
                    addMessage('📤 Link da imagem copiado!', 'bot');
                });
            }
        };
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '8px';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.marginTop = '8px';
        btnContainer.appendChild(downloadBtn);
        btnContainer.appendChild(shareBtnImg);
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = `🎨 **Imagem gerada (${currentStyle}):** "${prompt}"`;
        msgDiv.appendChild(img);
        msgDiv.appendChild(btnContainer);
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        conversationHistory.push({
            text: `🎨 Imagem gerada (${currentStyle}): "${prompt}"`,
            sender: 'bot',
            timestamp: new Date().toISOString()
        });
        saveHistory();
        
        codeOutput.textContent = `// 🎨 Imagem gerada\n// Estilo: ${currentStyle}\n// Prompt: ${prompt}`;
        
        return null;
    } catch (error) {
        return `❌ Erro ao gerar imagem: ${error.message}`;
    }
}

// ============================
// FUNÇÃO: Gerar código
// ============================
function generateCode(description) {
    const lower = description.toLowerCase();
    let code = '';
    let language = 'javascript';
    
    if (lower.includes('python') || lower.includes('py')) {
        language = 'python';
        code = `# 🐍 Código Python\n\n` +
               `def solucao():\n` +
               `    """\n` +
               `    ${description}\n` +
               `    """\n` +
               `    resultado = 0\n` +
               `    # Sua lógica aqui\n` +
               `    return resultado\n\n` +
               `# Teste:\n` +
               `# print(solucao())`;
    } else if (lower.includes('javascript') || lower.includes('js')) {
        language = 'javascript';
        code = `// 🟨 Código JavaScript\n\n` +
               `function solucao() {\n` +
               `    /**\n` +
               `     * ${description}\n` +
               `     */\n` +
               `    let resultado = 0;\n` +
               `    // Sua lógica aqui\n` +
               `    return resultado;\n` +
               `}\n\n` +
               `// Teste:\n` +
               `// console.log(solucao());`;
    } else if (lower.includes('html')) {
        language = 'html';
        code = `<!-- 🌐 Código HTML -->\n\n` +
               `<!DOCTYPE html>\n` +
               `<html>\n` +
               `<head>\n` +
               `    <title>Gênio Digital</title>\n` +
               `</head>\n` +
               `<body>\n` +
               `    <h1>${description}</h1>\n` +
               `    <p>Criado pelo Gênio Digital!</p>\n` +
               `</body>\n` +
               `</html>`;
    } else {
        code = `// 💻 Código gerado\n\n` +
               `function solucao() {\n` +
               `    // ${description}\n` +
               `    console.log("Gênio Digital criou este código!");\n` +
               `    return "✨ Feito!";\n` +
               `}\n\n` +
               `// Execute:\n` +
               `// solucao();`;
    }
    
    return { code, language };
}

// ============================
// FUNÇÃO: Exportar código
// ============================
function exportCode() {
    const code = codeOutput.textContent;
    if (!code || code.includes('// O Gênio vai colocar o resultado aqui')) {
        alert('🧞 Nada para exportar ainda!');
        return;
    }
    
    let ext = '.js';
    if (code.includes('Python')) ext = '.py';
    else if (code.includes('HTML')) ext = '.html';
    else if (code.includes('CSS')) ext = '.css';
    
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genio-codigo${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📥 **Código exportado com sucesso!**', 'bot');
}

// ============================
// FUNÇÃO: Pesquisar REAL (DuckDuckGo)
// ============================
async function searchWeb(query) {
    try {
        addMessage(`🔎 Pesquisando por: "${query}"...`, 'bot');
        
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.AbstractText) {
            return `🔍 **Resultado para:** "${query}"\n\n` +
                   `${data.AbstractText}\n\n` +
                   `📎 **Fonte:** ${data.AbstractURL || 'DuckDuckGo'}`;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            let results = `🔍 **Resultados para:** "${query}"\n\n`;
            data.RelatedTopics.slice(0, 5).forEach((topic, i) => {
                if (topic.Text) {
                    results += `${i+1}. ${topic.Text.replace(/<[^>]*>/g, '')}\n`;
                }
            });
            return results;
        } else {
            return `🔍 **Nenhum resultado encontrado para:** "${query}"\n\n` +
                   `💡 Tente usar termos mais simples ou específicos.`;
        }
    } catch (error) {
        return `❌ **Erro na pesquisa:** ${error.message}\n\n` +
               `💡 Tente novamente em alguns segundos.`;
    }
}

// ============================
// FUNÇÃO: Comandos por Voz
// ============================
function initVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.textContent = '🔴';
        addMessage('🎤 Ouvindo... Fale agora!', 'bot');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendBtn.click();
    };
    
    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            addMessage('❌ Permissão de microfone negada!', 'bot');
        } else if (event.error !== 'aborted') {
            addMessage(`❌ Erro no microfone: ${event.error}`, 'bot');
        }
        stopRecording();
    };
    
    recognition.onend = () => {
        stopRecording();
    };
    
    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.abort();
            stopRecording();
        } else {
            try {
                recognition.start();
            } catch (e) {
                addMessage('❌ Erro ao iniciar microfone. Tente novamente.', 'bot');
            }
        }
    });
}

function stopRecording() {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎤';
}

// ============================
// FUNÇÃO: Compartilhar
// ============================
function shareGênio() {
    if (navigator.share) {
        navigator.share({
            title: '🧞 Gênio Digital 3.0',
            text: 'Conheça minha IA pessoal! Ela gera imagens, vídeos GRATUITOS, código, pesquisa e muito mais!',
            url: window.location.href
        }).catch(() => {});
    } else {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            addMessage('📤 **Link copiado!** Compartilhe com seus amigos!', 'bot');
        }).catch(() => {
            prompt('Copie o link:', url);
        });
    }
}

// ============================
// FUNÇÃO: Ajuda
// ============================
function showHelp() {
    return `🧞 **GÊNIO DIGITAL 3.0 - TUDO QUE ELE FAZ!**

🎬 **GERAR VÍDEOS GRATUITOS!**
\`video um gato dançando, 6s, 16:9\`
\`video a cat, 4s, 16:9\`
• Duração: 3-8s | Proporção: 16:9, 9:16, 1:1
• Modelos GRATUITOS: wan, ltx-2

🎨 **GERAR IMAGENS** (6 estilos!)
\`imagem um gato astronauta\`
• Estilos: Realista, Anime, Pintura, Cyberpunk, Fantasia, Cartoon

💻 **GERAR CÓDIGO**
\`codigo uma função que soma dois números em Python\`

🔍 **PESQUISAR** (REAL!)
\`pesquisar inteligência artificial\`

🧠 **FAZER PERGUNTAS**
• "Quem é você?" | "O que é IA?" | "Como programar?"
• "O sentido da vida?" | "Como funciona o Gênio?"

🎤 **COMANDOS POR VOZ**
Clique no ícone 🎤 e fale!

📚 **HISTÓRICO**
\`historico\` - Ver mensagens
\`estatisticas\` - Ver estatísticas
\`baixar\` - Baixar histórico
\`limpar\` - Limpar histórico

🌓 **TEMA** - Clique em 🌓

📤 **COMPARTILHAR** - Clique em 📤

---

**🎯 TESTE AGORA: \`video a cat, 4s, 16:9\`**`;
}

// ============================
// FUNÇÃO: Histórico
// ============================
function showHistory() {
    if (conversationHistory.length === 0) {
        return '🧞 Nenhuma conversa salva ainda!';
    }
    
    let text = `📚 **HISTÓRICO** (${conversationHistory.length} mensagens)\n\n`;
    conversationHistory.slice(-20).forEach((msg, index) => {
        const sender = msg.sender === 'user' ? '👤 Você' : '🧞 Gênio';
        const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR');
        const msgText = msg.text.length > 60 ? msg.text.substring(0, 60) + '...' : msg.text;
        text += `**${index + 1}.** ${sender} (${time}): ${msgText}\n`;
    });
    text += `\n💡 Digite "baixar" para baixar o histórico completo.`;
    return text;
}

// ============================
// FUNÇÃO: Estatísticas
// ============================
function showStats() {
    if (conversationHistory.length === 0) {
        return '🧞 Nenhuma conversa ainda! Comece a conversar!';
    }
    
    const total = conversationHistory.length;
    const userMsgs = conversationHistory.filter(m => m.sender === 'user').length;
    const botMsgs = conversationHistory.filter(m => m.sender === 'bot').length;
    
    const commands = { imagem: 0, video: 0, codigo: 0, pesquisar: 0, ajuda: 0, pergunta: 0 };
    conversationHistory.forEach(msg => {
        const text = msg.text.toLowerCase();
        if (text.includes('imagem')) commands.imagem++;
        if (text.includes('video') || text.includes('vídeo')) commands.video++;
        if (text.includes('codigo') || text.includes('código')) commands.codigo++;
        if (text.includes('pesquisar') || text.includes('buscar')) commands.pesquisar++;
        if (text.includes('ajuda') || text.includes('comandos')) commands.ajuda++;
        if (text.includes('?')) commands.pergunta++;
    });
    
    const emojis = ['🌟', '✨', '🚀', '🎯', '💡', '🔥'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return `${emoji} **ESTATÍSTICAS DO GÊNIO 3.0**

📝 **Total:** ${total} mensagens
👤 **Você:** ${userMsgs} mensagens
🧞 **Gênio:** ${botMsgs} mensagens

🎬 **Comandos usados:**
• Imagens: ${commands.imagem}
• Vídeos (GRATUITOS): ${commands.video} 🆕
• Códigos: ${commands.codigo}
• Pesquisas: ${commands.pesquisar}
• Ajuda: ${commands.ajuda}
• Perguntas: ${commands.pergunta}

🧠 **Personalidade:** ${getPersonality()}

📅 **Início:** ${new Date(conversationHistory[0].timestamp).toLocaleString('pt-BR')}
🕐 **Última:** ${new Date(conversationHistory[conversationHistory.length-1].timestamp).toLocaleString('pt-BR')}

💾 **Histórico salvo no seu navegador!**`;
}

// ============================
// FUNÇÃO: Baixar histórico
// ============================
function downloadHistory() {
    if (conversationHistory.length === 0) {
        addMessage('🧞 Não há histórico para baixar!', 'bot');
        return;
    }
    
    let text = '🧞 GÊNIO DIGITAL 3.0 - HISTÓRICO DA CONVERSA\n';
    text += '='.repeat(50) + '\n';
    text += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `Total: ${conversationHistory.length} mensagens\n`;
    text += `Personalidade: ${getPersonality()}\n`;
    text += '='.repeat(50) + '\n\n';
    
    conversationHistory.forEach((msg, index) => {
        const sender = msg.sender === 'user' ? '👤 VOCÊ' : '🧞 GÊNIO';
        const time = new Date(msg.timestamp).toLocaleString('pt-BR');
        text += `[${index + 1}] ${sender} (${time}):\n`;
        text += `${msg.text}\n\n`;
    });
    
    text += '='.repeat(50) + '\n';
    text += '🧞 Gênio Digital 3.0 - Criado com 💖';
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genio-historico-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📥 **Histórico baixado com sucesso!**', 'bot');
}

// ============================
// FUNÇÃO: Limpar histórico
// ============================
function clearHistory() {
    if (conversationHistory.length === 0) {
        addMessage('🧞 O histórico já está vazio!', 'bot');
        return;
    }
    
    if (confirm('🧞 Tem certeza que quer limpar TODO o histórico?')) {
        conversationHistory = [];
        messagesDiv.innerHTML = '';
        localStorage.removeItem('genioDigitalHistory3');
        addMessage('🧞 Histórico limpo com sucesso!', 'bot');
    }
}

// ============================
// 🎯 FUNÇÃO PRINCIPAL (VÍDEO VEM PRIMEIRO!)
// ============================
async function processCommand(input) {
    if (isProcessing) {
        addMessage('⏳ Calma! Já estou processando um comando...', 'bot');
        return;
    }

    const lower = input.toLowerCase().trim();
    
    if (!input) {
        addMessage('🧞 Diga algo, estou aqui para ajudar!', 'bot');
        return;
    }

    isProcessing = true;

    try {
        // ============================================================
        // 🎬 VÍDEO - DEVE VIR ANTES DE QUALQUER COISA!
        // ============================================================
        if (lower.startsWith('video') || lower.startsWith('vídeo') || 
            lower.startsWith('cria video') || lower.startsWith('cria vídeo') ||
            lower.startsWith('gerar video') || lower.startsWith('gerar vídeo')) {
            const prompt = input.replace(/^(video|vídeo|cria video|cria vídeo|gerar video|gerar vídeo)\s*/i, '').trim() || "a beautiful landscape with clouds and sunset";
            const result = await generateVideo(prompt);
            if (result) {
                addMessage(result, 'bot');
            }
            return;
        }

        // ============================================================
        // COMANDOS ESPECIAIS
        // ============================================================
        
        // AJUDA
        if (lower.includes('ajuda') || lower.includes('comandos') || lower === '?') {
            addMessage(showHelp(), 'bot');
            return;
        }

        // HISTÓRICO
        if (lower === 'historico' || lower === 'histórico') {
            addMessage(showHistory(), 'bot');
            return;
        }

        // ESTATÍSTICAS
        if (lower === 'estatisticas' || lower === 'estatísticas' || lower === 'stats') {
            addMessage(showStats(), 'bot');
            return;
        }

        // BAIXAR HISTÓRICO
        if (lower === 'baixar' || lower === 'download' || lower === 'exportar') {
            downloadHistory();
            return;
        }

        // LIMPAR HISTÓRICO
        if (lower === 'limpar' || lower === 'limpar historico' || lower === 'limpar histórico') {
            clearHistory();
            return;
        }

        // ============================================================
        // 🎨 IMAGEM
        // ============================================================
        if (lower.startsWith('imagem') || lower.startsWith('gera imagem') || lower.startsWith('cria imagem')) {
            const prompt = input.replace(/^(imagem|gera imagem|cria imagem)\s*/i, '').trim() || "beautiful landscape";
            const result = await generateImage(prompt);
            if (result) {
                addMessage(result, 'bot');
            }
            return;
        }

        // ============================================================
        // 💻 CÓDIGO
        // ============================================================
        if (lower.startsWith('codigo') || lower.startsWith('código') || 
            lower.startsWith('gera codigo') || lower.startsWith('gera código') ||
            lower.startsWith('cria codigo') || lower.startsWith('cria código')) {
            const desc = input.replace(/^(codigo|código|gera codigo|gera código|cria codigo|cria código)\s*/i, '').trim() || "função de exemplo";
            const { code, language } = generateCode(desc);
            codeOutput.textContent = code;
            addMessage(`✅ Código gerado! Veja na área de saída abaixo.`, 'bot');
            return;
        }

        // ============================================================
        // 🔍 PESQUISAR
        // ============================================================
        if (lower.startsWith('pesquisar') || lower.startsWith('buscar') || lower.startsWith('pesquisa')) {
            const query = input.replace(/^(pesquisar|buscar|pesquisa)\s*/i, '').trim() || "inteligência artificial";
            const result = await searchWeb(query);
            addMessage(result, 'bot');
            codeOutput.textContent = `// 🔍 Pesquisa\n// Termo: ${query}\n// Data: ${new Date().toLocaleString()}`;
            return;
        }

        // ============================================================
        // SAUDAÇÃO (DEVE VIR ANTES DAS PERGUNTAS)
        // ============================================================
        if (lower.includes('oi') || lower.includes('olá') || lower.includes('opa') || 
            lower === 'eae' || lower === 'ola' || lower === 'alo') {
            const greetings = [
                '🧞 Olá! Como posso ajudar você hoje?',
                '✨ Oi! Estou pronto para criar!',
                '🚀 E aí? Vamos codar?',
                '🎩 Salve! O Gênio Digital está aqui!',
                '🌟 Olá! Que bom te ver!'
            ];
            addMessage(greetings[Math.floor(Math.random() * greetings.length)], 'bot');
            return;
        }

        // ============================================================
        // RESPOSTA INTELIGENTE PARA PERGUNTAS (DEVE SER A ÚLTIMA!)
        // ============================================================
        if (lower.includes('?')) {
            const response = await getAIResponse(input);
            addMessage(response, 'bot');
            return;
        }

        // ============================================================
        // RESPOSTA PADRÃO
        // ============================================================
        addMessage(`🧞 ${getRandomReaction()}\n\nTente "ajuda" para ver todos os comandos.`, 'bot');
        
    } catch (error) {
        addMessage(`❌ Erro: ${error.message}`, 'bot');
    } finally {
        isProcessing = false;
    }
}

// ============================
// TEMAS
// ============================
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeBtn.textContent = isDarkTheme ? '🌓' : '☀️';
    localStorage.setItem('genioTheme3', isDarkTheme ? 'dark' : 'light');
}

function loadTheme() {
    const saved = localStorage.getItem('genioTheme3');
    if (saved === 'light') {
        isDarkTheme = false;
        document.documentElement.setAttribute('data-theme', 'light');
        themeBtn.textContent = '☀️';
    }
}

// ============================
// EVENTOS
// ============================
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    
    // Evento do botão de tema
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    
    // Evento do botão de compartilhar
    document.getElementById('shareBtn').addEventListener('click', shareGênio);
    
    // Evento do botão de enviar (chat)
    document.getElementById('sendBtn').addEventListener('click', async () => {
        const text = document.getElementById('userInput').value.trim();
        if (!text) return;

        addMessage(text, 'user');
        document.getElementById('userInput').value = '';
        document.getElementById('userInput').focus();

        await processCommand(text);
    });
    
    // Evento do Enter no chat
    document.getElementById('userInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('sendBtn').click();
        }
    });
    
    // Evento do botão de copiar
    document.getElementById('copyBtn').addEventListener('click', () => {
        const code = document.getElementById('codeOutput').textContent;
        if (!code || code.includes('// O Gênio vai colocar o resultado aqui')) {
            alert('🧞 Nada para copiar ainda!');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            addMessage('📋 Código copiado!', 'bot');
        }).catch(() => {
            const range = document.createRange();
            range.selectNode(document.getElementById('codeOutput'));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            addMessage('📋 Código copiado!', 'bot');
        });
    });
    
    // Evento do botão de exportar
    document.getElementById('exportBtn').addEventListener('click', exportCode);
    
    // Evento do botão de limpar
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('codeOutput').textContent = '// O Gênio vai colocar o resultado aqui';
    });
    
    // Inicializar voz
    initVoice();
    
    // Carregar histórico
    setTimeout(() => {
        const hasHistory = loadHistory();
        if (hasHistory) {
            addMessage(`🧞 **Histórico carregado!** (${conversationHistory.length} mensagens)`, 'bot');
        }
        
        addMessage('🧞 **GÊNIO DIGITAL 3.0 ATIVADO!** 🚀\n\n' +
                   '🌟 **NOVAS FUNCIONALIDADES:**\n' +
                   '• 🎬 **GERA VÍDEOS GRATUITOS!** (wan)\n' +
                   '• 🎨 **GERA IMAGENS** com 6 estilos!\n' +
                   '• 💬 **ASSISTENTE** para perguntas\n' +
                   '• 📥 **Baixa** e **compartilha** conteúdo\n\n' +
                   '**Escolha uma opção no menu acima!**', 'bot');
    }, 500);
});