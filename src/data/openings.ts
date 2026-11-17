export interface OpeningEntry {
  eco: string;
  name: string;
  description: string;
  moves: string;
}

export const OPENINGS: OpeningEntry[] = [
  { eco: 'A04', name: 'Zukertort Opening', description: 'A flexible flank opening that delays central commitment with Nf3.', moves: 'Nf3' },
  { eco: 'A09', name: 'Reti Opening', description: 'White fianchettoes the queen-side pressure with c4 after Nf3 and d5.', moves: 'Nf3 d5 c4' },
  { eco: 'A10', name: 'English Opening', description: 'A flexible flank opening that fights for the center from the side.', moves: 'c4' },
  { eco: 'A80', name: 'Dutch Defense', description: 'Black plays f5 to fight for the e4 square and create kingside play.', moves: 'd4 f5' },
  { eco: 'B01', name: 'Scandinavian Defense', description: 'Black immediately challenges the center with d5.', moves: 'e4 d5' },
  { eco: 'B02', name: "Alekhine's Defense", description: 'Black invites White pawns forward, aiming to undermine them later.', moves: 'e4 Nf6' },
  { eco: 'B06', name: 'Modern Defense', description: 'Black delays central contact and prepares a bishop on the long diagonal.', moves: 'e4 g6' },
  { eco: 'B07', name: 'Pirc Defense', description: 'A hypermodern defense where Black lets White build a center to attack it.', moves: 'e4 d6 d4 Nf6 Nc3 g6' },
  { eco: 'B10', name: 'Caro-Kann Defense', description: 'A solid defense that prepares d5 with a sturdy pawn structure.', moves: 'e4 c6' },
  { eco: 'B20', name: 'Sicilian Defense', description: 'Black contests the center asymmetrically with c5 for counterplay.', moves: 'e4 c5' },
  { eco: 'B90', name: 'Sicilian Defense: Najdorf Variation', description: 'A sharp Sicilian line where Black keeps flexible options with a6.', moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6' },
  { eco: 'C00', name: 'French Defense', description: 'Black builds a solid pawn chain with e6 and counterattacks on the queen side.', moves: 'e4 e6' },
  { eco: 'C25', name: 'Vienna Game', description: 'White develops the knight early to prepare f4 and a kingside attack.', moves: 'e4 e5 Nc3' },
  { eco: 'C33', name: "King's Gambit Accepted", description: 'White offers a pawn with f4 to open lines toward the Black king.', moves: 'e4 e5 f4 exf4' },
  { eco: 'C42', name: "Petrov's Defense", description: 'A symmetrical and solid reply that mirrors White development.', moves: 'e4 e5 Nf3 Nf6' },
  { eco: 'C45', name: 'Scotch Game', description: 'White opens the center immediately with d4 for active piece play.', moves: 'e4 e5 Nf3 Nc6 d4' },
  { eco: 'C50', name: 'Italian Game', description: 'A classical opening that develops the bishop toward the f7 weak point.', moves: 'e4 e5 Nf3 Nc6 Bc4' },
  { eco: 'C60', name: 'Ruy Lopez', description: 'A long-standing classic that pressures the defender of the e5 pawn.', moves: 'e4 e5 Nf3 Nc6 Bb5' },
  { eco: 'D02', name: 'London System', description: 'A system opening with Bf4 and a solid setup that is easy to learn.', moves: 'd4 d5 Nf3 Nf6 Bf4' },
  { eco: 'D06', name: "Queen's Gambit", description: 'White offers the c-pawn to gain central control with c4.', moves: 'd4 d5 c4' },
  { eco: 'D10', name: 'Slav Defense', description: 'Black supports d5 with c6 for a rock-solid central structure.', moves: 'd4 d5 c4 c6' },
  { eco: 'D30', name: "Queen's Gambit Declined", description: 'Black holds the center with e6 and keeps the position compact.', moves: 'd4 d5 c4 e6 Nc3 Nf6' },
  { eco: 'D80', name: 'Grunfeld Defense', description: 'Black allows a big White center and then strikes it with d5.', moves: 'd4 Nf6 c4 g6 Nc3 d5' },
  { eco: 'E00', name: 'Catalan Opening', description: 'A fianchetto setup that gives White long-term pressure on the diagonal.', moves: 'd4 Nf6 c4 e6 g3' },
  { eco: 'E12', name: "Queen's Indian Defense", description: 'Black fianchettoes the queen-side bishop to contest the long diagonal.', moves: 'd4 Nf6 c4 e6 Nf3 b6' },
  { eco: 'E20', name: 'Nimzo-Indian Defense', description: 'Black pins the knight with Bb4 to disturb White center control.', moves: 'd4 Nf6 c4 e6 Nc3 Bb4' },
  { eco: 'E60', name: "King's Indian Defense", description: 'Black lets White occupy the center and attacks it with a kingside fianchetto.', moves: 'd4 Nf6 c4 g6 Nc3 Bg7' },
];
