/**
 * Every photograph comes from Unsplash or Pexels, under their licenses, which allow free use
 * without permission. Credits are kept anyway.
 */
export interface PhotoCredit {
  photographer: string;
  source: string;
}

/** Product photographs, keyed by product slug. */
export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  "chanel-no-5-eau-de-parfum": {
    photographer: "Sofía Klimavicius",
    source: "https://images.unsplash.com/photo-1658266844003-1c4ed7bb49a4",
  },
  "chanel-gabrielle-eau-de-parfum": {
    photographer: "Laura Chouette",
    source: "https://images.unsplash.com/photo-1590156221350-bbf9f89cd368",
  },
  "dior-sauvage-eau-de-parfum": {
    photographer: "Farhan Chohan",
    source: "https://images.unsplash.com/photo-1747916148863-7164d8920b57",
  },
  "miss-dior-blooming-bouquet": {
    photographer: "Annie Le",
    source: "https://images.unsplash.com/photo-1678984633768-c4fd5a01732a",
  },
  "dior-jadore-eau-de-parfum": {
    photographer: "Irina Rybcko",
    source: "https://images.unsplash.com/photo-1703161560568-72b2e0e4dd7e",
  },
  "dior-poison-girl": {
    photographer: "Cristina P",
    source: "https://images.unsplash.com/photo-1625207695351-5555c02a4db0",
  },
  "dior-homme-sport": {
    photographer: "Pirvu Alex",
    source: "https://images.unsplash.com/photo-1604588715397-aa9b2fa10fa5",
  },
  "ysl-libre-eau-de-parfum": {
    photographer: "Pavlo Talpa",
    source: "https://images.unsplash.com/photo-1724157073080-fcffb8d6c956",
  },
  "ysl-y-eau-de-parfum": {
    photographer: "One91creative",
    source: "https://images.unsplash.com/photo-1761845047498-56827f416735",
  },
  "gucci-guilty-pour-femme": {
    photographer: "Andrey Ilkevich",
    source: "https://images.unsplash.com/photo-1619007556336-4d99b008471e",
  },
  "gucci-memoire-dune-odeur": {
    photographer: "Anna Keibalo",
    source: "https://images.unsplash.com/photo-1687198193157-7914b3ccdb91",
  },
  "jo-malone-wood-sage-sea-salt": {
    photographer: "Maria Lupan",
    source: "https://images.unsplash.com/photo-1688413580186-fdec38c39553",
  },
  "chanel-rouge-allure": {
    photographer: "Cat Han",
    source: "https://images.unsplash.com/photo-1617229649830-3c949e1fabbe",
  },
  "lancome-labsolu-rouge": {
    photographer: "Amanda Dalbjörn",
    source: "https://images.unsplash.com/photo-1542452255191-c85a98f2c5d1",
  },
  "mac-matte-lipstick": {
    photographer: "Barbara Barbara",
    source: "https://images.unsplash.com/photo-1615967747773-5c9d58c57eef",
  },
  "nars-lipstick": {
    photographer: "Pavlo Talpa",
    source: "https://images.unsplash.com/photo-1729016723287-30f88a7fc59a",
  },
  "nars-radiant-creamy-concealer": {
    photographer: "Karly Jones",
    source: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc",
  },
  "nars-eyeshadow-palette": {
    photographer: "siyan li",
    source: "https://images.unsplash.com/photo-1583280157557-63caa755ba13",
  },
  "estee-lauder-double-wear": {
    photographer: "Denisa-Elena Ficau",
    source: "https://images.unsplash.com/photo-1776015036380-4022fe844ed8",
  },
  "dior-backstage-face-body-foundation": {
    photographer: "Mercy",
    source: "https://images.unsplash.com/photo-1577036251102-9cf1285e487a",
  },
  "dior-forever-foundation": {
    photographer: "Hitesh Dewasi",
    source: "https://images.unsplash.com/photo-1599733589046-10c005739ef9",
  },
  "armani-luminous-silk-foundation": {
    photographer: "Karly Jones",
    source: "https://images.unsplash.com/photo-1557205465-f3762edea6d3",
  },
  "abh-modern-renaissance-palette": {
    photographer: "Paola Aguilar",
    source: "https://images.unsplash.com/photo-1547934659-7fa699ef3ce0",
  },
  "maybelline-the-city-mini-palette": {
    photographer: "Andrey Ilkevich",
    source: "https://images.unsplash.com/photo-1748408361384-11446ba79316",
  },
  "too-faced-better-than-sex-mascara": {
    photographer: "Annie Spratt",
    source: "https://images.unsplash.com/photo-1512207159096-c2c91b1dfadd",
  },
  "glossier-cloud-paint": {
    photographer: "Reuben Mansell",
    source: "https://images.unsplash.com/photo-1629198702514-dbb6bc305224",
  },
  "the-ordinary-hyaluronic-acid-2-b5": {
    photographer: "Isaac Wolff",
    source: "https://images.unsplash.com/photo-1715027155125-810cb995203f",
  },
  "the-ordinary-salicylic-acid-2": {
    photographer: "soroush chr",
    source: "https://images.unsplash.com/photo-1719132881586-9f54b7016f4c",
  },
  "the-ordinary-aha-30-bha-2-peeling-solution": {
    photographer: "Okan You",
    source: "https://images.unsplash.com/photo-1582103645388-b85304592cb0",
  },
  "glossier-milky-jelly-cleanser": {
    photographer: "Reuben Mansell",
    source: "https://images.unsplash.com/photo-1629198726018-604230bdb091",
  },
  "glossier-invisible-shield-spf-35": {
    photographer: "Reuben Mansell",
    source: "https://images.unsplash.com/photo-1629198716082-b92910910a59",
  },
  "glossier-solution": {
    photographer: "Reuben Mansell",
    source: "https://images.unsplash.com/photo-1629198735660-e39ea93f5c18",
  },
  "la-roche-posay-effaclar-mat": {
    photographer: "Cosmin Ursea",
    source: "https://images.unsplash.com/photo-1641130290711-01c4c4558562",
  },
  "la-roche-posay-lipikar-baume-ap": {
    photographer: "Polina Zimenkova",
    source: "https://images.unsplash.com/photo-1680461494862-754e01607c83",
  },
  "uriage-eau-thermale-water-cream": {
    photographer: "Isaac Wolff",
    source: "https://images.unsplash.com/photo-1708642448328-37631ca58d65",
  },
  "olaplex-no-6-bond-smoother": {
    photographer: "Shayna Douglas",
    source: "https://images.unsplash.com/photo-1642005801149-b33da87c1175",
  },
  "olaplex-no-7-bonding-oil": {
    photographer: "Deniz Gezer",
    source: "https://www.pexels.com/photo/27685223/",
  },
  "gisou-honey-infused-hair-wash": {
    photographer: "Roselene de Koning",
    source: "https://www.pexels.com/photo/30696654/",
  },
  "loreal-professionnel-liss-unlimited-shampoo": {
    photographer: "Viktorya Sergeeva",
    source: "https://www.pexels.com/photo/14267487/",
  },
  "keune-care-absolute-volume-shampoo": {
    photographer: "Natallia",
    source: "https://www.pexels.com/photo/13573922/",
  },
  "keune-care-satin-oil-conditioner": {
    photographer: "Natallia Photo",
    source: "https://images.unsplash.com/photo-1686121544157-6f178a23d584",
  },
  "kevin-murphy-angel-wash": {
    photographer: "Nick Scott",
    source: "https://images.unsplash.com/photo-1601070846144-6be3aad73f7b",
  },
  "aveda-flax-seed-aloe-sculpturing-gel": {
    photographer: "Kevin Sicher",
    source: "https://images.unsplash.com/photo-1734892494503-775c358c69b5",
  },
  "aveda-men-pure-formance-grooming-clay": {
    photographer: "Kevin Sicher",
    source: "https://images.unsplash.com/photo-1734892498467-9344ffc6917b",
  },
  "clinique-smart-clinical-repair-eye-cream": {
    photographer: "Theodora Ispas",
    source: "https://images.unsplash.com/photo-1687160897014-bdc8b8160815",
  },
  "kiehls-midnight-recovery-concentrate": {
    photographer: "Camille Brodard",
    source: "https://images.unsplash.com/photo-1623248509111-0bbf620a0af6",
  },
  "kiehls-calendula-water-cream": {
    photographer: "Delfina Iacub",
    source: "https://images.unsplash.com/photo-1599406953566-59bb9db6b2d0",
  },
  "cetaphil-gentle-skin-cleanser": {
    photographer: "sarah b",
    source: "https://images.unsplash.com/photo-1643747238009-6863ea63e78d",
  },
  "fenty-beauty-gloss-bomb-cream": {
    photographer: "Devon Vereen",
    source: "https://images.unsplash.com/photo-1640317372997-b76e600ee5ef",
  },
  "charlotte-tilbury-airbrush-flawless-foundation": {
    photographer: "Karly Jones",
    source: "https://images.unsplash.com/photo-1632038559953-abd80bed8966",
  },
  "rouge-dior-lipstick": {
    photographer: "Anna Keibalo",
    source: "https://images.unsplash.com/photo-1692306650906-5c475bf1e663",
  },
  "ysl-rouge-pur-couture": {
    photographer: "Nada Gamal",
    source: "https://images.unsplash.com/photo-1587313512268-a3b47aa30166",
  },
  "kiehls-original-musk": {
    photographer: "0xk",
    source: "https://images.unsplash.com/photo-1622373225827-a74a2e5dd4b7",
  },
  "le-labo-santal-33": {
    photographer: "Marie G.",
    source: "https://images.unsplash.com/photo-1635847421955-db26af776e5d",
  },
  "le-labo-tonka-25": {
    photographer: "Cosmin Ursea",
    source: "https://images.unsplash.com/photo-1638777734006-b680454ae5da",
  },
  "le-labo-baie-19": {
    photographer: "Filip Baotić",
    source: "https://images.unsplash.com/photo-1726135943496-cd61574f281f",
  },
  "byredo-gypsy-water": {
    photographer: "Harper Sunday",
    source: "https://images.unsplash.com/photo-1680789527322-eab29923811a",
  },
  "tom-ford-ombre-leather": {
    photographer: "Alfred Guzman",
    source: "https://images.unsplash.com/photo-1654617058572-f1f473581778",
  },
  "jo-malone-nectarine-blossom-honey": {
    photographer: "charlesdeluvio",
    source: "https://images.unsplash.com/photo-1519669011783-4eaa95fa1b7d",
  },
};
