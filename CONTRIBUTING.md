# Guia de Contribuição (CONTRIBUTING.md)

Primeiramente, muito obrigado por considerar contribuir para o **Job Inquisitor**! 🕵️‍♂️
Este é um projeto Open-Source focado em resiliência, automação ética de carreiras e arquitetura limpa. Nossa comunidade valoriza código bem testado e foco em segurança.

Abaixo estão as diretrizes para garantir que sua contribuição seja revisada e aceita rapidamente.

## 🛠️ 1. Como configurar o ambiente local

O sistema foi desenhado para ser "plug-and-play". Siga estes passos:

1. Faça um Fork do repositório.
2. Clone o seu fork para a sua máquina: `git clone https://github.com/SEU_USUARIO/Job-Inquisitor.git`
3. Execute o bootstrapper universal para instalar as dependências:
   - **Windows:** Dê um duplo clique no arquivo `Job-Inquisitor-Windows.bat`
   - **Linux/Mac:** Execute `./Job-Inquisitor-Linux-Mac.sh`

## 🌿 2. Padrão de Nomenclatura de Branches

Nós seguimos o padrão de mercado para controle de versão. Nunca faça commits diretos na branch `main`. Crie uma branch específica para o seu trabalho:

- Para novas funcionalidades: `feat/nome-da-funcionalidade`
- Para correção de bugs: `fix/nome-do-bug`
- Para melhorias de documentação: `docs/nome-da-melhoria`
- Para refatorações (sem alteração de regras de negócio): `refactor/nome-da-refatoracao`

*Exemplo: `git checkout -b feat/integracao-nova-ia`*

## 🧑‍💻 3. Padrões de Código e Arquitetura

Para manter o alto nível de engenharia do repositório, sua PR será avaliada com base nestas diretrizes:

- **SOLID & Clean Code:** Mantenha os serviços desacoplados. Se você criar uma funcionalidade nova, ela deve residir dentro de `src/services/` e ser invocada pelo `JobController`.
- **ES Modules:** Utilize sempre `import / export`. Não utilize `require()`.
- **Proteção de Falsos Positivos:** Se você alterar regras da Inteligência Artificial ou do Motor Heurístico, certifique-se de que vagas legítimas não sejam excluídas (sempre direcione dúvidas para a `Quarentena`).
- **Testes (Túnel de Vento):** Ao alterar regras de negócio, garanta que os testes no `scripts/test-runner.js` não sejam quebrados. Rode `npm test` antes de enviar seu código.

## 🚀 4. Como enviar seu Pull Request (PR)

1. Faça os commits com mensagens claras e objetivas. Exemplo: `feat: adiciona suporte para a plataforma XYZ`.
2. Faça o push para o seu fork: `git push origin feat/nome-da-sua-branch`.
3. Abra um Pull Request no repositório original.
4. Na descrição do PR, explique detalhadamente **o problema que você resolveu** e **como você testou**.

## ⚖️ 5. Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente profissional, colaborativo e livre de assédio. Trate todos os desenvolvedores com respeito. Debates sobre arquitetura são bem-vindos, mas ataques pessoais não serão tolerados.
