// Índice Cristocêntrico curado (MVP)
// Mapa AT → NT com tipos de conexão

export type ConnectionType = "citacao_direta" | "alusao" | "eco_tematico";

export interface ChristocentricAnchor {
  category: string;
  atReference: string;
  atSummary: string;
  ntReferences: string[];
  ntSummary: string;
  connectionType: ConnectionType;
}

export interface BookChristocentricData {
  book: string;
  anchors: ChristocentricAnchor[];
}

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, { label: string; strength: string }> = {
  citacao_direta: { label: "Citação direta / Cumprimento", strength: "forte" },
  alusao: { label: "Alusão", strength: "média" },
  eco_tematico: { label: "Eco temático", strength: "leve" },
};

// MVP: índice curado para Gênesis
export const CHRISTOCENTRIC_INDEX: BookChristocentricData[] = [
  {
    book: "Gênesis",
    anchors: [
      {
        category: "Criação e Palavra",
        atReference: "Gênesis 1:1-3",
        atSummary: "Deus cria tudo pela Palavra. 'Disse Deus: Haja luz' — criação pela ordem falada.",
        ntReferences: ["João 1:1-3", "Colossenses 1:16-17", "Hebreus 1:2"],
        ntSummary: "O Verbo (Logos) é identificado como Cristo, por quem tudo foi feito e em quem tudo subsiste.",
        connectionType: "citacao_direta",
      },
      {
        category: "Queda e Promessa",
        atReference: "Gênesis 3:15",
        atSummary: "Deus promete que a semente da mulher esmagará a cabeça da serpente — o protoevangelium.",
        ntReferences: ["Romanos 16:20", "Gálatas 4:4", "Apocalipse 12:9"],
        ntSummary: "Cristo é a semente que vence Satanás. Nasceu de mulher, cumpriu a promessa de redenção.",
        connectionType: "citacao_direta",
      },
      {
        category: "Cordeiro e Provisão",
        atReference: "Gênesis 22:7-14",
        atSummary: "Abraão responde 'Deus proverá para si o cordeiro'. Isaque é poupado; um carneiro é sacrificado em seu lugar.",
        ntReferences: ["João 1:29", "Hebreus 11:17-19", "1 Pedro 1:19-20"],
        ntSummary: "João Batista aponta para Jesus: 'Eis o Cordeiro de Deus'. Cristo é o sacrifício substitutivo definitivo.",
        connectionType: "citacao_direta",
      },
      {
        category: "Bênção às nações",
        atReference: "Gênesis 12:1-3",
        atSummary: "Deus promete a Abraão: 'em ti serão benditas todas as famílias da terra'.",
        ntReferences: ["Gálatas 3:8-9,16", "Atos 3:25-26"],
        ntSummary: "Paulo identifica a 'descendência' como Cristo. A bênção às nações se cumpre nele.",
        connectionType: "citacao_direta",
      },
      {
        category: "José: sofrimento e exaltação",
        atReference: "Gênesis 37, 39-45",
        atSummary: "José é rejeitado pelos irmãos, vendido, preso injustamente, mas exaltado para salvar muitos.",
        ntReferences: ["Atos 7:9-14", "Filipenses 2:5-11"],
        ntSummary: "O padrão de José espelha Cristo: rejeitado, humilhado, exaltado — 'para conservar muita gente com vida'.",
        connectionType: "alusao",
      },
    ],
  },
  {
    book: "Êxodo",
    anchors: [
      {
        category: "Cordeiro pascal",
        atReference: "Êxodo 12:1-13",
        atSummary: "O sangue do cordeiro sem defeito protege Israel da morte. O cordeiro é sacrificado em substituição.",
        ntReferences: ["1 Coríntios 5:7", "1 Pedro 1:18-19", "João 19:36"],
        ntSummary: "Paulo declara: 'Cristo, nossa páscoa, foi sacrificado por nós'. Nenhum osso dele foi quebrado.",
        connectionType: "citacao_direta",
      },
      {
        category: "Rocha que dá água",
        atReference: "Êxodo 17:1-7",
        atSummary: "Moisés fere a rocha e dela sai água para o povo sedento no deserto.",
        ntReferences: ["1 Coríntios 10:4", "João 7:37-38"],
        ntSummary: "Paulo identifica a rocha como Cristo. Jesus oferece água viva a quem tem sede.",
        connectionType: "citacao_direta",
      },
    ],
  },
  {
    book: "Isaías",
    anchors: [
      {
        category: "Servo sofredor",
        atReference: "Isaías 53:1-12",
        atSummary: "O servo do Senhor é ferido pelas nossas transgressões, moído pelas nossas iniquidades.",
        ntReferences: ["Atos 8:32-35", "1 Pedro 2:24", "Mateus 8:17"],
        ntSummary: "Filipe identifica o servo como Jesus. Pedro cita: 'pelas suas chagas fostes sarados'.",
        connectionType: "citacao_direta",
      },
      {
        category: "Emanuel — Deus conosco",
        atReference: "Isaías 7:14",
        atSummary: "A virgem conceberá e dará à luz um filho chamado Emanuel.",
        ntReferences: ["Mateus 1:22-23"],
        ntSummary: "Mateus cita diretamente Isaías 7:14 como cumprido no nascimento de Jesus.",
        connectionType: "citacao_direta",
      },
    ],
  },
  {
    book: "Salmos",
    anchors: [
      {
        category: "O Bom Pastor",
        atReference: "Salmos 23:1-6",
        atSummary: "O Senhor é o pastor que guia, protege, restaura e prepara mesa na adversidade.",
        ntReferences: ["João 10:11,14", "Hebreus 13:20", "1 Pedro 2:25"],
        ntSummary: "Jesus se declara 'o Bom Pastor que dá a vida pelas ovelhas'.",
        connectionType: "alusao",
      },
      {
        category: "Crucificação profetizada",
        atReference: "Salmos 22:1,16-18",
        atSummary: "'Deus meu, Deus meu, por que me desamparaste?' — cravaram mãos e pés, repartiram vestes.",
        ntReferences: ["Mateus 27:46", "João 19:23-24", "Lucas 23:34"],
        ntSummary: "Jesus cita o Salmo 22 na cruz. Os detalhes se cumprem literalmente na crucificação.",
        connectionType: "citacao_direta",
      },
    ],
  },
];

// Índice de temas emocionais/práticos (MVP)
export const THEME_INDEX: Record<string, string[]> = {
  ansiedade: ["Filipenses 4:6-7", "1 Pedro 5:7", "Salmos 55:22", "Mateus 6:25-34"],
  medo: ["Isaías 41:10", "2 Timóteo 1:7", "Salmos 27:1", "Josué 1:9"],
  perdao: ["Efésios 4:32", "Colossenses 3:13", "Mateus 18:21-22", "Mateus 6:14-15"],
  culpa: ["1 João 1:9", "Romanos 8:1", "Salmos 103:12", "Isaías 1:18"],
  cansaco: ["Mateus 11:28-30", "Isaías 40:31", "Salmos 23:1-3", "2 Coríntios 12:9-10"],
  esperanca: ["Romanos 15:13", "Jeremias 29:11", "Hebreus 6:19", "Salmos 42:5"],
  proposito: ["Efésios 2:10", "Jeremias 29:11", "Romanos 8:28", "Provérbios 19:21"],
  desistir: ["Gálatas 6:9", "Hebreus 12:1-2", "Isaías 40:31", "2 Coríntios 4:16-18"],
  salvacao: ["Efésios 2:8-9", "Romanos 10:9-10", "João 3:16", "Atos 4:12", "Tito 3:5"],
};
