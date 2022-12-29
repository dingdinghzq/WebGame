import Phaser, { GameObjects } from 'phaser'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import Lizard from '../enermies/lizard'
import '../characters/faune'
import Faune from '../characters/faune'
import { sceneEvents } from '../events/EventCenter'
import { debugDraw } from '../utils/debug'
import { createChestAnims } from '../anims/ItemAnims'
import Chest from '../items/chest'

export default class Game extends Phaser.Scene {
	constructor() {
		super('game')
	}

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
	private collider?: Phaser.Physics.Arcade.Collider
	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group

	preload() {
		this.cursors = this.input.keyboard.createCursorKeys();

	}

	create() {
		this.scene.run('game-ui')

		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)
		createChestAnims(this.anims)

		const map = this.make.tilemap({key:'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2)

		map.createLayer('Ground', tileset)

		this.knives = this.physics.add.group(
			{
				classType: Phaser.Physics.Arcade.Image
			}
		)

	    const wallsLayer =  map.createLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		//debugDraw(wallsLayer, this)

		const chestGroup = this.physics.add.staticGroup(
			{
				classType:Chest
			}
		)

		const chestLayer = map.getObjectLayer('chests')
		chestLayer.objects.forEach(chest=>
			{
				chestGroup.get(chest.x! + chest.width! * 0.5, chest.y! - chest.height! * 0.5, 'treasure')

			})

		this.faune = this.add.faune(128, 128, 'faune')
		this.faune.setKnives(this.knives)
		
		this.physics.add.collider(this.faune, wallsLayer)
		this.cameras.main.startFollow(this.faune, true)

		this.lizards = this.physics.add.group(
			{
				classType: Lizard,	
				createCallback: (go)=>
				{
					const lizGo = go as Lizard
					lizGo.body.onCollide = true;
					lizGo.setFaune(this.faune)
				}
			}
		)

		for (let n=0; n<3; n++ )
		{
			this.lizards.get(Phaser.Math.Between(50, 500), Phaser.Math.Between(50, 400), 'lizard-'+n);
		}

		this.physics.add.collider(this.lizards, wallsLayer)
		this.collider = this.physics.add.collider(this.lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
		this.physics.add.collider(this.knives, wallsLayer, this.handleKnivesWallCollision, undefined, this)
		this.physics.add.collider(this.knives, this.lizards, this.handleKnivesLizardCollision, undefined, this)
		this.physics.add.collider(this.faune, chestGroup, this.handleFauneChestCollision, undefined, this)
		this.physics.add.collider(this.lizards, chestGroup, this.handleLizardChestCollide, undefined, this)

	}

	private handleFauneChestCollision(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		const chest = obj2 as Chest
		this.faune.setActiveChest(chest)
	}

	private handleLizardChestCollide(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		const lizard = obj1 as Lizard
		lizard.setNewRandomDirection()
	}

	private handleKnivesWallCollision(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		const knife = obj1 as Phaser.Physics.Arcade.Image
		this.knives.killAndHide(knife)
	}

	private handleKnivesLizardCollision(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		this.knives.killAndHide(obj1)
		this.lizards.killAndHide(obj2)
	}

	private handlePlayerLizardCollision(obj1: GameObjects.GameObject, obj2: GameObjects.GameObject)
	{
		const lizard = obj2 as Lizard

		const dx = this.faune.x - lizard.x
		const dy =  this.faune.y - lizard.y

		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(300)

		this.faune.handleDamage(dir)
		sceneEvents.emit('player-health-changed', this.faune.health)

		if (this.faune.health <=0)
		{
			this.collider?.destroy()
			this.collider = undefined
		}

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
