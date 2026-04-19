export type Phonic = {
  id: string;
  letter: string;
  sound: string;
  example_word: string;
  color: string;
};

export type Word = {
  id: string;
  word: string;
  meaning: string;
  emoji: string;
  category: string;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  emoji: string;
};
