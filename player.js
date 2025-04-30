import * as THREE from 'three';

class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.baseSpeed = 0.1;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 0.3;
        this.acceleration = 0.003;
        this.deceleration = 0.002;
        this.brakeSpeed = 0.005;
        this.laneWidth = 3.33;
        this.currentLane = 0;
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.laneSwitchSpeed = 0.1;
        this.isRunning = true;
        this.animationTime = 0;
        this.maxLane = 1; // Maximum lane number (right)
        this.minLane = -1; // Minimum lane number (left)
        this.canSwitchLane = true;
        this.laneSwitchDelay = 0.5; // Delay in seconds
        this.lastLaneSwitchTime = 0;
        this.laneChangeSpeed = 0.2;
        
        // Jump properties
        this.isJumping = false;
        this.jumpHeight = 2;
        this.jumpSpeed = 0.15;
        this.gravity = 0.01;
        this.verticalVelocity = 0;
        this.groundY = 0;
        
        this.createPlayer();
    }

    createPlayer() {
        // Create body parts
        const bodyGeometry = new THREE.BoxGeometry(0.5, 1, 0.3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF }); // Blue body
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;

        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6 }); // Light blue head
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.8;

        const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF });
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.4, 1.3, 0);
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.4, 1.3, 0);

        const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF });
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-0.2, 0.3, 0);
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(0.2, 0.3, 0);

        // Create group and add all parts
        this.mesh = new THREE.Group();
        this.mesh.add(this.body);
        this.mesh.add(this.head);
        this.mesh.add(this.leftArm);
        this.mesh.add(this.rightArm);
        this.mesh.add(this.leftLeg);
        this.mesh.add(this.rightLeg);

        // Position the player
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
    }

    update(levelSpeed = 1) {
        // Update running animation
        this.updateRunningAnimation();

        // Update lane position
        this.updateLanePosition(levelSpeed);

        // Update jump
        this.updateJump();
    }

    updateRunningAnimation() {
        // Running animation - speed proportional to current speed
        const animationSpeed = this.currentSpeed * 5;
        this.animationTime += animationSpeed;
        
        if (this.isRunning) {
            // Arm swing
            this.leftArm.rotation.x = Math.sin(this.animationTime) * 0.5;
            this.rightArm.rotation.x = Math.sin(this.animationTime + Math.PI) * 0.5;
            
            // Leg movement
            this.leftLeg.rotation.x = Math.sin(this.animationTime + Math.PI) * 0.5;
            this.rightLeg.rotation.x = Math.sin(this.animationTime) * 0.5;
        }
    }

    updateLanePosition(levelSpeed) {
        const targetX = this.currentLane * this.laneWidth;
        const currentX = this.mesh.position.x;
        
        // Adjust lane change speed based on level
        const adjustedSpeed = this.laneChangeSpeed * levelSpeed;
        
        if (Math.abs(currentX - targetX) > 0.01) {
            this.mesh.position.x += (targetX - currentX) * adjustedSpeed;
        }
    }

    moveLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
        }
    }

    moveRight() {
        if (this.currentLane < 1) {
            this.currentLane++;
        }
    }

    speedUp() {
        if (this.currentSpeed < this.maxSpeed) {
            this.currentSpeed += this.acceleration;
        }
    }

    resetSpeed() {
        this.currentSpeed = this.baseSpeed;
    }

    brake() {
        this.currentSpeed = this.brakeSpeed;
    }

    getPosition() {
        return this.mesh.position;
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.verticalVelocity = this.jumpSpeed;
        }
    }

    updateJump() {
        // Jump and gravity
        if (this.isJumping) {
            this.verticalVelocity -= this.gravity;
            this.mesh.position.y += this.verticalVelocity;
            
            if (this.mesh.position.y <= this.groundY) {
                this.mesh.position.y = this.groundY;
                this.isJumping = false;
                this.verticalVelocity = 0;
            }
        }
    }
}

export default Player; 