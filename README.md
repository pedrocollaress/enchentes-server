# **Flood Monitor \- Sistema de Alerta de Enchentes IoT**

O **Flood Monitor** é um sistema completo de monitoramento de enchentes em tempo real, construído com um dispositivo IoT (NodeMCU) e uma aplicação web moderna (Next.js) hospedada na Vercel.

Este projeto detecta o nível da água através de um sensor capacitivo e, ao atingir um ponto crítico, envia um pulso para uma API. A API salva o registro em um banco de dados (Vercel KV/Redis), dispara um e-mail de alerta (Resend) e atualiza um dashboard de monitoramento em tempo real.

## **📋 Sumário**

- [Funcionalidades](https://www.google.com/search?q=%23-funcionalidades)
- [Arquitetura do Sistema](https://www.google.com/search?q=%23-arquitetura-do-sistema)
- [Stack de Tecnologias](https://www.google.com/search?q=%23-stack-de-tecnologias)
- [Configuração do Hardware (NodeMCU)](https://www.google.com/search?q=%23-configura%C3%A7%C3%A3o-do-hardware-nodemcu)
- [Configuração do Software (Next.js / Vercel)](https://www.google.com/search?q=%23-configura%C3%A7%C3%A3o-do-software-nextjs--vercel)
- [Variáveis de Ambiente](https://www.google.com/search?q=%23-vari%C3%A1veis-de-ambiente)
- [Estrutura do Projeto (Software)](https://www.google.com/search?q=%23-estrutura-do-projeto-software)

## **✨ Funcionalidades**

- **Detecção de Nível de Água:** Utiliza um sensor capacitivo LJC18A3-H-Z/BY para detecção precisa.
- **Comunicação em Tempo Real:** O NodeMCU (ESP8266) envia um pulso instantâneo via HTTP POST ao detectar o nível de risco.
- **Banco de Dados Persistente:** Cada pulso é salvo com um timestamp em um banco de dados Redis (Vercel KV), criando um log histórico.
- **Alertas por E-mail:** Um e-mail de alerta é disparado automaticamente via **Resend** a cada pulso detectado.
- **Dashboard Dinâmico:** Uma interface em React (shadcn/ui \+ Recharts) exibe o status de perigo, o total de pulsos do dia e um gráfico de ocorrências por hora.
- **Atualização Automática:** O dashboard principal se atualiza a cada 10 segundos (via polling) para exibir os dados mais recentes.
- **Relatório Histórico:** Uma página de "Relatórios" lista **todos** os pulsos já registrados no banco de dados.

## **🏗️ Arquitetura do Sistema**

O fluxo de dados do projeto é o seguinte:

1. **Sensor (Hardware):** O sensor capacitivo (LJC18A3) detecta a água.
2. **NodeMCU (Hardware):** O pino D1 lê o sinal do sensor (através de um divisor de tensão). Ao receber um pulso HIGH, o NodeMCU se conecta ao Wi-Fi.
3. **HTTP POST (IoT \-\> Cloud):** O NodeMCU envia um HTTP POST para a API Route (app/api/pulse/route.js) com o corpo {"sensor":"true"}.
4. API Route (Next.js): A API recebe o request.  
   a. Valida o body da requisição.  
   b. Chama savePulseToDB(): O app/service/redis.ts salva o pulso no Vercel KV (Redis) com um timestamp do servidor.  
   c. Responde 200 OK: A API responde imediatamente ao NodeMCU, liberando-o.  
   d. Chama sendEmailAlert(): De forma assíncrona ("fire-and-forget"), o app/service/email.ts é chamado.
5. **Serviço de E-mail (Resend):** O email.ts usa a API do Resend para disparar um e-mail de alerta para o administrador.
6. Frontend (React):  
   a. O MainContent (Dashboard) faz um GET /api/pulse a cada 10 segundos.  
   b. O ReportsContent (Relatórios) faz um GET /api/pulse uma vez ao carregar.  
   c. A API GET lê os dados do Vercel KV (via getLatestPulses) e os retorna ao frontend para exibição.

## **🚀 Stack de Tecnologias**

### **Software (Cloud)**

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Hospedagem:** [Vercel](https://vercel.com/)
- **Banco de Dados:** [Vercel KV](https://vercel.com/storage/kv) (Baseado em Redis)
- **Serviço de E-mail:** [Resend](https://resend.com/)
- **UI:** [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Recharts](https://recharts.org/)
- **Linguagem:** TypeScript e JavaScript

### **Hardware (IoT)**

- **Microcontrolador:** NodeMCU (ESP8266)
- **Linguagem:** C++ (Arduino Framework)
- **Sensor:** Sensor Capacitivo LJC18A3-H-Z/BY (PNP)
- **Firmware:** [PlatformIO](https://platformio.org/) ou [Arduino IDE](https://www.arduino.cc/en/software)

## **🖥️ Configuração do Software (Next.js / Vercel)**

1. **Clone o Repositório:**  
   git clone https://github.com/pedrocollaress/enchentes-server  
   cd enchentes-server

2. **Instale as Dependências:**  
   npm install

3. Conecte os Serviços Vercel:  
   a. Vercel KV (Redis): Vá ao seu painel Vercel, crie um banco de dados KV (pulse-reports) e conecte-o ao seu projeto.  
   b. Resend (E-mail): Crie uma conta no Resend, gere uma Chave de API (API Key) e adicione-a como uma variável de ambiente no Vercel chamada RESEND_API_KEY.  
   c. Domínio de E-mail: Para produção, verifique seu domínio no Resend. Para testes, o serviço email.ts está configurado para usar onboarding@resend.dev como remetente (FROM_EMAIL).
4. **Puxe as Variáveis de Ambiente:**  
   vercel env pull .env.development.local

   Isso criará um arquivo .env.development.local com a sua REDIS_URL. Você deve adicionar manualmente a RESEND_API_KEY a este arquivo para testes locais.

5. **Rode o Projeto:**  
   npm run dev

## **flashed_storage: Variáveis de Ambiente**

O projeto requer dois conjuntos de variáveis de ambiente.

### **1\. Aplicação Next.js (Arquivo .env.development.local)**

Estas são gerenciadas pela Vercel (exceto o Resend, que você adiciona manualmente).

\# Fornecida pelo Vercel KV ao linkar o banco de dados  
REDIS_URL="redis://default:..."

\# Fornecida pelo Resend ao criar uma chave de API  
RESEND_API_KEY="re\_..."

### **2\. Firmware do NodeMCU (Arquivo data/.env)**

Este arquivo deve ser criado na pasta data/ do seu projeto Arduino/PlatformIO e enviado para o NodeMCU usando a ferramenta "Upload Filesystem Image".

\# Credenciais da sua rede Wi-Fi  
WIFI_SSID=SuaRedeWifi  
WIFI_PASS=SuaSenhaWifi

\# URL da sua API na Vercel  
SERVER_API_URL=(https://floodmonitor.vercel.app/api/pulse)

## **📁 Estrutura do Projeto (Software)**

app/  
├── api/pulse/  
│ └── route.js \# A API que recebe o POST do NodeMCU e o GET do frontend.  
├── service/  
│ ├── redis.ts \# Lógica de conexão e salvamento no Vercel KV (Redis).  
│ └── email.ts \# Lógica de disparo de e-mail via Resend.  
└── page.tsx \# Página principal (Dashboard)  
└── reports/  
 └── page.tsx \# Página de Relatórios

components/  
├── main-content.tsx \# O componente do Dashboard (Gráficos, Cards de Status).  
├── reports-content.tsx \# O componente da página de Relatórios (Lista de logs).  
└── ui/ \# Componentes gerados pelo shadcn/ui (Card, Skeleton, etc).
