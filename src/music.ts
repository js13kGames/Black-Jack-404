import * as TinyMusic from '../node_modules/tinymusic/dist/TinyMusic.js';

export class Music {
  bassSequence: TinyMusic.Sequence;
  sequence: TinyMusic.Sequence;
  isPlaying = false;
  constructor() {
    var ac = typeof AudioContext !== 'undefined' ? new AudioContext : (new (<any>window).webkitAudioContext);
    // set the playback tempo (120 beats per minute)
    var tempo = 120;
    // // create some notes ('<Note Name> <Beat Length>')
    // // q = quarter note, h = half note (more on that later)
    const melodyNotes = [
      'B5 e', 'B5 e', 'C6 e', 'D6 h', 'C6 e', 'C6 e', 'B5 q', 'G5 h', '- e', 
      'A5 e', 'A5 e', 'G5 e', 'B5 h', 'F5 e', 'F5 e', 'E5 q', 'G5 h', '- e'
      
    ];
    const bassNotes = [
      'G2 q', '- e', 'G2 e', 'E2 q', '- e', 'E2 e', 'F2 q', '- e', 'E2 e', 'E2 q', 'C2 q',
      'F2 q', '- e', 'F2 e', 'E2 q', '- e', 'E2 e', 'F2 q', '- e', 'E2 e', 'E2 q', 'C2 q',
    ];
    // create a new sequence
    this.sequence = new TinyMusic.Sequence( ac, tempo );
    this.bassSequence = new TinyMusic.Sequence( ac, tempo );
    const sequence = this.sequence;
    const bassSequence = this.bassSequence;
    sequence.createCustomWave([-0.8, 1, 0.8, 0.8, -0.8, -0.8, -1]);
    sequence.staccato = 0.3;
    sequence.smoothing = 0;
    bassSequence.staccato = 0.1;
    bassSequence.smoothing = 0.1;
    sequence.gain.gain.value = 0.03;
    bassSequence.gain.gain.value = 0.03;
  
    // add the notes
    sequence.push( ...melodyNotes );
    bassSequence.push( ...bassNotes );
  
    // disable looping
    sequence.loop = true;
    bassSequence.loop = true;
  }
  playMusic = () => {
    this.sequence.play();
    this.bassSequence.play();
    this.isPlaying = true;
  }
  stopMusic = () => {
    this.sequence.stop();
    this.bassSequence.stop();
    this.isPlaying = false;
  }
  toggleMusic = () => {
    if(this.isPlaying) {
      this.stopMusic();
    } else {
      this.sequence.play();
      this.bassSequence.play();
      this.isPlaying = true;
    }
  }
}