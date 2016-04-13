/*
Change Documentation:
Sounds were removed, due to them being annoying and unnerving.

Space Invader who randomly appears either on the left or right side of the board was added.
For each hit on the Space Invader the player with the last paddle contact receives a point and the Invader is reset.

Invader bounces balls back similarly to a paddle and resets when the ball is out of bounds.

I have unfortunately no idea why the introduction text is not portrayed. I have run out of ideas.

with best regards
Matthias Kostwein

 */


var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,

    dashSize: 5,

    paddleLeft_x: 50,
    paddleRight_x: 590,

    ballVelocity: 500,
    ballStartDelay: 2,
    invaderVelocity: 200,
    invaderStartDelay:4,
    invaderResetDelay:2,
    paddleVelocity: 600,
    invaderRandomStartingAngle: [-90, 90],
    invaderRandomStartingSide: [280, 360],
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    paddleSegmentsMax: 4,
    paddleSegmentHeight: 4,
    paddleSegmentAngle: 15,
    invaderSegmentsMax: 4,
    invaderSegmentHeight: 2,
    invaderSegmentAngle: 15,

    scoreToWin: 11,
    paddleTopGap: 22,

    ballVelocityIncrement: 25,
    ballReturnCount: 4,
    ballHitNote: 'none',

};

var graphicAssets = {
    ballURL: 'assets/ball.png',
    ballName: 'ball',

    paddleURL: 'assets/paddle.png',
    paddleName: 'paddle',

    invaderURL: 'assets/invader.png',
    invaderName: 'invader',
};

var soundAssets = {
    ballBounceURL: 'assets/ballBounce',
    ballBounceName: 'ballBounce',

    ballHitURL: 'assets/ballHit',
    ballHitName: 'ballHit',

    ballMissedURL: 'assets/ballMissed',
    ballMissedName: 'ballMissed',

    mp4URL: '.m4a',
    oggURL: '.ogg'
};

var fontAssets = {
    scoreLeft_x: gameProperties.screenWidth * 0.25,
    scoreRight_x: gameProperties.screenWidth * 0.75,
    scoreTop_y: 10,

    scoreFontStyle:{font: '80px Arial', fill: '#FFFFFF', align: 'center'},
    instructionsFontStyle:{font: '24px Arial', fill: '#FFFFFF', align: 'center'},
};

var labels = {
    instructions: 'Left paddle: A to move up, Y to move down.nnRight paddle: UP and DOWN arrow keys.nn- click to start -',
    winner: 'Winner!',
};

var mainState = function(game) {
    this.backgroundGraphics;
    this.ballSprite;
    this.paddleLeftSprite;
    this.paddleRightSprite;
    this.paddleGroup;
    this.invaderSprite;

    this.paddleLeft_up;
    this.paddleLeft_down;
    this.paddleRight_up;
    this.paddleRight_down;

    this.missedSide;

    this.scoreLeft;
    this.scoreRight;

    this.tf_scoreLeft;
    this.tf_scoreRight;

    this.sndBallHit;
    this.sndBallBounce;
    this.sndBallMissed;

    this.instructions;
    this.winnerLeft;
    this.winnerRight;
    this.ballVelocity;

    this.ballHitNote;
};

