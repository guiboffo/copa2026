export const GROUPS_LIST = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export const TEAMS = {
  "México":{code:"mx",emoji:"🇲🇽",short:"México"},
  "África do Sul":{code:"za",emoji:"🇿🇦",short:"Áfr. Sul"},
  "Coreia do Sul":{code:"kr",emoji:"🇰🇷",short:"Coreia S."},
  "Rep. Tcheca":{code:"cz",emoji:"🇨🇿",short:"R. Tcheca"},
  "Canadá":{code:"ca",emoji:"🇨🇦",short:"Canadá"},
  "Bósnia e Herz.":{code:"ba",emoji:"🇧🇦",short:"Bósnia"},
  "Catar":{code:"qa",emoji:"🇶🇦",short:"Catar"},
  "Suíça":{code:"ch",emoji:"🇨🇭",short:"Suíça"},
  "Brasil":{code:"br",emoji:"🇧🇷",short:"Brasil"},
  "Marrocos":{code:"ma",emoji:"🇲🇦",short:"Marrocos"},
  "Haiti":{code:"ht",emoji:"🇭🇹",short:"Haiti"},
  "Escócia":{code:"gb-sct",emoji:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",short:"Escócia"},
  "Estados Unidos":{code:"us",emoji:"🇺🇸",short:"EUA"},
  "Paraguai":{code:"py",emoji:"🇵🇾",short:"Paraguai"},
  "Austrália":{code:"au",emoji:"🇦🇺",short:"Austrália"},
  "Turquia":{code:"tr",emoji:"🇹🇷",short:"Turquia"},
  "Alemanha":{code:"de",emoji:"🇩🇪",short:"Alemanha"},
  "Curaçau":{code:"cw",emoji:"🇨🇼",short:"Curaçau"},
  "Costa do Marfim":{code:"ci",emoji:"🇨🇮",short:"C. Marfim"},
  "Equador":{code:"ec",emoji:"🇪🇨",short:"Equador"},
  "Holanda":{code:"nl",emoji:"🇳🇱",short:"Holanda"},
  "Japão":{code:"jp",emoji:"🇯🇵",short:"Japão"},
  "Suécia":{code:"se",emoji:"🇸🇪",short:"Suécia"},
  "Tunísia":{code:"tn",emoji:"🇹🇳",short:"Tunísia"},
  "Bélgica":{code:"be",emoji:"🇧🇪",short:"Bélgica"},
  "Egito":{code:"eg",emoji:"🇪🇬",short:"Egito"},
  "Irã":{code:"ir",emoji:"🇮🇷",short:"Irã"},
  "Nova Zelândia":{code:"nz",emoji:"🇳🇿",short:"N. Zelândia"},
  "Espanha":{code:"es",emoji:"🇪🇸",short:"Espanha"},
  "Cabo Verde":{code:"cv",emoji:"🇨🇻",short:"C. Verde"},
  "Arábia Saudita":{code:"sa",emoji:"🇸🇦",short:"A. Saudita"},
  "Uruguai":{code:"uy",emoji:"🇺🇾",short:"Uruguai"},
  "França":{code:"fr",emoji:"🇫🇷",short:"França"},
  "Senegal":{code:"sn",emoji:"🇸🇳",short:"Senegal"},
  "Iraque":{code:"iq",emoji:"🇮🇶",short:"Iraque"},
  "Noruega":{code:"no",emoji:"🇳🇴",short:"Noruega"},
  "Argentina":{code:"ar",emoji:"🇦🇷",short:"Argentina"},
  "Argélia":{code:"dz",emoji:"🇩🇿",short:"Argélia"},
  "Áustria":{code:"at",emoji:"🇦🇹",short:"Áustria"},
  "Jordânia":{code:"jo",emoji:"🇯🇴",short:"Jordânia"},
  "Portugal":{code:"pt",emoji:"🇵🇹",short:"Portugal"},
  "RD Congo":{code:"cd",emoji:"🇨🇩",short:"RD Congo"},
  "Uzbequistão":{code:"uz",emoji:"🇺🇿",short:"Uzbequist."},
  "Colômbia":{code:"co",emoji:"🇨🇴",short:"Colômbia"},
  "Inglaterra":{code:"gb-eng",emoji:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",short:"Inglaterra"},
  "Croácia":{code:"hr",emoji:"🇭🇷",short:"Croácia"},
  "Gana":{code:"gh",emoji:"🇬🇭",short:"Gana"},
  "Panamá":{code:"pa",emoji:"🇵🇦",short:"Panamá"},
};

export const GROUP_TEAMS = {
  A:["México","África do Sul","Coreia do Sul","Rep. Tcheca"],
  B:["Canadá","Bósnia e Herz.","Catar","Suíça"],
  C:["Brasil","Marrocos","Haiti","Escócia"],
  D:["Estados Unidos","Paraguai","Austrália","Turquia"],
  E:["Alemanha","Curaçau","Costa do Marfim","Equador"],
  F:["Holanda","Japão","Suécia","Tunísia"],
  G:["Bélgica","Egito","Irã","Nova Zelândia"],
  H:["Espanha","Cabo Verde","Arábia Saudita","Uruguai"],
  I:["França","Senegal","Iraque","Noruega"],
  J:["Argentina","Argélia","Áustria","Jordânia"],
  K:["Portugal","RD Congo","Uzbequistão","Colômbia"],
  L:["Inglaterra","Croácia","Gana","Panamá"],
};

export const FIFA_RANKING = {
  "Espanha":1,"Argentina":2,"França":3,"Inglaterra":4,"Brasil":5,
  "Portugal":6,"Holanda":7,"Bélgica":8,"Alemanha":9,"Croácia":10,
  "Marrocos":11,"Colômbia":13,"Estados Unidos":14,"México":15,
  "Uruguai":16,"Suíça":17,"Japão":18,"Senegal":19,"Irã":20,
};

export const flagUrl = (name) => {
  const t = TEAMS[name];
  return t ? `https://flagcdn.com/w40/${t.code}.png` : null;
};

export const teamName = (name, isDesk) => {
  if (isDesk || !name) return name;
  const t = TEAMS[name];
  return t?.short || name;
};

export const isRanked = (team) => team && FIFA_RANKING[team] != null;
export const isBigMatch = (h, a) => isRanked(h) && isRanked(a);
export const isBrazilMatch = (h, a) => h === "Brasil" || a === "Brasil";
