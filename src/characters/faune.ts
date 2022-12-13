import Phaser, { GameObjects } from "phaser";

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
    DAMAGE

}

export default class Faune extends Phaser.Physics.Arcade.Sprite
{
    private healthState = HealthState.IDLE;
    private damageTime = 0;

    private _health = 3

    get health()
    {
        return this._health
    }

    constructor(scene: Phaser.Scene, x: number, y:number, texture: string, frame?: string|number)
    {
        super(scene, x, y, texture, frame)
		this.anims.play('faune-walk-side')
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

        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
        console.log(this._health);
        this._health --;
        if (this._health <= 0)
        {
            // die
        }
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
            default:
                break;
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys)
    {
        if (this.healthState == HealthState.DAMAGE)
        {
            return;
        }
        if (!cursors)
        {
            return
        }

        const speed = 100
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