import Phaser, { GameObjects } from 'phaser'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import Lizard from '../enermies/lizard'
import '../characters/faune'
import Faune from '../characters/faune'
import { sceneEvents } from '../events/EventCenter'
import { debugDraw } from '../utils/debug'

export default class Game extends Phaser.Scene {
	constructor() {
		super('game')
	}

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune

	preload() {
		this.cursors = this.input.keyboard.createCursorKeys();

	}

	create() {
		this.scene.run('game-ui')
		const map = this.make.tilemap({key:'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2)

		map.createLayer('Ground', tileset)
	    const wallsLayer =  map.createLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		//debugDraw(wallsLayer, this)

		this.faune = this.add.faune(128, 128, 'faune')
		
		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)


		this.physics.add.collider(this.faune, wallsLayer)
		this.cameras.main.startFollow(this.faune, true)

		const lizards = this.physics.add.group(
			{
				classType: Lizard,	
				createCallback: (go)=>
				{
					const lizGo = go as Lizard
					lizGo.body.onCollide = true;
				}
			}
		)

		for (let n=0; n<20; n++ )
		{
			lizards.get(Phaser.Math.Between(50, 500), Phaser.Math.Between(50, 300), 'lizard-'+n);
		}

		this.physics.add.collider(lizards, wallsLayer)
		this.physics.add.collider(lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
		

	}
	private handlePlayerLizardCollision(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		const lizard = obj2 as Lizard

		const dx = this.faune.x - lizard.x
		const dy =  this.faune.y - lizard.y

		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(300)

		this.faune.handleDamage(dir)
		sceneEvents.emit('player-health-changed', this.faune.health)

	}

	update(t: number, dt:number)
	{
		if (this.faune)
		{
			this.faune.update(this.cursors)
			return;
		}
	}
}
