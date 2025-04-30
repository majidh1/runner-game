import * as THREE from 'three';
import Player from './player';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.player = null;
        this.keys = {};
        this.cameraOffset = new THREE.Vector3(0, 5, 10);
        this.streetWidth = 10;
        this.roadSegments = [];
        this.segmentLength = 20;
        this.numSegments = 20;
        this.lastPlayerZ = 0;
        this.treeSegments = [];
        this.treesPerSegment = 8;
        this.treeOffset = 2;
        this.baseSpeed = 0.1;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 0.3;
        this.acceleration = 0.005;
        this.brakeSpeed = 0.05;
        this.brakeDuration = 1000;
        this.lastBrakeTime = 0;
        this.visibleDistance = 100;
        this.recycleThreshold = 50;
        this.obstacles = [];
        this.collectibles = [];
        this.score = 0;
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '20px';
        this.scoreElement.style.left = '20px';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '16px' : '24px';
        this.scoreElement.style.fontFamily = 'Arial';
        this.scoreElement.style.width = '90%';
        this.scoreElement.style.maxWidth = '500px';
        document.body.appendChild(this.scoreElement);
        this.treeTypes = [
            { trunkColor: 0x8B4513, leafColor: 0x2E8B57, height: 3.5, width: 1.8 }, // Sea Green
            { trunkColor: 0x8B4513, leafColor: 0x228B22, height: 3.2, width: 1.6 }, // Forest Green
            { trunkColor: 0x8B4513, leafColor: 0x32CD32, height: 3.0, width: 1.5 }, // Lime Green
            { trunkColor: 0x8B4513, leafColor: 0x006400, height: 3.3, width: 1.7 }, // Dark Green
            { trunkColor: 0x8B4513, leafColor: 0x90EE90, height: 3.1, width: 1.6 }  // Light Green
        ];
        
        this.isGameOver = false;
        this.gameOverElement = document.createElement('div');
        this.gameOverElement.style.position = 'absolute';
        this.gameOverElement.style.top = '50%';
        this.gameOverElement.style.left = '50%';
        this.gameOverElement.style.transform = 'translate(-50%, -50%)';
        this.gameOverElement.style.color = 'red';
        this.gameOverElement.style.fontSize = '72px';
        this.gameOverElement.style.fontFamily = 'Arial';
        this.gameOverElement.style.display = 'none';
        this.gameOverElement.textContent = 'GAME OVER';
        this.gameOverElement.style.width = '90%';
        this.gameOverElement.style.maxWidth = '500px';
        document.body.appendChild(this.gameOverElement);
        
        this.level = 1;
        this.maxLevel = 10;
        this.coinsToNextLevel = 10;
        this.coinsCollected = 0;
        this.startTime = Date.now();
        this.levelElement = document.createElement('div');
        this.levelElement.style.position = 'absolute';
        this.levelElement.style.top = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '40px' : '60px';
        this.levelElement.style.left = '20px';
        this.levelElement.style.color = 'white';
        this.levelElement.style.fontSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '16px' : '24px';
        this.levelElement.style.fontFamily = 'Arial';
        document.body.appendChild(this.levelElement);

        this.timerElement = document.createElement('div');
        this.timerElement.style.position = 'absolute';
        this.timerElement.style.top = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '60px' : '100px';
        this.timerElement.style.left = '20px';
        this.timerElement.style.color = 'white';
        this.timerElement.style.fontSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '16px' : '24px';
        this.timerElement.style.fontFamily = 'Arial';
        document.body.appendChild(this.timerElement);

        // Level-specific properties
        this.levelSpeeds = [
            0.1,   // Level 1
            0.25,  // Level 2
            0.4,   // Level 3
            0.55,  // Level 4
            0.7,   // Level 5
            0.85,  // Level 6
            1.0,   // Level 7
            1.15,  // Level 8
            1.3,   // Level 9
            1.5    // Level 10
        ];
        
        this.isBraking = false;
        this.highScore = this.loadHighScore();
        this.hasShownRecordNotification = false;
        this.highScoreElement = document.createElement('div');
        this.highScoreElement.style.position = 'absolute';
        this.highScoreElement.style.top = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '80px' : '140px';
        this.highScoreElement.style.left = '20px';
        this.highScoreElement.style.color = 'white';
        this.highScoreElement.style.fontSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '16px' : '24px';
        this.highScoreElement.style.fontFamily = 'Arial';
        document.body.appendChild(this.highScoreElement);

        this.recordNotification = document.createElement('div');
        this.recordNotification.style.position = 'absolute';
        this.recordNotification.style.top = '50%';
        this.recordNotification.style.left = '50%';
        this.recordNotification.style.transform = 'translate(-50%, -50%)';
        this.recordNotification.style.color = 'gold';
        this.recordNotification.style.fontSize = '48px';
        this.recordNotification.style.fontFamily = 'Arial';
        this.recordNotification.style.display = 'none';
        this.recordNotification.textContent = 'NEW RECORD!';
        document.body.appendChild(this.recordNotification);

        this.isGameStarted = false;
        
        // Create start menu
        this.startMenu = document.createElement('div');
        this.startMenu.style.position = 'absolute';
        this.startMenu.style.top = '50%';
        this.startMenu.style.left = '50%';
        this.startMenu.style.transform = 'translate(-50%, -50%)';
        this.startMenu.style.color = 'white';
        this.startMenu.style.fontFamily = 'Arial';
        this.startMenu.style.textAlign = 'center';
        this.startMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.startMenu.style.padding = '20px';
        this.startMenu.style.borderRadius = '10px';
        this.startMenu.style.width = '90%';
        this.startMenu.style.maxWidth = '500px';
        
        const title = document.createElement('h1');
        title.textContent = 'BLUE-MAN';
        title.style.fontSize = '48px';
        title.style.marginBottom = '30px';
        this.startMenu.appendChild(title);
        
        const controls = document.createElement('div');
        controls.style.fontSize = '18px';
        controls.style.marginBottom = '20px';
        
        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            controls.innerHTML = `
                <p>Controls:</p>
                <p>Swipe Left / Right - Move Left / Right</p>
                <p>Swipe Up - Jump</p>
                <p>Hold Finger - Speed Up</p>
                <p style="color: #1E90FF;">Tap to Start</p>
            `;
        } else {
            controls.innerHTML = `
                <p>Controls:</p>
                <p>A / D - Move Left / Right</p>
                <p>W - Speed Up</p>
                <p>S - Brake</p>
                <p>SPACE - Jump</p>
                <p style="color: #1E90FF;">Press ENTER to Start</p>
            `;
        }
        
        this.startMenu.appendChild(controls);
        
        document.body.appendChild(this.startMenu);

        // Add keyboard event listener for start/restart
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                if (!this.isGameStarted) {
                    this.startGame();
                } else if (this.isGameOver) {
                    this.restartGame();
                }
            }
        });

        // Touch control variables
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        this.isTouching = false;
        this.touchHoldTimer = null;

        // Add touch event listeners
        this.addTouchControls();

        this.init();
        this.animate();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Add lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        // Create initial road segments
        this.createRoadSegments();

        // Create initial trees
        this.createInitialTrees();

        // Create player
        this.player = new Player(this.scene);
        this.lastPlayerZ = this.player.getPosition().z;

        // Setup keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyA') this.player.moveLeft();
            if (e.code === 'KeyD') this.player.moveRight();
            if (e.code === 'KeyS') this.player.brake();
            if (e.code === 'Space') this.player.jump();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'KeyW') {
                this.player.resetSpeed();
            }
            if (e.code === 'KeyS') {
                this.player.resetSpeed();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createTree(x, z) {
        // Random tree parameters
        const treeType = this.treeTypes[Math.floor(Math.random() * this.treeTypes.length)];
        const height = treeType.height;
        const width = treeType.width;
        const trunkColor = treeType.trunkColor;
        const leavesColor = treeType.leafColor;

        const tree = {
            trunk: null,
            leaves: null,
            type: { height, width, trunkColor, leavesColor }
        };

        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, height * 0.4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: trunkColor });
        tree.trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        tree.trunk.position.set(x, height * 0.2, z);
        this.scene.add(tree.trunk);

        // Create leaves
        const leavesGeometry = new THREE.ConeGeometry(width, height * 0.6, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: leavesColor });
        tree.leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        tree.leaves.position.set(x, height * 0.7, z);
        this.scene.add(tree.leaves);

        return tree;
    }

    createTreeSegment(zPosition) {
        const segment = {
            leftTrees: [],
            rightTrees: []
        };

        // Create trees for this segment with random spacing
        let currentZ = zPosition;
        for (let i = 0; i < this.treesPerSegment; i++) {
            // Random spacing between trees (between 6 and 10 units)
            const randomSpacing = 6 + Math.random() * 4;
            currentZ -= randomSpacing;
            
            // Left side tree
            const leftTree = this.createTree(-this.streetWidth/2 - this.treeOffset, currentZ);
            segment.leftTrees.push(leftTree);
            
            // Right side tree
            const rightTree = this.createTree(this.streetWidth/2 + this.treeOffset, currentZ);
            segment.rightTrees.push(rightTree);
        }

        return segment;
    }

    createInitialTrees() {
        // Create initial tree segments
        for (let i = 0; i < this.numSegments; i++) {
            const zPosition = -i * this.segmentLength;
            this.treeSegments.push(this.createTreeSegment(zPosition));
        }
    }

    speedUp() {
        if (this.currentSpeed < this.maxSpeed) {
            this.currentSpeed += this.acceleration;
        }
    }

    brake() {
        const now = Date.now();
        if (now - this.lastBrakeTime > this.brakeDuration) {
            this.currentSpeed = 0;
            this.isBraking = true;
            this.lastBrakeTime = now;
            
            // Reset braking after duration
            setTimeout(() => {
                this.isBraking = false;
                this.currentSpeed = this.baseSpeed;
            }, this.brakeDuration);
        }
    }

    updateTrees(speed) {
        const playerZ = this.player.getPosition().z;
        
        // Move all tree segments
        this.treeSegments.forEach(segment => {
            // Move left trees
            segment.leftTrees.forEach(tree => {
                tree.trunk.position.z += speed;
                tree.leaves.position.z += speed;
            });
            
            // Move right trees
            segment.rightTrees.forEach(tree => {
                tree.trunk.position.z += speed;
                tree.leaves.position.z += speed;
            });

            // If segment is behind the player and beyond visible distance, move it to the front
            if (segment.leftTrees[0].trunk.position.z > this.recycleThreshold) {
                // Find the last segment
                let lastSegment = this.treeSegments[0];
                for (const seg of this.treeSegments) {
                    if (seg.leftTrees[0].trunk.position.z < lastSegment.leftTrees[0].trunk.position.z) {
                        lastSegment = seg;
                    }
                }
                
                // Move this segment to the front with a small random offset
                const randomOffset = (Math.random() - 0.5) * 2;
                const newZ = lastSegment.leftTrees[0].trunk.position.z - this.segmentLength + randomOffset;
                
                // Update left trees
                segment.leftTrees.forEach((tree, index) => {
                    const randomSpacing = 6 + Math.random() * 4;
                    const treeZ = newZ - (index * randomSpacing);
                    tree.trunk.position.z = treeZ;
                    tree.leaves.position.z = treeZ;
                    
                    // Create new random tree
                    const newTree = this.createTree(-this.streetWidth/2 - this.treeOffset, treeZ);
                    this.scene.remove(tree.trunk);
                    this.scene.remove(tree.leaves);
                    tree.trunk = newTree.trunk;
                    tree.leaves = newTree.leaves;
                });
                
                // Update right trees
                segment.rightTrees.forEach((tree, index) => {
                    const randomSpacing = 6 + Math.random() * 4;
                    const treeZ = newZ - (index * randomSpacing);
                    tree.trunk.position.z = treeZ;
                    tree.leaves.position.z = treeZ;
                    
                    // Create new random tree
                    const newTree = this.createTree(this.streetWidth/2 + this.treeOffset, treeZ);
                    this.scene.remove(tree.trunk);
                    this.scene.remove(tree.leaves);
                    tree.trunk = newTree.trunk;
                    tree.leaves = newTree.leaves;
                });
            }
        });
    }

    createObstacle(x, z) {
        // Define obstacle types
        const obstacleTypes = [
            {
                type: 'triangle',
                create: () => {
                    // Create outer triangle
                    const outerGeometry = new THREE.ConeGeometry(0.8, 1.5, 3);
                    const outerMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0xFF0000,
                        emissive: 0xFF0000,
                        emissiveIntensity: 0.5,
                        side: THREE.DoubleSide
                    });
                    const outerTriangle = new THREE.Mesh(outerGeometry, outerMaterial);
                    outerTriangle.rotation.x = -Math.PI / 2;

                    // Create inner triangle (smaller)
                    const innerGeometry = new THREE.ConeGeometry(0.7, 1.4, 3);
                    const innerMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0x000000,
                        side: THREE.DoubleSide
                    });
                    const innerTriangle = new THREE.Mesh(innerGeometry, innerMaterial);
                    innerTriangle.rotation.x = -Math.PI / 2;
                    innerTriangle.position.y = 0.01; // Slightly offset to prevent z-fighting

                    // Create group and add both triangles
                    const triangleGroup = new THREE.Group();
                    triangleGroup.add(outerTriangle);
                    triangleGroup.add(innerTriangle);

                    return triangleGroup;
                }
            },
            {
                type: 'hedgehog',
                create: () => {
                    // Create body
                    const bodyGeometry = new THREE.SphereGeometry(0.6, 16, 16);
                    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                    
                    // Create spikes
                    const spikesGroup = new THREE.Group();
                    for (let i = 0; i < 20; i++) {
                        const spikeGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
                        const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                        
                        // Random position on sphere
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.acos(2 * Math.random() - 1);
                        spike.position.set(
                            Math.sin(phi) * Math.cos(theta) * 0.6,
                            Math.sin(phi) * Math.sin(theta) * 0.6,
                            Math.cos(phi) * 0.6
                        );
                        spike.lookAt(0, 0, 0);
                        spikesGroup.add(spike);
                    }
                    
                    const obstacle = new THREE.Group();
                    obstacle.add(body);
                    obstacle.add(spikesGroup);
                    return obstacle;
                }
            },
            {
                type: 'car',
                create: () => {
                    const carGroup = new THREE.Group();
                    
                    // Create car body
                    const bodyGeometry = new THREE.BoxGeometry(2.0, 1.0, 3.0);
                    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
                    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                    body.position.y = 0.5;
                    carGroup.add(body);
                    
                    // Create windows
                    const windowGeometry = new THREE.BoxGeometry(1.8, 0.7, 0.7);
                    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87CEEB });
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(0, 1.0, 0);
                    carGroup.add(window);
                    
                    // Create wheels
                    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.25, 16);
                    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
                    
                    const wheelPositions = [
                        [-0.7, 0, -1.0],
                        [0.7, 0, -1.0],
                        [-0.7, 0, 1.0],
                        [0.7, 0, 1.0]
                    ];
                    
                    wheelPositions.forEach(pos => {
                        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                        wheel.position.set(...pos);
                        wheel.rotation.x = Math.PI / 2;
                        carGroup.add(wheel);
                    });
                    
                    return carGroup;
                }
            }
        ];

        // Randomly select an obstacle type
        const selectedType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const obstacle = selectedType.create();
        
        // Position the obstacle
        obstacle.position.set(x, 0, z);
        
        // Add specific positioning for each type
        if (selectedType.type === 'triangle') {
            obstacle.position.y = 0.75;
        } else if (selectedType.type === 'hedgehog') {
            obstacle.position.y = 0.6;
        } else if (selectedType.type === 'car') {
            obstacle.position.y = 0.3;
        }
        
        this.scene.add(obstacle);
        return obstacle;
    }

    createCollectible(x, z) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const collectible = new THREE.Mesh(geometry, material);
        collectible.position.set(x, 0.5, z);
        this.scene.add(collectible);
        return collectible;
    }

    createRoadSegment(zPosition) {
        const segment = {
            road: null,
            centerLine: null,
            leftLine: null,
            rightLine: null,
            obstacles: [],
            collectibles: []
        };

        // Create road
        const roadGeometry = new THREE.PlaneGeometry(this.streetWidth, this.segmentLength);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            side: THREE.DoubleSide
        });
        segment.road = new THREE.Mesh(roadGeometry, roadMaterial);
        segment.road.rotation.x = -Math.PI / 2;
        segment.road.position.z = zPosition;
        this.scene.add(segment.road);

        // Create lane markers
        const laneMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        // Center line (dashed)
        const centerLineGroup = new THREE.Group();
        for (let i = 0; i < this.segmentLength; i += 2) {
            const centerLine = new THREE.Mesh(
                new THREE.PlaneGeometry(0.2, 1),
                laneMaterial
            );
            centerLine.rotation.x = -Math.PI / 2;
            centerLine.position.set(0, 0.01, -i);
            centerLineGroup.add(centerLine);
        }
        centerLineGroup.position.z = zPosition;
        this.scene.add(centerLineGroup);
        segment.centerLine = centerLineGroup;

        // Side lines
        const sideLineGeometry = new THREE.PlaneGeometry(0.1, this.segmentLength);
        const leftLine = new THREE.Mesh(sideLineGeometry, laneMaterial);
        const rightLine = new THREE.Mesh(sideLineGeometry, laneMaterial);
        
        leftLine.rotation.x = -Math.PI / 2;
        rightLine.rotation.x = -Math.PI / 2;
        
        leftLine.position.set(-this.streetWidth/2, 0.01, zPosition);
        rightLine.position.set(this.streetWidth/2, 0.01, zPosition);
        
        this.scene.add(leftLine);
        this.scene.add(rightLine);
        segment.leftLine = leftLine;
        segment.rightLine = rightLine;

        // Define lane positions (left, center, right)
        const lanePositions = [
            -this.streetWidth/3,  // Left lane
            0,                    // Center lane
            this.streetWidth/3    // Right lane
        ];

        // Add random obstacles in lanes
        const numObstacles = Math.floor(Math.random() * 3);
        for (let i = 0; i < numObstacles; i++) {
            const laneIndex = Math.floor(Math.random() * 3);
            const x = lanePositions[laneIndex];
            const z = zPosition - Math.random() * this.segmentLength;
            const obstacle = this.createObstacle(x, z);
            segment.obstacles.push(obstacle);
        }

        // Add collectibles in lanes
        const numCollectibles = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < numCollectibles; i++) {
            const laneIndex = Math.floor(Math.random() * 3);
            const x = lanePositions[laneIndex];
            const z = zPosition - Math.random() * this.segmentLength;
            const collectible = this.createCollectible(x, z);
            segment.collectibles.push(collectible);
        }

        return segment;
    }

    createRoadSegments() {
        for (let i = 0; i < this.numSegments; i++) {
            const zPosition = -i * this.segmentLength;
            this.roadSegments.push(this.createRoadSegment(zPosition));
        }
    }

    updateRoadSegments(speed) {
        const playerZ = this.player.getPosition().z;
        
        // Move all segments forward based on current speed
        this.roadSegments.forEach(segment => {
            segment.road.position.z += speed;
            if (segment.centerLine) segment.centerLine.position.z += speed;
            segment.leftLine.position.z += speed;
            segment.rightLine.position.z += speed;

            // Move obstacles
            segment.obstacles.forEach(obstacle => {
                obstacle.position.z += speed;
            });

            // Move collectibles
            segment.collectibles.forEach(collectible => {
                collectible.position.z += speed;
                // Rotate collectible
                collectible.rotation.y += 0.1;
            });

            // Check for collisions
            this.checkCollisions(segment);

            // If segment is behind the player and beyond visible distance, move it to the front
            if (segment.road.position.z > this.recycleThreshold) {
                // Remove old obstacles and collectibles
                segment.obstacles.forEach(obstacle => this.scene.remove(obstacle));
                segment.collectibles.forEach(collectible => this.scene.remove(collectible));
                
                // Find the last segment
                let lastSegment = this.roadSegments[0];
                for (const seg of this.roadSegments) {
                    if (seg.road.position.z < lastSegment.road.position.z) {
                        lastSegment = seg;
                    }
                }
                
                // Move this segment to the front
                const newZ = lastSegment.road.position.z - this.segmentLength;
                
                // Update positions
                segment.road.position.z = newZ;
                if (segment.centerLine) segment.centerLine.position.z = newZ;
                segment.leftLine.position.z = newZ;
                segment.rightLine.position.z = newZ;

                // Define lane positions (left, center, right)
                const lanePositions = [
                    -this.streetWidth/3,  // Left lane
                    0,                    // Center lane
                    this.streetWidth/3    // Right lane
                ];

                // Create new obstacles in lanes
                segment.obstacles = [];
                const numObstacles = Math.floor(Math.random() * 3);
                for (let i = 0; i < numObstacles; i++) {
                    const laneIndex = Math.floor(Math.random() * 3);
                    const x = lanePositions[laneIndex];
                    const z = newZ - Math.random() * this.segmentLength;
                    const obstacle = this.createObstacle(x, z);
                    segment.obstacles.push(obstacle);
                }

                // Create new collectibles in lanes
                segment.collectibles = [];
                const numCollectibles = Math.floor(Math.random() * 5) + 2;
                for (let i = 0; i < numCollectibles; i++) {
                    const laneIndex = Math.floor(Math.random() * 3);
                    const x = lanePositions[laneIndex];
                    const z = newZ - Math.random() * this.segmentLength;
                    const collectible = this.createCollectible(x, z);
                    segment.collectibles.push(collectible);
                }
            }
        });
    }

    checkCollisions(segment) {
        if (!segment || !segment.collectibles || !segment.obstacles) return;
        
        const playerPosition = this.player.getPosition();
        
        // Check collectible collisions
        for (let i = segment.collectibles.length - 1; i >= 0; i--) {
            const collectible = segment.collectibles[i];
            const distance = playerPosition.distanceTo(collectible.position);
            
            if (distance < 1) {
                this.scene.remove(collectible);
                segment.collectibles.splice(i, 1);
                
                // Calculate score based on level
                const baseScore = 10;
                const levelMultiplier = this.level;
                const score = baseScore * levelMultiplier;
                
                this.score += score;
                this.coinsCollected++;
                this.updateScoreDisplay();
                this.saveHighScore();
                this.checkLevelProgress();
            }
        }

        // Check obstacle collisions
        for (let i = segment.obstacles.length - 1; i >= 0; i--) {
            const obstacle = segment.obstacles[i];
            const distance = playerPosition.distanceTo(obstacle.position);
            
            if (distance < 1) { // If player hits an obstacle
                this.gameOver();
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        if (!this.isGameStarted || this.isGameOver) return;
        
        this.updateTimer();
        
        // Get current level speed
        const levelSpeed = this.levelSpeeds[this.level - 1];

        // Update player with level-based speed
        this.player.update(levelSpeed);

        // Check if W key is pressed for continuous speed increase
        if (this.keys['KeyW']) {
            this.player.speedUp();
        }

        // Check if S key is pressed for braking
        if (this.keys['KeyS']) {
            this.brake();
        }

        // Move environment instead of player
        const playerSpeed = this.player.currentSpeed;
        
        // Only move environment if player is not braking
        if (!this.isBraking) {
            // Update road segments
            this.updateRoadSegments(playerSpeed + levelSpeed);

            // Update trees
            this.updateTrees(playerSpeed + levelSpeed);
        }

        // Update camera to follow player
        const targetPosition = this.player.getPosition().clone().add(this.cameraOffset);
        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(this.player.getPosition());

        this.checkCollisions();
    }

    animate() {
        if (!this.isGameStarted || this.isGameOver) return;
        
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = `Score: ${this.score} (${this.level}x multiplier)`;
        this.highScoreElement.textContent = `High Score: ${this.highScore}`;
    }

    gameOver() {
        this.isGameOver = true;
        this.gameOverElement.style.display = 'block';
        this.saveHighScore();
        this.hasShownRecordNotification = false;
        
        // Clear previous content
        this.gameOverElement.innerHTML = '';
        
        // Create game over text
        const gameOverText = document.createElement('div');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.color = 'red';
        gameOverText.style.fontSize = '72px';
        gameOverText.style.fontFamily = 'Arial';
        gameOverText.style.marginBottom = '30px';
        gameOverText.style.textAlign = 'center';
        this.gameOverElement.appendChild(gameOverText);
        
        // Create restart instruction
        const restartText = document.createElement('div');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        restartText.textContent = isMobile ? 'Tap to Restart' : 'Press ENTER to Restart';
        restartText.style.color = 'white';
        restartText.style.fontSize = '24px';
        restartText.style.fontFamily = 'Arial';
        restartText.style.textAlign = 'center';
        this.gameOverElement.appendChild(restartText);
    }

    updateLevelDisplay() {
        this.levelElement.textContent = `Level: ${this.level}/${this.maxLevel}`;
    }

    updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        this.timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    checkLevelProgress() {
        if (this.coinsCollected >= this.coinsToNextLevel && this.level < this.maxLevel) {
            this.level++;
            this.coinsCollected = 0;
            this.coinsToNextLevel += 5; // Increase coins needed for next level
            this.updateLevelDisplay();
            
            // Change environment based on level
            this.updateEnvironment();
        }
    }

    updateEnvironment() {
        // Change tree colors based on level
        const levelColors = [
            { trunk: 0x8B4513, leaf: 0x2E8B57 }, // Level 1-2: Green
            { trunk: 0x8B4513, leaf: 0xFFA500 }, // Level 3-4: Orange
            { trunk: 0x8B4513, leaf: 0xFF0000 }, // Level 5-6: Red
            { trunk: 0x8B4513, leaf: 0x800080 }, // Level 7-8: Purple
            { trunk: 0x8B4513, leaf: 0x0000FF }  // Level 9-10: Blue
        ];
        
        const colorIndex = Math.min(Math.floor((this.level - 1) / 2), 4);
        const colors = levelColors[colorIndex];
        
        this.treeTypes = [
            { trunkColor: colors.trunk, leafColor: colors.leaf, height: 3.5, width: 1.8 },
            { trunkColor: colors.trunk, leafColor: colors.leaf, height: 3.2, width: 1.6 },
            { trunkColor: colors.trunk, leafColor: colors.leaf, height: 3.0, width: 1.5 },
            { trunkColor: colors.trunk, leafColor: colors.leaf, height: 3.3, width: 1.7 },
            { trunkColor: colors.trunk, leafColor: colors.leaf, height: 3.1, width: 1.6 }
        ];
    }

    loadHighScore() {
        const savedScore = localStorage.getItem('highScore');
        return savedScore ? parseInt(savedScore) : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            
            // Only show notification if we haven't shown it in this game
            if (!this.hasShownRecordNotification) {
                this.showRecordNotification();
                this.hasShownRecordNotification = true;
            }
        }
    }

    showRecordNotification() {
        this.recordNotification.style.display = 'block';
        setTimeout(() => {
            this.recordNotification.style.display = 'none';
        }, 2000);
    }

    startGame() {
        this.isGameStarted = true;
        this.startMenu.style.display = 'none';
        this.isGameOver = false;
        this.gameOverElement.style.display = 'none';
        this.score = 0;
        this.level = 1;
        this.coinsCollected = 0;
        this.coinsToNextLevel = 10;
        
        // Reset player position
        this.player.mesh.position.set(0, 0, 0);
        this.player.currentLane = 0;
        
        // Reset environment
        this.roadSegments.forEach(segment => {
            this.scene.remove(segment.road);
            if (segment.centerLine) this.scene.remove(segment.centerLine);
            this.scene.remove(segment.leftLine);
            this.scene.remove(segment.rightLine);
            segment.obstacles.forEach(obstacle => this.scene.remove(obstacle));
            segment.collectibles.forEach(collectible => this.scene.remove(collectible));
        });
        this.roadSegments = [];
        
        // Recreate the environment
        this.createRoadSegments();
        this.createInitialTrees();
        
        // Update displays
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        
        // Start the game loop
        this.animate();
    }

    restartGame() {
        // Refresh the page to restart the game
        window.location.reload();
    }

    addTouchControls() {
        const gameContainer = document.getElementById('game');
        
        // Touch start
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isTouching = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            
            // Start speed increase after holding for 500ms
            this.touchHoldTimer = setInterval(() => {
                if (this.isTouching && this.isGameStarted) {
                    this.player.speedUp();
                }
            }, 100);
        });

        // Touch move
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
        });

        // Touch end
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
            clearInterval(this.touchHoldTimer);
            
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            const deltaTime = Date.now() - this.touchStartTime;
            
            // If it's a short tap and game hasn't started, start the game
            if (deltaTime < 200 && !this.isGameStarted) {
                this.startGame();
                return;
            }
            
            // If it's a short tap and game is over, restart the game
            if (deltaTime < 200 && this.isGameOver) {
                this.restartGame();
                return;
            }
            
            // Only process swipes if game is started
            if (!this.isGameStarted) return;
            
            // Calculate swipe speed
            const swipeSpeedX = Math.abs(deltaX) / deltaTime;
            const swipeSpeedY = Math.abs(deltaY) / deltaTime;
            
            // Minimum swipe speed threshold
            const minSwipeSpeed = 0.3;
            
            if (swipeSpeedX > minSwipeSpeed) {
                if (deltaX > 0) {
                    this.player.moveRight();
                } else {
                    this.player.moveLeft();
                }
            }
            
            if (swipeSpeedY > minSwipeSpeed && deltaY < 0) {
                this.player.jump();
            }
        });

        // Touch cancel
        document.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.isTouching = false;
            clearInterval(this.touchHoldTimer);
        });
    }
}

// Start the game
new Game(); 