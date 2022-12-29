import Phaser from "phaser";
import Faune from "../characters/faune";

const enum Direction
{
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite
{
    private direction = Direction.UP
    private moveEvent: Phaser.Time.TimerEvent
    private faune!: Faune

    constructor(scene: Phaser.Scene, x: number, y:number, texture: string, frame?: string|number)
    {
        super(scene, x, y, texture, frame)
		this.anims.play('lizard-run')
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)

        this.moveEvent = scene.time.addEvent(
            {
                delay: Phaser.Math.Between(1000, 2000),
                callback: ()=>
                {
                    this.setNewDirection();
                    
                },
                loop: true
            }
        )
    }

    private setNewDirection() {
        const guess = Math.abs(this.x - this.faune.x) > Math.abs(this.y - this.faune.y) ? 0 : 1
        if (guess == 0) {
            if (this.x < this.faune.x)
                this.direction = Direction.RIGHT;
            else if (this.x > this.faune.x)
                this.direction = Direction.LEFT;
        }

        else {
            if (this.y > this.faune.y)
                this.direction = Direction.UP;
            else if (this.y < this.faune.y)
                this.direction = Direction.DOWN;
        }
    }

    public setNewRandomDirection()
    {
        this.direction = Phaser.Math.Between(0, 3)
    }

    setFaune(faune: Faune)
    {
        this.faune = faune
        this.setNewDirection()
    }

    destroy(fromScene?: boolean | undefined): void {

        this.moveEvent.destroy();
        super.destroy(fromScene)
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile)
    {
        if (go !== this)
        {
            return;
        }
        

        const newDirection = Phaser.Math.Between(0, 3)
        this.direction = newDirection;

    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta)

        const speed = 50;

        switch(this.direction)
        {
            case Direction.UP:
                this.setVelocity(0, -speed)
                break;
            case Direction.DOWN:
                this.setVelocity(0, speed)
                break;

            case Direction.LEFT:
                this.setVelocity(-speed, 0)
                break;

            case Direction.RIGHT:
                this.setVelocity(speed, 0)
                break;
            
        }

    }
  

}