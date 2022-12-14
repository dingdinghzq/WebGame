import Phaser, { GameObjects } from "phaser";
import { sceneEvents } from "../events/EventCenter";
import Chest from "../items/chest";

declare global
{
    namespace Phaser.GameObjects
    {
        interface GameObjectFactory
        {
            faune(x: number, y:number, texture: string, frame?: string|number) : Faune;
        }
    }
}

const enum HealthState
{
    IDLE,
    DAMAGE,
    DEAD

}

export default class Faune extends Phaser.Physics.Arcade.Sprite
{
    private healthState = HealthState.IDLE;
    private damageTime = 0;

    private _health = 3
    private _coin = 0

    private knives? : Phaser.Physics.Arcade.Group
    private chest? : Chest

    get health()
    {
        return this._health
    }

    setActiveChest(chest: Chest)
    {
        this.chest = chest
    }

    constructor(scene: Phaser.Scene, x: number, y:number, texture: string, frame?: string|number)
    {
        super(scene, x, y, texture, frame)
		this.anims.play('faune-walk-side')
    }

    setKnives(knives: Phaser.Physics.Arcade.Group)
    {
        this.knives = knives
    }

    handleDamage(dir: Phaser.Math.Vector2)
    {
        if (this._health <=0 )
        {
            return
        }

        if (this.healthState === HealthState.DAMAGE)
        {
            return;
        }

        this._health --;
        if (this._health <= 0)
        {
            this.healthState = HealthState.DEAD
            this.anims.play('faune-die')
            this.setVelocity(0,0)
        }
        else
        {
            this.setVelocity(dir.x, dir.y)
            this.setTint(0xff0000)
            this.healthState = HealthState.DAMAGE
            this.damageTime = 0
        }
    }

    private throwKnife()
    {
        if (!this.knives)
        {
            return;
        }
        const parts = this.anims.currentAnim.key.split('-')
        const direction = parts[2]

        const vec = new Phaser.Math.Vector2(0,0)
        
        switch(direction)
        {
            case 'up':
                vec.y = -1
                break;
            case 'down':
                vec.y = 1
                break;
            case 'side':
                if (this.scaleX < 0)
                {
                    vec.x = -1
                }
                else
                {
                    vec.x = 1
                }
                break;
        }
        const angle = vec.angle()
        const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image
        knife.setActive(true)
        knife.setVisible(true)
        knife.setRotation(angle)
        knife.x += vec.x * 16
        knife.y += vec.y * 16
        knife.setVelocity(vec.x *300, vec.y*300)
    }

    protected preUpdate(time: number, delta: number): void 
    {
        super.preUpdate(time, delta)

        switch(this.healthState)
        {
            case HealthState.DAMAGE:
                this.damageTime+= delta;
                if (this.damageTime > 250)
                {
                    this.healthState = HealthState.IDLE;
                    this.setTint(0xffffff)
                }
                break;
            default:
                break;
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys)
    {
        if (this.healthState == HealthState.DAMAGE ||this.healthState == HealthState.DEAD)
        {
            return;
        }
        if (!cursors)
        {
            return
        }

        var speed = 100
        if (Phaser.Input.Keyboard.JustDown(cursors.space!))
        {
            if (this.chest)
            {
                const coin = this.chest.open()
                this._coin += coin
                sceneEvents.emit("coin-changed", this._coin)
            }
            else
            {
                this.throwKnife()
            }
            
        }
		if(cursors.left?.isDown)
		{
			this.anims.play('faune-walk-side', true)
			this.setVelocity(-speed, 0)
			this.scaleX = -1
			this.body.offset.x = 24
		}
		else if (cursors.right?.isDown)
		{
			this.anims.play('faune-walk-side', true)
			this.setVelocity(speed, 0)
			this.scaleX = 1
			this.body.offset.x = 8
		}
		else if (cursors.up?.isDown)
		{
			this.anims.play('faune-walk-up', true)
			this.setVelocity(0, -speed)
			this.body.offset.x = 8
			this.scaleX = 1
		}
		else if (cursors.down?.isDown)
		{
			this.anims.play('faune-walk-down', true)
			this.setVelocity(0, speed)
			this.body.offset.x = 8
			this.scaleX = 1
		}				
		else
		{
            if (this.anims.currentAnim)
            {
                const parts = this.anims.currentAnim.key.split('-')
                this.setVelocity(0, 0)
                this.play('faune-idle-'+parts[2])
            }
		}

        if (this.body.velocity.x != 0 || this.body.velocity.y != 0)
        {
            this.setActiveChest(undefined)
        }
    }
}



Phaser.GameObjects.GameObjectFactory.register('faune', function(this:GameObjects.GameObjectFactory, x: number, y: number, texture:string, frame?:string|number)
{
    var sprite = new Faune(this.scene, x, y, texture, frame)
    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8)
    return sprite
})