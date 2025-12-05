# Planejador Financeiro

Projeto acadêmico para a disciplina Programação III — Professor Alexandre Anderson dos Santos.

## Resumo
- Aplicação web simples para organizar entradas financeiras por dia (salários e despesas) e acompanhar metas.
- Interface com calendário para selecionar dias e adicionar movimentos.
- Armazenamento local via localStorage.

## Funcionalidades
- Visualização mensal do calendário.
- Seleção de um dia para ver/adicionar movimentos.
- Adição de despesas e salários por dia.
- Definição e acompanhamento de metas com progresso relativo ao saldo total.
- Armazenamento persistente no navegador (localStorage).

## Estrutura do projeto
```
financial-planner-calendar
├── src
│   ├── index.html         # Página principal.
│   ├── styles
│   │   └── style.css      # Estilos da interface.
│   └── scripts
│       ├── utils.js       # Utilitários (UID, formatação, helpers de data).
│       ├── calendar.js    # Lógica e render do calendário.
│       ├── planner.js     # Lógica do planner (estado, CRUD de itens e metas).
│       └── utils.js       # Funções utilitárias para scripts de suporte.
├── README.md              # Documentação para o projeto
└── .gitignore             # Arquivos e diretórios a serem ignorados no controle de versão
```

## Como executar (modo simples)
1. Abrir `src/index.html` diretamente em um navegador moderno (Chrome, Edge, Firefox).
2. Recomenda-se usar um servidor local para evitar restrições de CORS ao testar:
   - Com Python (cmd / PowerShell na pasta `src`):
     - `python -m http.server 3000`
     - Abrir `http://localhost:3000`
   - Ou, se tiver Node.js:
     - `npx http-server . -p 3000`
     - Abrir `http://localhost:3000`

## Uso rápido
- Navegue entre meses com os botões ‹ ›.
- Clique em um dia para selecioná-lo.
- Use os formulários para adicionar despesa, salário ou meta.
- Remova entradas ou metas com os botões correspondentes.
- Saldo total e progresso das metas são calculados automaticamente.

## Notas técnicas
- Estado do planner salvo em localStorage sob a chave `fp_data_v1`.
- O calendário emite evento customizado `calendar:dateSelected` na seleção de datas.
- Correções recentes:
  - Tratamento para evitar múltiplos listeners no calendário (corrige comportamento de pular meses).
  - Ajustes de CSS para centralização e fundo mais suave.

## Desenvolvimento
- Para alterar o layout, editar `styles/style.css`.
- Para lógica de calendário, editar `scripts/calendar.js`.
- Para regras do planner, editar `scripts/planner.js`.

## Licença e créditos
- Trabalho acadêmico para Programação III — Prof. Alexandre Anderson dos Santos.
- Autor: Vitor (repositório de aluno).
- Uso para fins educativos.

## Problemas conhecidos
- Não há suíte de testes automatizados neste projeto.
- Testado em navegadores modernos; diferenças visuais menores podem ocorrer em navegadores antigos.

## Contato
- Incluir aqui seu e-mail ou link do repositório caso queira publicar/compartilhar.