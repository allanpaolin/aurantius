# AURANTIUS

Plataforma web oficial da **AURANTIUS**.

Este repositório reúne a presença digital da empresa e serve como base para o desenvolvimento contínuo do **Aurantius Labs**, um ecossistema de ferramentas digitais criado para demonstrar a capacidade técnica da AURANTIUS através de soluções úteis, elegantes e de alta qualidade.

Mais do que um site institucional, este projeto representa a filosofia da empresa: construir experiências digitais que unem estratégia, tecnologia, simplicidade e excelência em execução.

---

# 🌐 Website

https://aurantius.com.br

---

# 🎯 Visão do Projeto

A AURANTIUS não busca ser apenas mais uma empresa de tecnologia com uma lista de serviços.

Sua presença digital foi concebida para demonstrar competência através daquilo que constrói.

A Landing Page apresenta a visão da empresa.

O **Aurantius Labs** materializa essa visão através de ferramentas úteis, desenvolvidas com o mesmo cuidado dedicado aos projetos de clientes.

Cada nova ferramenta deve resolver um problema real de forma simples, rápida, intuitiva e elegante.

---

# 🧠 Filosofia

Todo o projeto segue alguns princípios fundamentais.

* Simplicidade acima da complexidade.
* Clareza acima do excesso de informação.
* Performance acima de efeitos visuais.
* Elegância através dos detalhes.
* Tecnologia como meio, nunca como protagonista.
* Experiência do usuário em primeiro lugar.
* Consistência visual em todo o ecossistema.
* Crescimento sustentável da arquitetura.

Cada decisão de design ou desenvolvimento deve contribuir para uma experiência leve, sofisticada e intuitiva.

---

# 🛠 Tecnologias

* HTML5
* CSS3
* JavaScript (Vanilla)
* Lucide Icons
* Google Fonts (Inter)

O projeto foi desenvolvido sem frameworks front-end, priorizando:

* controle total da arquitetura;
* excelente desempenho;
* baixo consumo de recursos;
* facilidade de manutenção;
* independência de bibliotecas externas.

---

# 📁 Estrutura do Projeto

```text
/
├── index.html
│
├── labs/
│   ├── index.html
│   └── <nome-da-ferramenta>/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
└── assets/
    ├── css/
    │   └── global.css
    ├── js/
    │   └── global.js
    └── images/
```

A estrutura foi planejada para crescer naturalmente, permitindo a inclusão contínua de novas ferramentas sem impactar o restante da plataforma.

---

# 🧩 Arquitetura

O projeto é dividido em duas áreas principais.

## Landing Page

A página principal (`/index.html`) representa institucionalmente a AURANTIUS.

Ela deve permanecer limpa, objetiva e minimalista.

Seu propósito é apresentar a marca, transmitir credibilidade e despertar curiosidade.

Ela não deve se transformar em um catálogo de serviços ou em uma página carregada de informações.

---

## Aurantius Labs

O Aurantius Labs é uma coleção de ferramentas digitais desenvolvidas pela AURANTIUS.

Cada ferramenta possui sua própria pasta e funciona de forma independente.

Estrutura padrão:

```text
labs/
└── <nome-da-ferramenta>/
    ├── index.html
    ├── style.css
    └── script.js
```

Cada ferramenta é responsável apenas pelo seu próprio funcionamento.

Recursos compartilhados devem permanecer centralizados na pasta `assets`.

---

# 🎨 Identidade Visual

Toda nova página deve respeitar integralmente a identidade visual existente.

Características da interface:

* Visual limpo e sofisticado.
* Uso intencional de espaço em branco.
* Hierarquia tipográfica clara.
* Componentes discretos.
* Bordas suaves.
* Sombras leves.
* Microinterações naturais.
* Layout totalmente responsivo.

O objetivo não é impressionar através de efeitos, mas transmitir qualidade através da experiência.

---

# 📐 Princípios de Desenvolvimento

Ao implementar qualquer funcionalidade, priorizar:

* HTML semântico.
* CSS moderno.
* JavaScript Vanilla.
* Performance.
* Código limpo.
* Componentização quando fizer sentido.
* Facilidade de manutenção.
* Reutilização de recursos compartilhados.
* Simplicidade antes de complexidade.

Toda solução deve ser fácil de compreender e fácil de evoluir.

---

# 🚫 Regras do Projeto

Estas diretrizes devem ser respeitadas durante toda a evolução da plataforma.

* A Landing Page e o Aurantius Labs possuem responsabilidades distintas.
* Nenhuma ferramenta deve alterar ou criar dependência com a Landing Page.
* Cada ferramenta deve possuir seus próprios arquivos (`index.html`, `style.css` e `script.js`).
* Recursos compartilhados devem permanecer em `assets/css/global.css` e `assets/js/global.js`.
* Toda nova ferramenta deve seguir a identidade visual estabelecida.
* Evitar duplicação de código sempre que possível.
* Evitar dependências externas desnecessárias.
* Toda decisão técnica deve priorizar clareza, desempenho e facilidade de manutenção.

---

# ✨ Características

* Layout responsivo.
* HTML semântico.
* CSS moderno.
* JavaScript Vanilla.
* Navegação fluida.
* Microinterações discretas.
* SEO otimizado.
* Alto desempenho.
* Código organizado.
* Arquitetura escalável.

---

# 🚀 Evolução da Plataforma

A arquitetura foi planejada para permitir o crescimento contínuo do projeto.

Novas ferramentas poderão ser adicionadas ao **Aurantius Labs** sem necessidade de reestruturar o restante da aplicação.

O objetivo é que a plataforma evolua de forma consistente, mantendo simplicidade, desempenho e identidade visual em todas as futuras implementações.

---

# ⚙️ Desenvolvimento Local

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/aurantius.git
```

Abra a pasta do projeto.

Para desenvolvimento, recomenda-se utilizar o **Visual Studio Code** com a extensão **Live Server**.

---

# 📌 Diretriz Geral

Sempre que houver dúvida durante a evolução do projeto, siga esta ordem de prioridade:

1. Experiência do usuário.
2. Clareza.
3. Performance.
4. Simplicidade.
5. Consistência visual.
6. Escalabilidade.

Toda nova funcionalidade deve parecer uma evolução natural da plataforma, preservando a identidade construída pela AURANTIUS.

---

# © Licença

Este projeto é de propriedade da **AURANTIUS**.

Todos os direitos reservados.
