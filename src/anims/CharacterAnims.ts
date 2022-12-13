import Phaser from "phaser";

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) =>
{
    anims.create({
        key:'faune-idle-down',
        frames: [{key: 'faune', frame: 'walk-down-3.png'}]
    })

    anims.create({
        key:'faune-idle-up',
        frames: [{key: 'faune', frame: 'walk-up-3.png'}]
    })

    anims.create({
        key:'faune-idle-side',
        frames: [{key: 'faune', frame: 'walk-side-3.png'}]
    })


    anims.create({
        key:'faune-walk-down',
        frames: anims.generateFrameNames('faune', {prefix:'walk-down-', start:1, end:8, suffix:'.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key:'faune-walk-up',
        frames: anims.generateFrameNames('faune', {prefix:'walk-up-', start:1, end:8, suffix:'.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key:'faune-walk-side',
        frames: anims.generateFrameNames('faune', {prefix:'walk-side-', start:1, end:8, suffix:'.png' }),
        repeat: -1,
        frameRate: 20
    })

}

export
{
    createCharacterAnims
}