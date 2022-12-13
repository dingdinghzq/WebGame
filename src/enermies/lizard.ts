import Phaser from "phaser";

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

    constructor(scene: Phaser.Scene, x: number, y:number, texture: string, frame?: string|number)
    {
        super(scene, x, y, texture, frame)
		this.anims.play('lizard-run')

        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
        this.moveEvent = scene.time.addEvent(
            {
                delay: Phaser.Math.Between(2000, 4000),
                callback: ()=>
                {
                    this.direction = Phaser.Math.Between(0, 3);
                },
                loop: true
            }
        )
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