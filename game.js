var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            //Sets the gravity of the whole game
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#ffffff'
};

var game = new Phaser.Game(config);

function preload ()
{   //Loading assets, Sky, Ground, Star, Bomb and Dude (Sprite)
    //this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('powerups', 'assets/bouncealot.png');
    this.load.image('spike', 'assets/tri.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('player1', 
        'assets/character.png',
        { frameWidth: 30, frameHeight: 28 })
    //this.load.image('player1', 'assets/character.png');
}

var platforms;
var player;
var gameOver = false;
var timer;
var score = 0
var scoreText
var gameScoreTimer
var timedEvent
var bombTimer
var inputTimer

function create ()
{   
    //  The score, fixed to camera
    scoreText = this.add.text(16, 16, 'score: ' + score, { fontSize: '32px', fill: '#000' }).setScrollFactor(0);
    timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true});
    

    this.physics.world.setBounds(0, -2000, 800, 9000)
    //this.cameras.main.setViewport(0, 0, 800, 600);
    //game.world.setBounds(0,0,480,380);
    // setBounds(0, 0, 800, 2000)
    // Phaser.Physics.Arcade.World.setBounds(0, 0, 800, 2000)
    // game.world.setBounds(0, 0, 800, 2000);
    //console.log(game.world)     
    //Layers, the 'lowest' is the top layer
    //Adds Sky as background
    //this.add.image(400, 300, 'sky');
    //Adds Star 
    //this.add.image(400, 300, 'star');
    var randomX = Phaser.Math.Between(20, 760)
    //var randomY = Phaser.Math.Between(400, -2000)
    //Adds a 'static' group in Physics called Platforms
    platforms = this.physics.add.staticGroup();
    spikes = this.physics.add.staticGroup();
    powerups = this.physics.add.group({
        key: 'powerups',
        repeat: 10,
        setXY: { x: 10, y: -2000, stepX: 80 }
    });
    powerups.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    //Creates the ground and scales it x2
    platforms.create(0, 568, 'ground').setScale(6).refreshBody();

    //Creates the other ground platforms X , Y, string
    //1st
    platforms.create(400, 400, 'ground').setScale(0.3).refreshBody();
    //2nd
    platforms.create(550, 270, 'ground').setScale(0.4).refreshBody();
    //3rd
    platforms.create(350, 120, 'ground').setScale(0.3).refreshBody();
    //4th
    platforms.create(250, -50, 'ground').setScale(0.4).refreshBody();
    //5th
    platforms.create(550, -150, 'ground').setScale(0.3).refreshBody();
    //6th
    platforms.create(150, -300, 'ground').setScale(0.5).refreshBody();
    //7th
    platforms.create(450, -470, 'ground').setScale(0.3).refreshBody();
    //8th
    platforms.create(750, -570, 'ground').setScale(0.3).refreshBody();
    //9th
    platforms.create(450, -720, 'ground').setScale(0.3).refreshBody();
    //10th
    platforms.create(750, -820, 'ground').setScale(0.3).refreshBody();
    //11th
    platforms.create(430, -980, 'ground').setScale(0.1).refreshBody();
    //12th
    platforms.create(180, -1090, 'ground').setScale(0.1).refreshBody();
    //13th
    platforms.create(560, -1240, 'ground').setScale(1).refreshBody();
    //14th
    platforms.create(200, -1340, 'ground').setScale(0.3).refreshBody();
    //15th
    platforms.create(450, -1520, 'ground').setScale(0.3).refreshBody();

    powerups.create(250, 390, 'powerups')

    //Spikes
    spikes.create(400, 390, 'spike')
    //Adds main player to physics group as a sprite
    //player = this.physics.add.sprite(100, 450, 'dude');
    //player = this.physics.add.sprite(100, 450, 'dude');
    player = this.physics.add.sprite(180.6, -1105.6, 'player1');
    console.log(this.physics)
    //Sets the bounce for the player 
    player.setBounce(0.4);

    //Stops the player being able to leave the screen
    player.setCollideWorldBounds(true);

    /*****************
     * THE BELOW IS COMMENTED OUT AS WE ARE NOT USING SPRITE CURRENTLY
    //If left key is pressed, use the sprite 0 - 3 for left running, at 10 frames a second, as a loop
    // this.anims.create({
    //     key: 'left',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    // //If no key is pressed, use the sprite 4 for standing still, at 20 frames a second
    // this.anims.create({
    //     key: 'turn',
    //     frames: [ { key: 'dude', frame: 4 } ],
    //     frameRate: 20
    // });

    // //If right key is pressed, use the sprite 5 - 8 for right running, at 10 frames a second, as a loop
    // this.anims.create({
    //     key: 'right',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    *********************/

    //This stops the player from falling 'through' the ground (platforms)
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, spikes, setGameOver, null, this)
    this.physics.add.collider(powerups, platforms)
    this.physics.add.overlap(player, powerups, collectPowerUp, null, this);
    //This enabled keyboard input to control the player
    cursors = this.input.keyboard.createCursorKeys();
    

    // make the camera follow the player
    this.cameras.main.startFollow(player);
    
    this.cameras.main.followOffset.set(0, 200);
    
    
    
    
    //add bombs to physics group
    //add coliders for bombs and platforms so they bounce off the platforms
    //adds collider for player and bomb, when they collide call the function 'hitBomb'  
     bombs = this.physics.add.group();
     this.physics.add.collider(bombs, platforms);
     this.physics.add.collider(player, bombs, setGameOver, null, this);

     /*
     creates a variable that holds a set interval for every 2 seconds, that will check if the player is between -1200 and -1500
     if they are between -1200 and -1500
     Bombs will be created every 2 seconds and set the timerActive variable to True
     else 
     will mark the timer active to false and clear interval
     */
     bombTimer = this.time.addEvent({ delay: 500, callback: createBomb, callbackScope: this, loop: true});

    
}
function createBomb() {
    if (player.y < -1200 && player.y > -1500) {
        var x = Phaser.Math.Between(0, 800)
        var bomb = bombs.create(x, -1600, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        return
     } else {
        return;
     }
}
function collectPowerUp(player, powerup) {
    powerup.disableBody(true, true);
    player.setBounce(1)

}
 
function setGameOver() {
    gameOver = true;
}

function onEvent() {
    score += 1;
}

function update ()
{   
    
    scoreText.setText('Score: ' + score)
    if (gameOver)
    {   
        this.physics.pause();
        timedEvent.paused = true
        bombTimer.paused = true
        return;
    }

    //If the left key is pressed, set velocityX -160 and play the animation 'left'
    if (cursors.left.isDown)
{
    player.setVelocityX(-160);

    //player.anims.play('left', true);
}
//If the right key is pressed, set velocityX 160 and play the animation 'right'
else if (cursors.right.isDown)
{
    player.setVelocityX(160);

    //player.anims.play('right', true);
}
else
{
    //If no key is pressed, set velocity to 0 and play the animation 'turn' for standing still
    player.setVelocityX(0);

    //player.anims.play('turn');
}
//If the up arrow is pressed and the body is touching the platforms, set velocityY to -330 to jump
if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-470);
}
}
