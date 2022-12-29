import Phaser from 'phaser'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI';
import Preloader from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 900,
	height: 450,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false	
		},
	},
	scene: [Preloader, Game, GameUI],
	scale: {
		zoom: 2
	}
}

export default new Phaser.Game(config)
