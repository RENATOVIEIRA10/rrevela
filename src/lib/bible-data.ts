// Bible data - Almeida Revista e Corrigida (domínio público)
// Initial structure with Genesis 1 as sample data

export interface BibleBook {
  name: string;
  chapters: number;
  testament: "VT" | "NT";
}

export interface Verse {
  number: number;
  text: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Velho Testamento
  { name: "Gênesis", chapters: 50, testament: "VT" },
  { name: "Êxodo", chapters: 40, testament: "VT" },
  { name: "Levítico", chapters: 27, testament: "VT" },
  { name: "Números", chapters: 36, testament: "VT" },
  { name: "Deuteronômio", chapters: 34, testament: "VT" },
  { name: "Josué", chapters: 24, testament: "VT" },
  { name: "Juízes", chapters: 21, testament: "VT" },
  { name: "Rute", chapters: 4, testament: "VT" },
  { name: "1 Samuel", chapters: 31, testament: "VT" },
  { name: "2 Samuel", chapters: 24, testament: "VT" },
  { name: "1 Reis", chapters: 22, testament: "VT" },
  { name: "2 Reis", chapters: 25, testament: "VT" },
  { name: "1 Crônicas", chapters: 29, testament: "VT" },
  { name: "2 Crônicas", chapters: 36, testament: "VT" },
  { name: "Esdras", chapters: 10, testament: "VT" },
  { name: "Neemias", chapters: 13, testament: "VT" },
  { name: "Ester", chapters: 10, testament: "VT" },
  { name: "Jó", chapters: 42, testament: "VT" },
  { name: "Salmos", chapters: 150, testament: "VT" },
  { name: "Provérbios", chapters: 31, testament: "VT" },
  { name: "Eclesiastes", chapters: 12, testament: "VT" },
  { name: "Cantares", chapters: 8, testament: "VT" },
  { name: "Isaías", chapters: 66, testament: "VT" },
  { name: "Jeremias", chapters: 52, testament: "VT" },
  { name: "Lamentações", chapters: 5, testament: "VT" },
  { name: "Ezequiel", chapters: 48, testament: "VT" },
  { name: "Daniel", chapters: 12, testament: "VT" },
  { name: "Oséias", chapters: 14, testament: "VT" },
  { name: "Joel", chapters: 3, testament: "VT" },
  { name: "Amós", chapters: 9, testament: "VT" },
  { name: "Obadias", chapters: 1, testament: "VT" },
  { name: "Jonas", chapters: 4, testament: "VT" },
  { name: "Miquéias", chapters: 7, testament: "VT" },
  { name: "Naum", chapters: 3, testament: "VT" },
  { name: "Habacuque", chapters: 3, testament: "VT" },
  { name: "Sofonias", chapters: 3, testament: "VT" },
  { name: "Ageu", chapters: 2, testament: "VT" },
  { name: "Zacarias", chapters: 14, testament: "VT" },
  { name: "Malaquias", chapters: 4, testament: "VT" },
  // Novo Testamento
  { name: "Mateus", chapters: 28, testament: "NT" },
  { name: "Marcos", chapters: 16, testament: "NT" },
  { name: "Lucas", chapters: 24, testament: "NT" },
  { name: "João", chapters: 21, testament: "NT" },
  { name: "Atos", chapters: 28, testament: "NT" },
  { name: "Romanos", chapters: 16, testament: "NT" },
  { name: "1 Coríntios", chapters: 16, testament: "NT" },
  { name: "2 Coríntios", chapters: 13, testament: "NT" },
  { name: "Gálatas", chapters: 6, testament: "NT" },
  { name: "Efésios", chapters: 6, testament: "NT" },
  { name: "Filipenses", chapters: 4, testament: "NT" },
  { name: "Colossenses", chapters: 4, testament: "NT" },
  { name: "1 Tessalonicenses", chapters: 5, testament: "NT" },
  { name: "2 Tessalonicenses", chapters: 3, testament: "NT" },
  { name: "1 Timóteo", chapters: 6, testament: "NT" },
  { name: "2 Timóteo", chapters: 4, testament: "NT" },
  { name: "Tito", chapters: 3, testament: "NT" },
  { name: "Filemom", chapters: 1, testament: "NT" },
  { name: "Hebreus", chapters: 13, testament: "NT" },
  { name: "Tiago", chapters: 5, testament: "NT" },
  { name: "1 Pedro", chapters: 5, testament: "NT" },
  { name: "2 Pedro", chapters: 3, testament: "NT" },
  { name: "1 João", chapters: 5, testament: "NT" },
  { name: "2 João", chapters: 1, testament: "NT" },
  { name: "3 João", chapters: 1, testament: "NT" },
  { name: "Judas", chapters: 1, testament: "NT" },
  { name: "Apocalipse", chapters: 22, testament: "NT" },
];

