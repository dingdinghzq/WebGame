import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";


export default class GameUI extends Phaser.Scene
{
    private hearts!: Phaser.GameObjects.Group
    constructor()
    {
        super({key: 'game-ui'})
    }

    create()
    {
        const coinLabel = this.add.text(5, 20, '0');
        sceneEvents.on('coin-changed', (coins:number) => {
            coinLabel.setText(coins.toString())
        });
        this.hearts = this.add.group(
            {
                classType: Phaser.GameObjects.Image
            }
        )

        this.hearts.createMultiple({
            key:'ui-heart-full',
            setXY:
                {
                    x:10,
                    y:10,
                    stepX:16
                },
                quantity: 3
        })

        sceneEvents.on('player-health-changed', this.handlePlayerHealthChange, this)
    }

    private handlePlayerHealthChange(health: number)
    {
        this.hearts.children.each((go, idx)=>
        {
            const heart = go as Phaser.GameObjects.Image
            if (idx < health)
            {
                heart.setTexture('ui-heart-full')
            }
            else
            {
                heart.setTexture('ui-heart-empty')
            }
            
        })
    }
}