mainState.prototype = {
    preload: function () {
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
        game.load.image(graphicAssets.invaderName, graphicAssets.invaderURL);
        game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL+soundAssets.mp4URL, soundAssets.ballBounceURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL+soundAssets.mp4URL, soundAssets.ballHitURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL+soundAssets.mp4URL, soundAssets.ballMissedURL+soundAssets.oggURL]);
    },

    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.startDemo();

    },

    update: function () {
        this.moveLeftPaddle();
        this.moveRightPaddle();
        game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);
        game.physics.arcade.overlap(this.ballSprite, this.invaderSprite, this.collideWithInvader, null, this);

    },

    initGraphics: function () {
        this.backgroundGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);

        for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
            this.backgroundGraphics.moveTo(game.world.centerX, y);
            this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
        }

        this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
        this.ballSprite.anchor.set(0.5, 0.5);

        this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleLeftSprite.anchor.set(0.5, 0.5);

        this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleRightSprite.anchor.set(0.5, 0.5);

        this.invaderSprite = game.add.sprite(game.rnd.pick(gameProperties.invaderRandomStartingSide),game.world.centerY, graphicAssets.invaderName);
        this.invaderSprite.anchor.set(0.5, 0.5);

        this.tf_scoreLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreLeft.anchor.set(0.5, 0);

        this.tf_scoreRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreRight.anchor.set(0.5, 0);

        this.instructions = game.add.text(game.world.centerX, game.world.centerY, labels.clickToStart, fontAssets.instructionsFontStyle);
        this.instructions.anchor.set(0.5, 0.5);

        this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerLeft.anchor.set(0.5, 0.5);

        this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerRight.anchor.set(0.5, 0.5);

        this.hideTextFields();

    },



    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(this.ballSprite);
        game.physics.enable(this.invaderSprite);

        this.invaderSprite.checkWorldBounds = false;
        this.invaderSprite.body.collideWorldBounds = true;
        this.invaderSprite.body.immovable = true;
        this.invaderSprite.body.bounce.set(1);

        this.ballSprite.checkWorldBounds = true;
        this.ballSprite.body.collideWorldBounds = true;
        this.ballSprite.body.immovable = true;
        this.ballSprite.body.bounce.set(1);
        this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);


        this.paddleGroup = game.add.group();
        this.paddleGroup.enableBody = true;
        this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this.paddleGroup.add(this.paddleLeftSprite);
        this.paddleGroup.add(this.paddleRightSprite);

        this.paddleGroup.setAll('checkWorldBounds', true);
        this.paddleGroup.setAll('body.collideWorldBounds', true);
        this.paddleGroup.setAll('body.immovable', true);
    },

    initKeyboard: function () {
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Y);

        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    },

    initSounds: function () {
        this.sndBallHit = game.add.audio(soundAssets.ballHitName);
        this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
        this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);

    },

    startDemo: function () {
        this.resetBall();
        this.resetInvader();
        this.ballSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
        this.instructions.visible = true;
        this.invaderSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.invaderStartDelay, this.startInvader, this);

        this.enableBoundaries(true);
        this.enablePaddles(false);
        game.input.onDown.add(this.startGame, this);
        this.instructions.visible = true;
    },

    startInvader: function() {
        this.invaderSprite.visible = true;

        var randomAngle2 = game.rnd.pick(gameProperties.invaderRandomStartingAngle);

        game.physics.arcade.velocityFromAngle(randomAngle2, gameProperties.invaderVelocity, this.invaderSprite.body.velocity);

    },

    startBall: function () {
        this.ballVelocity = gameProperties.ballVelocity;
        this.ballReturnCount = 0;
        this.invaderBounceCount =0;
        this.ballSprite.visible = true;
        var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));
        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else if (this.missedSide == 'left') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }
        game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);

    },

    startGame: function () {
        game.input.onDown.remove(this.startGame, this);
        this.enablePaddles(true);
        this.enableBoundaries(false);
        this.resetBall();
        this.resetInvader();
        this.resetScores();
        this.hideTextFields();
        this.instructions.visible = true;
    },

    resetBall: function () {
        this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
        this.ballSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    },

    resetInvader: function () {
        this.invaderSprite.reset(game.rnd.pick(gameProperties.invaderRandomStartingSide),game.world.centerY);
        this.invaderSprite.visible = false;
        this.ballHitNote='none';
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.invaderResetDelay, this.startInvader, this);
    },

    enablePaddles: function (enabled) {
        this.paddleGroup.setAll('visible', enabled);
        this.paddleGroup.setAll('body.enable', enabled);

        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;
        this.paddleLeftSprite.y = game.world.centerY;
        this.paddleRightSprite.y = game.world.centerY;
    },

    enableBoundaries: function (enabled) {
        game.physics.arcade.checkCollision.left = enabled;
        game.physics.arcade.checkCollision.right = enabled;

    },


    moveLeftPaddle: function () {
        if (this.paddleLeft_up.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_down.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleLeftSprite.body.velocity.y = 0;
        }
        if(this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
    },

    moveRightPaddle: function () {
        if (this.paddleRight_up.isDown)
        {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown)
        {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleRightSprite.body.velocity.y = 0;
        }
        if(this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
    },

    collideWithPaddle: function (ball, paddle) {
        var returnAngle;
        var segmentHit = Math.floor((ball.y - paddle.y)/gameProperties.paddleSegmentHeight);

        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }

        if (paddle.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
            this.ballHitNote='left';
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            this.ballHitNote='right';
            if (returnAngle > 180) {
                returnAngle -= 360;
            }
            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
        }
        this.ballReturnCount ++;

        if(this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }
    },

    collideWithInvader: function (ball, invader) {
        var returnAngleI;
        var segmentHitI = Math.floor((ball.y - invader.y)/gameProperties.invaderSegmentHeight);

        if (segmentHitI >= gameProperties.invaderSegmentsMax) {
            segmentHitI = gameProperties.invaderSegmentsMax - 1;
        } else if (segmentHitI <= -gameProperties.invaderSegmentsMax) {
            segmentHitI = -(gameProperties.invaderSegmentsMax - 1);
        }

        if (ball.x > invader.x) {
            returnAngleI = segmentHitI * gameProperties.invaderSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngleI, gameProperties.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngleI = 180 - (segmentHitI * gameProperties.invaderSegmentAngle);
            if (returnAngleI > 180) {
                returnAngleI -= 360;
            }
            game.physics.arcade.velocityFromAngle(returnAngleI, gameProperties.ballVelocity, this.ballSprite.body.velocity);
        }

        if (this.ballHitNote=='left'){
            this.scoreLeft++;
        }
        else if (this.ballHitNote=='right') {
            this.scoreRight++;
        }
        this.updateScoreTextFields();

        if (this.scoreLeft >= gameProperties.scoreToWin || this.scoreRight >= gameProperties.scoreToWin) {
            this.startDemo();
        } else {
            this.resetInvader();
        }
    },

    ballOutOfBounds: function () {
        if (this.ballSprite.x < 0) {
            this.missedSide = 'left';
            this.scoreRight++;
        } else if (this.ballSprite.x > gameProperties.screenWidth) {
            this.missedSide = 'right';
            this.scoreLeft++;
        }
        this.updateScoreTextFields();

        if (this.scoreLeft >= gameProperties.scoreToWin) {
            this.winnerLeft.visible = true;
            this.startDemo();
        } else if (this.scoreRight >= gameProperties.scoreToWin) {
            this.winnerRight.visible = true;
            this.startDemo();
        }

        if (this.scoreLeft >= gameProperties.scoreToWin || this.scoreRight >= gameProperties.scoreToWin) {
            this.startDemo();
        } else {
            this.resetBall();
        }

        this.ballHitNote='none';
        this.resetInvader();
    },

    resetScores: function () {
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.updateScoreTextFields();
    },

    updateScoreTextFields: function () {
        this.tf_scoreLeft.text = this.scoreLeft;
        this.tf_scoreRight.text = this.scoreRight;
    },

    hideTextFields: function () {
        this.instructions.visible = true;
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');