// Sample verses for Genesis 1 (Almeida RC)
const GENESIS_1: Verse[] = [
  { number: 1, text: "No princípio criou Deus os céus e a terra." },
  { number: 2, text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." },
  { number: 3, text: "E disse Deus: Haja luz. E houve luz." },
  { number: 4, text: "E viu Deus que a luz era boa; e fez Deus separação entre a luz e as trevas." },
  { number: 5, text: "E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro." },
  { number: 6, text: "E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas." },
  { number: 7, text: "E fez Deus a expansão e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão. E assim foi." },
  { number: 8, text: "E chamou Deus à expansão Céus; e foi a tarde e a manhã, o dia segundo." },
  { number: 9, text: "E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca. E assim foi." },
  { number: 10, text: "E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares. E viu Deus que era bom." },
  { number: 11, text: "E disse Deus: Produza a terra erva verde, erva que dê semente, árvore frutífera que dê fruto segundo a sua espécie, cuja semente esteja nela sobre a terra. E assim foi." },
  { number: 12, text: "E a terra produziu erva, erva dando semente conforme a sua espécie e árvore frutífera, cuja semente está nela conforme a sua espécie. E viu Deus que era bom." },
  { number: 13, text: "E foi a tarde e a manhã, o dia terceiro." },
  { number: 14, text: "E disse Deus: Haja luminares na expansão dos céus, para haver separação entre o dia e a noite; e sejam eles para sinais e para tempos determinados e para dias e anos." },
  { number: 15, text: "E sejam para luminares na expansão dos céus, para alumiar a terra. E assim foi." },
  { number: 16, text: "E fez Deus os dois grandes luminares: o luminar maior para governar o dia e o luminar menor para governar a noite; e fez as estrelas." },
  { number: 17, text: "E Deus os pôs na expansão dos céus para alumiar a terra," },
  { number: 18, text: "e para governar o dia e a noite, e para fazer separação entre a luz e as trevas. E viu Deus que era bom." },
  { number: 19, text: "E foi a tarde e a manhã, o dia quarto." },
  { number: 20, text: "E disse Deus: Produzam as águas abundantemente répteis de alma vivente; e voem as aves sobre a face da expansão dos céus." },
  { number: 21, text: "E Deus criou as grandes baleias, e todo réptil de alma vivente que as águas abundantemente produziram conforme as suas espécies, e toda ave de asas conforme a sua espécie. E viu Deus que era bom." },
  { number: 22, text: "E Deus os abençoou, dizendo: Frutificai, e multiplicai-vos, e enchei as águas nos mares; e as aves se multipliquem na terra." },
  { number: 23, text: "E foi a tarde e a manhã, o dia quinto." },
  { number: 24, text: "E disse Deus: Produza a terra alma vivente conforme a sua espécie; gado, e répteis, e bestas-feras da terra conforme a sua espécie. E assim foi." },
  { number: 25, text: "E fez Deus as bestas-feras da terra conforme a sua espécie, e o gado conforme a sua espécie, e todo o réptil da terra conforme a sua espécie. E viu Deus que era bom." },
  { number: 26, text: "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra, e sobre todo réptil que se move sobre a terra." },
  { number: 27, text: "E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou." },
  { number: 28, text: "E Deus os abençoou e Deus lhes disse: Frutificai, e multiplicai-vos, e enchei a terra, e sujeitai-a; e dominai sobre os peixes do mar, e sobre as aves dos céus, e sobre todo o animal que se move sobre a terra." },
  { number: 29, text: "E disse Deus: Eis que vos tenho dado toda erva que dá semente e que está sobre a face de toda a terra e toda árvore em que há fruto que dá semente; ser-vos-ão para mantimento." },
  { number: 30, text: "E a todo animal da terra, e a toda ave dos céus, e a todo réptil da terra, em que há alma vivente, toda a erva verde lhes será para mantimento. E assim foi." },
  { number: 31, text: "E viu Deus tudo quanto tinha feito, e eis que era muito bom. E foi a tarde e a manhã, o dia sexto." },
];

// João 1 sample
const JOAO_1: Verse[] = [
  { number: 1, text: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
  { number: 2, text: "Ele estava no princípio com Deus." },
  { number: 3, text: "Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez." },
  { number: 4, text: "Nele estava a vida, e a vida era a luz dos homens." },
  { number: 5, text: "E a luz resplandece nas trevas, e as trevas não a compreenderam." },
  { number: 6, text: "Houve um homem enviado de Deus, cujo nome era João." },
  { number: 7, text: "Este veio para testemunho para que testificasse da luz, para que todos cressem por ele." },
  { number: 8, text: "Não era ele a luz, mas veio para que testificasse da luz." },
  { number: 9, text: "Ali estava a luz verdadeira, que alumia a todo homem que vem ao mundo." },
  { number: 10, text: "Estava no mundo, e o mundo foi feito por ele e o mundo não o conheceu." },
  { number: 11, text: "Veio para o que era seu, e os seus não o receberam." },
  { number: 12, text: "Mas a todos quantos o receberam deu-lhes o poder de serem feitos filhos de Deus: aos que creem no seu nome," },
  { number: 13, text: "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do varão, mas de Deus." },
  { number: 14, text: "E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, como a glória do Unigênito do Pai, cheio de graça e de verdade." },
];

// Salmo 23
const SALMO_23: Verse[] = [
  { number: 1, text: "O Senhor é o meu pastor; nada me faltará." },
  { number: 2, text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
  { number: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome." },
  { number: 4, text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam." },
  { number: 5, text: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda." },
  { number: 6, text: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na Casa do Senhor por longos dias." },
];

export function getChapterVerses(book: string, chapter: number): Verse[] {
  if (book === "Gênesis" && chapter === 1) return GENESIS_1;
  if (book === "João" && chapter === 1) return JOAO_1;
  if (book === "Salmos" && chapter === 23) return SALMO_23;

  // Generate placeholder verses for other chapters
  const count = Math.floor(Math.random() * 15) + 10;
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    text: "Este versículo será carregado quando a Bíblia completa estiver disponível.",
  }));
}
