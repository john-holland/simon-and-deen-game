$(function() {
    var myGame = new Phaser.Game(this, 'gameStage', 800, 600, init, create, update);
    
    function init() {
        myGame.world.setSize(6000, 600);
        
        myGame.loader.addImageFile('tree', 'assets/packed_textures/environment/tree.png');
        myGame.loader.addImageFile('funghost', 'assets/packed_textures/environment/smallwizghost.png');
        myGame.loader.addTextureAtlas('dad', 'assets/packed_textures/dad/dad.png', 'assets/packed_textures/dad/dad.json');
        myGame.loader.addTextureAtlas('deen', 'assets/packed_textures/deen/deen.png', 'assets/packed_textures/deen/deen.json');
        myGame.loader.addTextureAtlas('environment', 'assets/packed_textures/environment/environment.png', 'assets/packed_textures/environment/environment.json');
        myGame.loader.addTextureAtlas('monster', 'assets/packed_textures/monster/monster.png', 'assets/packed_textures/monster/monster.json');
        myGame.loader.addTextureAtlas('simon', 'assets/packed_textures/simon/simon.png', 'assets/packed_textures/simon/simon.json');
        myGame.loader.addImageFile('blood', 'assets/packed_textures/monster/blood.png');
        
        myGame.loader.load();
    }
    var cam2;
    var sleepingDad,
        dad, 
        simon, 
        deen, 
        axe, 
        bed, 
        trees, 
        logs, 
        brokenBedroomDoor,
        brokenFrontDoor,
        table, 
        leftStool, 
        rightStool, 
        cabinInterior,
        cabinCeiling,
        cabinDoor,
        ground,
        groundColliders,
        fatherColliders,
        axeColliders,
        monsterColliders,
        doorTestRect,
        treesScrollZone,
        treesScrollZone2,
        emitter,
        funghost,
        people;
    var nonCutLogs = [];
    var cutLogs = [];
        
    
    function create() {
        groundColliders = myGame.createGroup();
        fatherColliders = myGame.createGroup();
        people = myGame.createGroup();
        
        treesScrollZone = myGame.createScrollZone('tree', 0, 100, 6000, 500);
        treesScrollZone2 = myGame.createScrollZone('tree', 50, 100, 6000, 500);
        
        ground = myGame.createGeomSprite(-10, 600);//(6000, 100);
        ground.createRectangle(6000, 50);
        ground.immovable = true;
        ground.solid = true;
                            
        logs = myGame.createGroup();
        var logAmount = 25;
        var logXOffset = 1000;
        var logInterval = Math.floor((6000 - logXOffset) / logAmount);
        
        for (var i = 0; i < 100; i++) {
            var log = myGame.createSprite(0, 0, 'environment');
            log.frameName = 'branch.png';
            log.x = (logInterval * i) + logXOffset;
            log.y = (myGame.world.bounds.height - log.height - 20); 
            log.immovable = true;
            log.solid = true;
            log.logCuts = 0;
            logs.add(log);
            nonCutLogs.push(log);
        }
        
        //we need to reverse this as we actually want a queue of logs.
        nonCutLogs.reverse();
        
        cabinInterior = myGame.createSprite(0, 0, 'environment');
        cabinInterior.frameName = 'cabin_interior.png';
        cabinInterior.x = 0;
        cabinInterior.y = myGame.world.bounds.height - cabinInterior.height;
        
        cabinCeiling = myGame.createGeomSprite(0, cabinInterior.y - 20);
        cabinCeiling.createRectangle(cabinInterior.width, 20);
        cabinCeiling.immovable = true;
        cabinCeiling.visible = false;
        fatherColliders.add(cabinCeiling);
        
        cabinRoof = myGame.createSprite(0, 0, 'environment');
        cabinRoof.frameName = 'cabin_top.png';
        cabinRoof.x = 0;
        cabinRoof.y = cabinInterior.y - cabinRoof.height;
        
        //This would have been the optimal solution, but oh well, it had broken collision on the right and i couldn't figure out a fix, i'll submit a bug later
        //Instead I'm going to make a containDad bool that will bar him from > 100
        // cabinDoor = myGame.createGeomSprite(505, cabinInterior.y + 10);
        // cabinDoor.createRectangle(30, cabinInterior.height - 20);
        // cabinDoor.immovable = false;
        // cabinDoor.mass = 100000;
        // this.allowCollisions = Phaser.Collision.NONE;
        // //cabinDoor.visible = false;
        // fatherColliders.add(cabinDoor);
        
        brokenBedroomDoor = myGame.createSprite(0, 0, 'environment');
        brokenBedroomDoor.frameName = 'broken_door.png';
        brokenBedroomDoor.x = 113;
        brokenBedroomDoor.y = cabinInterior.y + 40;
        brokenBedroomDoor.visible = false;
        //brokenBedroomDoor.moves = false;
        
        table = myGame.createSprite(48, 17, 'environment');
        table.frameName = 'table.png';
        table.x = cabinInterior.x + 175;
        table.y = myGame.world.bounds.height - table.height;
        groundColliders.add(table);
        fatherColliders.add(table);
        
        leftStool = myGame.createSprite(10, 12, 'environment');
        leftStool.frameName = 'stool.png';
        leftStool.x = table.x - leftStool.width - 5;
        leftStool.y = myGame.world.bounds.height - leftStool.height;
        groundColliders.add(leftStool);
        fatherColliders.add(leftStool);
        
        rightStool = myGame.createSprite(10, 12, 'environment');
        rightStool.frameName = 'stool.png';
        rightStool.x = table.x + table.width + 5;
        rightStool.y = myGame.world.bounds.height - rightStool.height;
        groundColliders.add(rightStool);
        fatherColliders.add(rightStool);
        
        bed = myGame.createSprite(53, 17, 'environment');
        bed.frameName = 'bed.png';
        bed.x = cabinInterior.x + 15;
        bed.y = myGame.world.bounds.height - bed.height;
        
        //create dad
        dad = myGame.createSprite(64, 64, 'dad');
        dad.animations.add('idle', [ 'dad_idle_1.png', 'dad_idle_2.png', 'dad_idle_3.png', 'dad_idle_4.png', 'dad_idle_4.png', 'dad_idle_3.png', 'dad_idle_2.png', 'dad_idle_1.png' ], 5, true, false);
        dad.animations.add('run', [ 'dad_run_1.png', 'dad_run_2.png', 'dad_run_3.png', 'dad_run_4.png', 'dad_run_4.png', 'dad_run_3.png', 'dad_run_2.png', 'dad_run_1.png' ], 10, true, false);
        dad.name = 'dad';
        dad.visible = false;
        dad.animations.play('idle', 5, true);
        dad.setBounds(0, 0, myGame.world.bounds.width, 534);
        dad.solid = true;
        groundColliders.add(dad);
        people.add(dad);
        
        //create the sleeping dad prop
        sleepingDad = myGame.createSprite(90, 41, 'dad');
        sleepingDad.animations.add('fitfull_sleep', [ 'dad_fitfull_sleep_1.png', 'dad_fitfull_sleep_2.png', 'dad_fitfull_sleep_3.png', 'dad_fitfull_sleep_3.png', 'dad_fitfull_sleep_2.png', 'dad_fitfull_sleep_1.png' ], 
        10, true, false);
        sleepingDad.animations.add('idle_sleep', [ 'dad_idle_sleep_1.png', 'dad_idle_sleep_2.png', 'dad_idle_sleep_3.png', 'dad_idle_sleep_4.png', 'dad_idle_sleep_4.png', 'dad_idle_sleep_3.png', 'dad_idle_sleep_2.png', 'dad_idle_sleep_2.png' ], 
        10, true, false);
        sleepingDad.name = 'sleepingDad';
        sleepingDad.x = bed.x;
        sleepingDad.y = bed.y - (sleepingDad.height / 1.5);
        
        sleepingDad.visible = true;
        sleepingDad.animations.play('idle_sleep', 3, true);
        
        dad.x = sleepingDad.x;
        dad.y = sleepingDad.y - 20; //he starts hidden anyways, i just want to raise him up a bit so he doesn't clip into the floor on spawn
        
        //create simon -- red!
        simon = myGame.createSprite(64, 64, 'simon');
        simon.animations.add('idle', [ 'simon_idle_1.png', 'simon_idle_2.png', 'simon_idle_3.png', 'simon_idle_4.png', 'simon_idle_4.png', 'simon_idle_3.png', 'simon_idle_2.png', 'simon_idle_1.png' ], 5, true, false);
        simon.animations.add('run', [ 'simon_run_1.png', 'simon_run_2.png', 'simon_run_3.png', 'simon_run_3.png', 'simon_run_2.png', 'simon_run_1.png' ], 5, true, false);
        simon.animations.add('idle_jump', [ 'simon_idle_jump_1.png', 'simon_idle_jump_2.png', 'simon_idle_jump_3.png' ], 5, true, false);
        simon.animations.add('run_jump', [ 'simon_run_2.png', 'simon_run_3.png' ], 5, true, false);
        simon.animations.add('run_jumping', [ 'simon_run_jumping.png' ], 5, true, false);
        simon.animations.add('idle_jumping', [ 'simon_idle_jump_in_air.png' ], 5, true, false);
        simon.animations.add('sitting_on_stool', [ 'simon_sitting_on_stool.png' ], 5, true, false);
        simon.name = 'simon';
        simon.animations.play('sitting_on_stool', 5, true);
        simon.x = leftStool.x;
        simon.y = leftStool.y + leftStool.height - 42; //the sitting height isn't working properly so i'll just have to use pixel height... ugh
        simon.setBounds(0, 300, myGame.world.bounds.width, 300);
        simon.active = true;
        simon.solid = true;
        //we may need to add simon and deen to the ground colliders group after they switch from sitting to standing if that doesnt' play nicely...
        groundColliders.add(simon);
        people.add(simon);
        
        //create deen -- blue!
        deen = myGame.createSprite(64, 64, 'deen');
        deen.animations.add('idle', [ 'deen_idle_1.png', 'deen_idle_2.png', 'deen_idle_3.png', 'deen_idle_4.png', 'deen_idle_4.png', 'deen_idle_3.png', 'deen_idle_2.png', 'deen_idle_1.png' ], 5, true, false);
        deen.animations.add('run', [ 'deen_run_1.png', 'deen_run_2.png', 'deen_run_3.png', 'deen_run_3.png', 'deen_run_2.png', 'deen_run_1.png' ], 5, true, false);
        deen.animations.add('idle_jump', [ 'deen_idle_jump_1.png', 'deen_idle_jump_2.png', 'deen_idle_jump_3.png' ], 5, true, false);
        deen.animations.add('run_jump', [ 'deen_run_2.png', 'deen_run_3.png' ], 5, true, false);
        deen.animations.add('run_jumping', [ 'deen_run_jumping.png' ], 5, true, false);
        deen.animations.add('idle_jumping', [ 'deen_idle_jump_in_air.png' ], 5, true, false);
        deen.animations.add('sitting_on_stool', [ 'deen_sitting_on_stool.png', 'deen_sitting_on_stool.png' ], 5, true, false);
        deen.name = 'deen';
        deen.animations.play('sitting_on_stool', 5, true);
        deen.x = rightStool.x - rightStool.width;
        deen.y = rightStool.y + rightStool.height - 42; //the sitting height isn't working properly so i'll just have to use pixel height... ugh
        deen.setBounds(0, 300, myGame.world.bounds.width, 300);
        deen.active = true;
        deen.solid = true;
        groundColliders.add(deen);
        people.add(deen);
        
        //create the MONSTER!!
        monster = myGame.createSprite(64, 64, 'monster');
        monster.animations.add('idle', [ 'monster_idle_1.png', 
                                         'monster_idle_2.png', 
                                         'monster_idle_3.png', 
                                         'monster_idle_4.png',
                                         'monster_idle_4.png', 
                                         'monster_idle_3.png', 
                                         'monster_idle_2.png', 
                                         'monster_idle_1.png'], 5, true, false);
        monster.animations.add('run', [ 'monster_run_1.png', 
                                        'monster_run_2.png', 
                                        'monster_run_3.png', 
                                        'monster_run_4.png', 
                                        'monster_run_5.png',
                                        'monster_run_5.png', 
                                        'monster_run_4.png', 
                                        'monster_run_3.png', 
                                        'monster_run_2.png', 
                                        'monster_run_1.png'], 5, true, false);
                                        
        (function() {
            var monsterDeathAnimNameArray = [];
            for (var i = 1; i <= 40; i++) {
                monsterDeathAnimNameArray.push("monster_death_" + i.toString() + ".png");
            }
            
            monster.animations.add('death', monsterDeathAnimNameArray, 6, true, false);
        })();
        monster.animations.add('chew', [ 'monster_chew_1.png', 'monster_chew_2.png', 'monster_chew_3.png', 'monster_chew_4.png', 'monster_chew_5.png', 'monster_chew_6.png', 'monster_chew_7.png', 'monster_chew_8.png', 'monster_chew_9.png', 'monster_chew_10.png', 'monster_chew_11.png', 'monster_chew_12.png' ], 5, true, false);
        monster.animations.add('chew_blood', [ 'monster_chew_blood_1.png', 'monster_chew_blood_2.png', 'monster_chew_blood_3.png', 'monster_chew_blood_4.png', 'monster_chew_blood_5.png', 'monster_chew_blood_6.png', 'monster_chew_blood_7.png', 'monster_chew_blood_8.png', 'monster_chew_blood_9.png', 'monster_chew_blood_10.png', 'monster_chew_blood_11.png', 'monster_chew_blood_12.png' ], 5, true, false);
        monster.name = 'monster';
        monster.animations.play('run', 5, true);
        monster.x = cabinInterior.x + cabinInterior.width + 50;
        monster.y = cabinInterior.y + cabinInterior.height - monster.height - 10; 
        
        groundColliders.add(deen);
        
        axe = myGame.createSprite(12, 32, 'environment');
        axe.frameName = 'axe.png';
        axe.x = cabinInterior.x + 85;
        axe.y = cabinInterior.y + cabinInterior.height - axe.height - 5;
        axe.rotation = 180;
                            
        //the front door that the monster breaks down.
        brokenFrontDoor = myGame.createSprite(0, 0, 'environment');
        brokenFrontDoor.frameName = 'broken_door.png';
        brokenFrontDoor.flipped = true;
        brokenFrontDoor.x = cabinInterior.width - 12;
        brokenFrontDoor.y = cabinInterior.y + 40;
        brokenFrontDoor.visible = false;
        
        myGame.camera.setPosition(0, 0);
        myGame.camera.setSize(800, 300);
        myGame.camera.setBounds(0, 300, 6000, 300);
        //myGame.camera.showBorder = true;
        myGame.camera.borderColor = 'rgb(255,0,0)';
        
        cam2 = myGame.createCamera(0, 300, 800, 300);
        //cam2.transparent = false;
        //cam2.backgroundColor = 'rgb(20,20,20)';
        //cam2.showBorder = true;
        cam2.borderColor = 'rgb(255,255,0)';
        cam2.setBounds(0, 300, 6000, 300);                    
        
        //now that we have the peeps, we should follow them
        myGame.camera.follow(simon, Phaser.Camera.STYLE_PLATFORMER); //sucks for deen, the camera follows simon... i may go and add an alternate follow style
        
        //Here we'll set our own custom deadzone which is 64px smaller than the stage size on all sides
        myGame.camera.deadzone = new Phaser.Rectangle(64, 64, myGame.stage.width - 128, myGame.stage.height - 128);
        
        //now that we have the peeps, we should follow them
        cam2.follow(dad, Phaser.Camera.STYLE_PLATFORMER); //sucks for deen, the camera follows simon... i may go and add an alternate follow style
        
        //  Here we'll set our own custom deadzone which is 64px smaller than the stage size on all sides
        //cam2.deadzone = new Phaser.Rectangle(64, 64, myGame.stage.width - 128, myGame.stage.height - 128);
             //we also can see what happened in the past or future if we touch you or a banana that you touched, or something
            
        funghost = myGame.createSprite(0, 0, 'funghost');
        funghost.x = 6000 - funghost.width;
        funghost.y = 600 - funghost.height;
        funghost.flipped = true;
        
        emitter = myGame.createEmitter(0, 0);
        emitter.gravity = 200;
        emitter.bounce = 0.9;
        emitter.makeParticles('blood', 500, 0, false, 0);
    }
    
    var dadIsAlive = true;
    var dadsAwake = false;
    var isSleepingFitfully = false;
    var fitfullSleepAmount = 30;
    var dadVelocity = 100;
    var containDad = true;
    var dadWieldingAxe = false;
    var isAttacking = false;
    var axeTweeningToDad = false;
    var gravityVelocity = 50;
    
    var upWasDown = false;
    var leftWasDown = false;
    var rightWasDown = false;
    
    var lastKickedTime = 0;
    var hitLogThisAttack = false;
    
    var simonIsAlive = true;
    var simonVelocity = 80;
    var aWasDown = false;
    var dWasDown = false;
    var wWasDown = false;
    
    var deenIsAlive = true;
    var deenVelocity = 80;
    var lWasDown = false;
    var pWasDown = false;
    var quotesWasDown = false;
    
    var cutsceneEnded = false;
    var cutsceneStarted = false;
    var brothersVelocity = 80;
    
    //the monster will just move forward without hitting the stumps
    var monsterIsAlive = true;
    var monsterVelocity = 75;
    var monsterIsChasingSimon = false;
    var monsterIsChasingDeen = false;
    var monsterIsFleeingDad = false;
    var monsterIsChasingDad = false;
    var monsterStartedEating = 0;

    function update() {
        var upIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.UP);
        var leftIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        var rightIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
        
        var wIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.W);
        var aIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.A);
        var dIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.D);
        
        var lIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.L);
        var pIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.P);
        var quotesIsDown = myGame.input.keyboard.isDown(Phaser.Keyboard.QUOTES);
        
        //myGame.collide(ground, groundColliders);
        myGame.collide(dad, fatherColliders);
        
        if (!cutsceneEnded) {
            if (!cutsceneStarted) {
                monster.animations.currentAnim.stop();
                monster.animations.play('run', 6, true);
            
            myGame.createTween(monster).to({
                x: brokenFrontDoor.x + brokenFrontDoor.width
            }, 150, Phaser.Easing.Linear.Out, true)
                .onComplete.add(function() {
                    brokenFrontDoor.visible = true;
                    myGame.createTween(monster).to({
                        x: table.x + table.width
                    }, 150, Phaser.Easing.Linear.Out, true)
                        .onComplete.add(function() {
                            //monster runs up and pushes the table against the door
                            myGame.createTween(table).to({
                                x: brokenBedroomDoor.x - 10,
                                y: brokenBedroomDoor.y + brokenBedroomDoor.height / 2 + 10,
                                rotation: 30
                            }, 300, Phaser.Easing.Linear.Out, true);
                            
                            myGame.createTween(monster).to({
                                x: brokenBedroomDoor.x + 20
                            }, 300, Phaser.Easing.Linear.Out, true)
                                .onComplete.add(function() {
                                    monster.flipped = true;
                                    
                                    //the boys run out...
                                    simon.animations.stop('sitting_on_stool');
                                    simon.animations.play('run', 10, true);
                                    deen.animations.stop('sitting_on_stool');
                                    deen.animations.play('run', 10, true);
                                    
                                    simon.setBounds(0, 300, myGame.world.bounds.width, 240);
                                    deen.setBounds(0, 300, myGame.world.bounds.width, 240);
                                    
                                    myGame.createTween(simon).to({
                                        x: 500
                                    }, 1500, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                                       //show text... 
                                        //simon.animations.currentAnim.stop();
                                        //simon.animations.play('run', 6, true);
                                    });
                                    
                                    myGame.createTween(deen).to({
                                        x: 550
                                    }, 1500, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                                       //show text... 
                                        //deen.animations.currentAnim.stop();
                                        //deen.animations.play('idle', 6, true);
                                        
                                        cutsceneEnded = true;
                                        
                                        monster.animations.currentAnim.stop();
                                        monster.animations.play('chew', 6, true);
                                        myGame.createTween(monster).to({
                                            x:brokenFrontDoor.x
                                        }, 5000, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                                            monster.animations.play('run', 6, true);
                                            monsterIsChasingSimon = true;
                                        })
                                        
                                        $("#simonAndDeenMessages").text("RUN! Simon(red): Left=A Right=D Jump=W - Deen(blue): Left=L, Right=\", Jump=P");
                                        $("#dadMessages").text("WAKE UP! Cause Dad to sleep fitfully: Left / Right rapidly")
                                    });
                                });
                        });
                });
                cutsceneStarted = true;
            }
            return;
        }

        //dad!
        if (dadIsAlive) {
            if (!dadsAwake) {
                //if dads not awake, then do the fitful sleep thang
                if (fitfullSleepAmount < 0) {
                    $("#dadMessages").text("Pickup that axe, get out of the cabin and kill the monster! Left=Left Arrow, Right=Right Arrow, Jump=Up, Axe=Enter")
                    dadsAwake = true;
                    
                    //kick off thunderAndLightning when the dad wakes up!
                    //thunderAndLightning();
                    dad.visible = true;
                    sleepingDad.visible = false;
                } else {
                    var kicked = false;
                    if(!leftWasDown && leftIsDown) {
                        kicked = true;
                    }
                    
                    if(!rightWasDown && rightIsDown) {
                        kicked = true;
                    }
                    
                    if (kicked) {
                        fitfullSleepAmount = fitfullSleepAmount - 1;
                        lastKickedTime = myGame.time.now;
                        if (!isSleepingFitfully) {
                            isSleepingFitfully = true;
                            sleepingDad.animations.currentAnim.stop();
                            sleepingDad.animations.play('fitfull_sleep', 3, true);
                        }
                    }
                    
                    if (isSleepingFitfully && !kicked && (myGame.time.now - lastKickedTime) > 500) {
                        //they haven't been pressing left or right, revert to idle_sleep
                        sleepingDad.animations.currentAnim.stop();
                        sleepingDad.animations.play('idle_sleep', 3, true);
                        isSleepingFitfully = false;
                        
                        //i'd like to add a random, very small amount of sleep if they haven't been kicking...
                        fitfullSleepAmount = fitfullSleepAmount + 5;
                    }
                }
            } else {
                if (containDad) {
                    if (dad.x > 53) {
                        dad.x = 53;
                    }
                    
                    if (isAttacking && dad.x > 45 && !dad.flipped) {
                        containDad = false;
                        brokenBedroomDoor.active = true;
                        brokenBedroomDoor.visible = true;
                    }
                } else {
                    myGame.collide(dad, logs);
                }
                
                if (!dadWieldingAxe && !axeTweeningToDad && myGame.collide(dad, axe, function() {
                    myGame.createTween(axe)
                        .to({
                            y: dad.y + (dad.height / 2) - axe.height,
                            x: dad.x + (dad.width / 2) + axe.width,
                            rotation: 0
                        }, 500, Phaser.Easing.Quartic.Out, true)
                        .onComplete.add(function() {
                            dadWieldingAxe = true;
                            axeTweeningToDad = true;
                        });
                })) {
                    axeTweeningToDad = true;
                } else if (dadWieldingAxe) {
                    axe.y = dad.y + (dad.height / 2) - axe.height;
                    axe.x = dad.x + (dad.width / 2) + (dad.flipped ? -(axe.width * 1.5) : axe.width * 2.2);
                    axe.flipped = dad.flipped;
                    
                    if (!isAttacking && myGame.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
                        isAttacking = true;
                        myGame.createTween(axe)
                            .to({
                                rotation: dad.flipped ? -120 : 120
                            }, 400, Phaser.Easing.Exponential.Out, true)
                            .onComplete.add(function() { 
                                axe.rotation = 0;
                                isAttacking = false;
                                hitLogThisAttack = false;
                            });
                    } else if (isAttacking) {
                        //attack!
                        if (nonCutLogs.length > 0) {
                            var log = nonCutLogs[nonCutLogs.length - 1];
                            
                            if (!hitLogThisAttack && log.x - (dad.x + dad.width) < 30) {
                                //we're near enough to cut the log
                                hitLogThisAttack = true;
                                //play thwack sound
                                log.logCuts++;
                                
                                if (log.logCuts > 2) {
                                    log.frameName = 'broken_stump.png';
                                    log.isActive = false;
                                    log.solid = false;
                                    cutLogs.push(nonCutLogs.pop());
                                }
                            }
                        }
                        
                        //attempt to kill the monster!
                        if (monsterIsAlive && axe.overlaps(monster, false)) {
                            monster.animations.currentAnim.stop();
                            monster.velocity.x = 0;
                            monster.animations.play('death', 6, false);
                            monster.animations.currentAnim.onCompleteSignal.add(function(anim) {
                                monster.visible = false;
                                emitter.x = monster.x + monster.height / 2;
                                emitter.y = monster.y + monster.width / 2;
                                emitter.gravity = 200;
                                emitter.start(true, 1, 0, 0);
                            });
                            monsterIsAlive = false;
                            
                        }
                        
                        if (axe.overlaps(funghost, false)) {
                            window.location.href = "http://funghost.com";
                        }
                    }
                    
                    if (nonCutLogs.length > 0) {
                            var blockingLog = nonCutLogs[nonCutLogs.length - 1];
                            
                            if (dad.x + dad.width > blockingLog.x) {
                                dad.x = blockingLog.x - dad.width;
                            }
                    }
                }
                
                if(leftIsDown) {
                    if (!leftWasDown) {
                        dad.animations.currentAnim.stop();
                        dad.animations.play('run', 10, true);
                        dad.flipped = true;
                    }
                    
                    if (dad.velocity.x > -dadVelocity) {
                        dad.velocity.x -= 10;   
                    } else if (dad.velocity.x > dadVelocity) {
                        dad.velocity.x = -dadVelocity;
                    }
                } else {
                    if (dad.velocity.x < 0) {
                        dad.velocity.x = 0;
                    }
                }
                
                if(rightIsDown) {
                    if (!rightWasDown) {
                        dad.animations.currentAnim.stop();
                        dad.animations.play('run', 10, true);
                        dad.flipped = false;
                    }
                    
                    if (dad.velocity.x < dadVelocity) {
                        dad.velocity.x += 10;   
                    } else if (dad.velocity.x > dadVelocity) {
                        dad.velocity.x = dadVelocity;
                    }
                } else {
                    if (dad.velocity.x > 0) {
                        dad.velocity.x = 0;
                    }
                }
                
                if (!rightIsDown && !leftIsDown &&
                    dad.animations.currentAnim.name !== 'idle') {
                    dad.animations.currentAnim.stop();
                    dad.animations.play('idle', 3, true);
                }
                
                if(upIsDown && !upWasDown && 534 - dad.y < 2) {
                    dad.velocity.y = -50;
                }
                
                if (dad.velocity.y < gravityVelocity) {
                    dad.velocity.y += 2;
                } else {
                    dad.velocity.y = gravityVelocity;
                }
            }
        }
        
        //simon!
        if (simonIsAlive) {
            myGame.collide(simon, logs);
            myGame.collide(simon, fatherColliders);
            
            if(aIsDown) {
                if (!aWasDown) {
                    simon.animations.currentAnim.stop();
                    simon.animations.play('run', 10, true);
                    simon.flipped = true;
                }
                
                if (simon.velocity.x > -simonVelocity) {
                    simon.velocity.x -= 10;   
                } else if (simon.velocity.x > simonVelocity) {
                    simon.velocity.x = -simonVelocity;
                }
            } else {
                if (simon.velocity.x < 0) {
                    simon.velocity.x = 0;
                }
            }
            
            if(dIsDown) {
                if (!dWasDown) {
                    simon.animations.currentAnim.stop();
                    simon.animations.play('run', 10, true);
                    simon.flipped = false;
                }
                
                if (simon.velocity.x < simonVelocity) {
                    simon.velocity.x += 10;   
                } else if (simon.velocity.x > simonVelocity) {
                    simon.velocity.x = simonVelocity;
                }
            } else {
                if (simon.velocity.x > 0) {
                    simon.velocity.x = 0;
                }
            }
            
            if (!dIsDown && !aIsDown &&
                simon.animations.currentAnim.name !== 'idle') {
                simon.animations.currentAnim.stop();
                simon.animations.play('idle', 3, true);
            }
            
            if(wIsDown && (540 - simon.y) < 2) {
                simon.velocity.y = -150;
            }
            
            if (simon.velocity.y < gravityVelocity) {
                simon.velocity.y += 4;
            } else {
                simon.velocity.y = gravityVelocity;
            }
        }
        
        //deen!
        if (deenIsAlive) {
            myGame.collide(deen, logs);
            myGame.collide(deen, fatherColliders);
            
            if(lIsDown) {
                if (!lWasDown) {
                    deen.animations.currentAnim.stop();
                    deen.animations.play('run', 10, true);
                    deen.flipped = true;
                }
                
                if (deen.velocity.x > -deenVelocity) {
                    deen.velocity.x -= 10;   
                } else if (deen.velocity.x > deenVelocity) {
                    //deen.velocity.x = -deenVelocity;
                }
            } else {
                if (deen.velocity.x < 0) {
                    deen.velocity.x = 0;
                }
            }
            
            if(quotesIsDown) {
                if (!quotesWasDown) {
                    deen.animations.currentAnim.stop();
                    deen.animations.play('run', 10, true);
                    deen.flipped = false;
                }
                
                if (deen.velocity.x < deenVelocity) {
                    deen.velocity.x += 10;   
                } else if (deen.velocity.x > deenVelocity) {
                    //deen.velocity.x = deenVelocity;
                }
            } else {
                if (deen.velocity.x > 0) {
                    deen.velocity.x = 0;
                }
            }
            
            if (!quotesIsDown && !lIsDown &&
                deen.animations.currentAnim.name !== 'idle') {
                deen.animations.currentAnim.stop();
                deen.animations.play('idle', 3, true);
            }
            
            if(pIsDown && (540 - deen.y) < 2) {
                deen.velocity.y = -150;
            }
            
            if (deen.velocity.y < gravityVelocity) {
                deen.velocity.y += 4;
            } else {
                //deen.velocity.y = gravityVelocity;
            }
        }
        
        //monster!
        if (monsterIsAlive) {
            if (myGame.time.now - monsterStartedEating < 2000) {
                
            } else {
                var monsterIsEating = false;
                if (monsterIsChasingSimon && monster.overlaps(simon, false)) {
                    simonIsAlive = false;
                    simon.visible = false;
                    monsterIsEating = true;
                    monsterIsChasingSimon = false;
                    monsterIsChasingDeen = true;
                    myGame.createTween(monster).to({
                        x: simon.x + (simon.width / 2) - (monster.width / 2)
                    }, 200, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                        simon.visible = false;
                    });
                    myGame.camera.follow(deen, Phaser.Camera.STYLE_PLATFORMER);
                } else if (monsterIsChasingDeen && monster.overlaps(deen, false)) {
                    deenIsAlive = false;
                    deen.visible = false;
                    monsterIsEating = true;
                    monsterIsChasingDad = true;
                    monsterIsChasingDeen = false;
                    myGame.createTween(monster).to({
                        x: deen.x + (deen.width / 2) - (deen.width / 2)
                    }, 200, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                        deen.visible = false;
                    });
                } else if (monsterIsChasingDad && monster.overlaps(dad, false)) {
                    //end state!
                    dadIsAlive = false;
                    sleepingDad.visible = false;
                    monsterIsEating = true;
                    myGame.createTween(monster).to({
                        x: dad.x + (dad.width / 2) - (dad.width / 2)
                    }, 200, Phaser.Easing.Linear.Out, true).onComplete.add(function() {
                        dad.visible = false;
                    });
                }
                
                if (!monsterIsEating) {
                    if (monster.animations.currentAnim.name !== 'run') {
                        monster.animations.currentAnim.stop();
                        monster.animations.play("run", 6, true);
                    }
                }
                
                var target = null;
                
                if (monsterIsEating) {
                    monster.velocity.x = 0;
                    monsterStartedEating = myGame.time.now;
                    monster.animations.currentAnim.stop();
                    monster.animations.play("chew_blood", 6, true);
                } else if (monsterIsChasingSimon && simonIsAlive) {
                    target = simon;
                } else if (monsterIsChasingDeen && deenIsAlive) {
                    target = deen;
                } else if (monsterIsChasingDad && dadIsAlive) {
                    target = dad;
                }
                
                if (target !== null) {
                    if (target.x < monster.x) {
                        monster.flipped = false;
                    } else {
                        monster.flipped = true;
                    }
                    
                    if (!monster.flipped && monster.velocity.x > -monsterVelocity) {
                        monster.velocity.x -= 2;
                    } else if (!monster.flipped && monster.velocity.x < -monsterVelocity) {
                        monster.velocity.x = -monsterVelocity; 
                    } else if (monster.flipped && monster.velocity.x < monsterVelocity) {
                        monster.velocity.x += 2;
                    } else if (monster.flipped && monster.velocity.x > monsterVelocity) {
                        monster.velocity.x = monsterVelocity; 
                    }
                }
            }
        }
        
        if (simonIsAlive || deenIsAlive || dadIsAlive) {
            myGame.collide(people, people);
            //myGame.collide(simon, people);
            //myGame.collide(deen, people);
        }
        
        if (emitter.on) {
            myGame.collide(emitter, people);
        }
        
        upWasDown = upIsDown;
        leftWasDown = leftIsDown;
        rightWasDown = rightIsDown;
        
        wWasDown = wIsDown;
        aWasDown = aIsDown;
        dWasDown = dIsDown;
        lWasDown = lIsDown;
        pWasDown = pIsDown;
        quotesWasDown = quotesIsDown;
    }
});