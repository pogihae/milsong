/**
 * Benchmark Case File for the Recommendation Algorithm
 * 
 * Used to test whether the algorithm correctly captures the true "mega hits"
 * of a given era without being unfairly overshadowed by the Golden Window bias.
 */

export interface KnownEra {
  enlistmentDate: string;
  expectedRepresentativeSongs: string[]; // Song titles that are expected to rank high or win
  description: string;
}

export const KNOWN_ERAS: KnownEra[] = [
  {
    enlistmentDate: '2009-02-15',
    expectedRepresentativeSongs: ['Gee'],
    description: 'Gee was a massive hit since Jan 2009. Should dominate despite its D-40ish release date.',
  },
  {
    enlistmentDate: '2007-11-20',
    expectedRepresentativeSongs: ['Tell Me'],
    description: 'Tell Me syndrome peak. Should easily beat any Golden Window contenders.',
  },
  {
    enlistmentDate: '2008-11-01',
    expectedRepresentativeSongs: ['Mirotic', 'Nobody'],
    description: 'Legendary Q4 2008 hit battle.',
  },
  {
    enlistmentDate: '2016-06-15',
    expectedRepresentativeSongs: ['CHEER UP'],
    description: 'CHEER UP released in late April but dominated the entire summer.',
  },
  {
    enlistmentDate: '2015-08-01',
    expectedRepresentativeSongs: ['뱅뱅뱅 (BANG BANG BANG)', 'SHAKE IT'],
    description: 'Big Bang vs Sistar summer battle. Bronze/Silver window 롱런곡 (long-running).',
  },
  {
    enlistmentDate: '2018-03-01',
    expectedRepresentativeSongs: ['사랑을 했다 (Love Scenario)'],
    description: 'Released late Jan, charted #1 for weeks. Perfect test for Chart Dominance.',
  },
  {
    enlistmentDate: '2020-10-15',
    expectedRepresentativeSongs: ['Dynamite'],
    description: 'Released late Aug, extreme long-run across all charts.',
  },
  {
    enlistmentDate: '2023-03-01',
    expectedRepresentativeSongs: ['Ditto', 'OMG', 'Hype Boy'],
    description: 'Winter/Spring 2023 NewJeans domination. Ditto was D-70+ but stayed #1.',
  },
  {
    enlistmentDate: '2013-08-20',
    expectedRepresentativeSongs: ['으르렁 (Growl)'],
    description: 'Massive male idol hit that should not be heavily penalized by lack of female dance multiplier.',
  },
  {
    enlistmentDate: '2014-04-15',
    expectedRepresentativeSongs: ['썸 (Some)'],
    description: 'A mega-hit collaboration that had massive Chart Dominance.',
  }
];
