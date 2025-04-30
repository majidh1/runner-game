class PersiMan {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create the character sprite
        this.sprite = scene.physics.add.sprite(x, y, 'persi');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        
        // Set character properties
        this.speed = 160;
        this.jumpForce = 330;
        
        // Create animations
        this.createAnimations();
    }
    
    createAnimations() {
        // Idle animation (facing camera)
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('persi', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // Running animation
        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNumbers('persi', { start: 4, end: 9 }),
            frameRate: 12,
            repeat: -1
        });
        
        // Jump animation
        this.scene.anims.create({
            key: 'jump',
            frames: this.scene.anims.generateFrameNumbers('persi', { start: 10, end: 12 }),
            frameRate: 10,
            repeat: 0
        });
    }
    
    update(cursors) {
        // Handle horizontal movement
        if (cursors.left.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.anims.play('run', true);
            this.sprite.flipX = true;
        } else if (cursors.right.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.anims.play('run', true);
            this.sprite.flipX = false;
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('idle', true);
        }
        
        // Handle jumping
        if (cursors.up.isDown && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-this.jumpForce);
            this.sprite.anims.play('jump', true);
        }
    }
}

export default PersiMan; 