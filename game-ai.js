/* =========================================================
   BLUE DEFENDING
========================================================= */

const BLUE_DEFEND_CONTROL_DISTANCE=100;
const BLUE_DEFEND_SWITCH_ADVANTAGE=18;
const BLUE_DEFEND_EMERGENCY_DISTANCE=62;
const BLUE_DEFEND_MANUAL_LOCK=1200;


/* =========================================================
   RED AI
========================================================= */

const RED_DECISION_MIN=0.16;
const RED_DECISION_MAX=0.34;

const RED_CHASE_DISTANCE=520;
const RED_PRESS_DISTANCE=360;

const RED_TACKLE_DISTANCE=48;
const RED_TACKLE_CHANCE=0.13;

const RED_SHOT_MIN_DISTANCE=150;
const RED_SHOT_MAX_DISTANCE=900;

const RED_SHOT_COOLDOWN=0.75;

const RED_LONG_SHOT_DISTANCE=520;

const RED_SHOT_SPEED_MIN=650;
const RED_SHOT_SPEED_MAX=1250;

const RED_SHOT_TARGET_OFFSET=58;


/* =========================================================
   RED PASSING
========================================================= */

const RED_PASS_MIN_DISTANCE=150;
const RED_PASS_MAX_DISTANCE=680;

const RED_PASS_PRESSURE_DISTANCE=190;

const RED_PASS_SAFE_DISTANCE=72;

const RED_PASS_COOLDOWN=1.10;

const RED_PASS_SPEED_MIN=620;
const RED_PASS_SPEED_MAX=900;

const RED_PASS_NORMAL_CHANCE=0.42;
const RED_PASS_FAR_CHANCE=0.55;
const RED_PASS_PRESSURE_CHANCE=0.94;


/* =========================================================
   BLUE AI
========================================================= */

function updateBlueAI(dt){

for(
let i=0;
i<teamPlayers.length;
i++
){

if(i===activePlayerIndex)
continue;


const p=teamPlayers[i];


if(ballOwner===p)
continue;


let targetX=p.anchorX;
let targetY=p.anchorY;


const distToBall=
Math.hypot(
ballX-p.x,
ballY-p.y
);


const redHasBall=
ballOwner &&
ballOwner.team==="red";


if(redHasBall){

if(p.role==="defender"){

if(distToBall<400){

targetX=ballX;
targetY=ballY;

}

}

else if(p.role==="midfielder"){

targetX=clamp(
ballX,
worldWidth*0.30,
worldWidth*0.70
);

targetY=clamp(
ballY,
worldHeight*0.35,
worldHeight*0.65
);

}

else if(p.role==="wing"){

targetX=p.anchorX;
targetY=worldHeight*0.55;

}

else if(p.role==="forward"){

if(distToBall<400){

targetX=ballX;
targetY=ballY;

}

else{

targetX=worldWidth/2;
targetY=worldHeight*0.30;

}

}

else if(p.role==="guard"){

targetX=clamp(
ballX,
worldWidth*0.35,
worldWidth*0.65
);

targetY=worldHeight*0.94;

}

}

else{

if(p.role==="wing"){

targetX=p.anchorX;
targetY=worldHeight*0.35;

}

else if(p.role==="forward"){

targetX=worldWidth/2;
targetY=worldHeight*0.22;

}

else if(p.role==="defender"){

targetX=worldWidth/2;
targetY=worldHeight*0.78;

}

else if(p.role==="midfielder"){

const owner=ballOwner;

if(owner && owner.team==="blue"){

const ownerX=owner.x;
const ownerY=owner.y;

let side=1;

if(ownerX<worldWidth/2){

side=1;

}
else{

side=-1;

}

const PASS_OFFSET_X=150;
const PASS_OFFSET_Y=500;

targetX=
ownerX+
side*PASS_OFFSET_X;

targetY=
ownerY-
PASS_OFFSET_Y;

targetX=clamp(
targetX,
worldWidth*0.15,
worldWidth*0.85
);

targetY=clamp(
targetY,
worldHeight*0.18,
worldHeight*0.62
);

}

else{

targetX=worldWidth/2;
targetY=worldHeight*0.50;

}

}

else if(p.role==="guard"){

targetX=clamp(
ballX,
worldWidth*0.35,
worldWidth*0.65
);

targetY=worldHeight*0.94;

}

}


const dx=targetX-p.x;
const dy=targetY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}

}

}

/* =========================================================
   RED HELPERS
========================================================= */

function resetRedDecisionTimer(p){

p.decisionTimer=
RED_DECISION_MIN+
Math.random()*
(
RED_DECISION_MAX-
RED_DECISION_MIN
);

}


function resetRedShotCooldown(p){

p.shotCooldown=
RED_SHOT_COOLDOWN+
Math.random()*0.35;

}


function resetRedPassCooldown(p){

p.passCooldown=
RED_PASS_COOLDOWN+
Math.random()*0.35;

}


function chooseRedShotType(
p,
distanceToGoal
){

const r=Math.random();


if(
distanceToGoal>
RED_LONG_SHOT_DISTANCE
){

if(r<0.34)
return"long-left";

if(r<0.68)
return"long-right";

return"long-direct";

}


if(r<0.32)
return"direct";

if(r<0.57)
return"diagonal-left";

if(r<0.82)
return"diagonal-right";

return"power";

}

/* =========================================================
   FIND BEST RED PASS
========================================================= */

function findBestRedPass(p){

let bestPlayer=null;
let bestScore=-Infinity;


for(const receiver of opponents){

if(receiver===p)
continue;


const distance=
Math.hypot(
receiver.x-p.x,
receiver.y-p.y
);


if(
distance<RED_PASS_MIN_DISTANCE ||
distance>RED_PASS_MAX_DISTANCE
){

continue;

}


/*
   Ø§ÙÙØ§Ø¹Ø¨ Ø§ÙØ°Ù Ø£ÙØ§Ù Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
   Ø¨Ø§ØªØ¬Ø§Ù ÙØ±ÙÙ Ø§ÙØ£Ø­ÙØ± ÙØ­ØµÙ Ø¹ÙÙ Ø£ÙØ¶ÙÙØ©.

   Ø§ÙØ£Ø­ÙØ± ÙÙØ§Ø¬Ù Ø¨Ø§ØªØ¬Ø§Ù Ø§ÙØ£Ø³ÙÙØ
   ÙØ°ÙÙ y Ø§ÙØ£ÙØ¨Ø± ÙØ¹ÙÙ ØªÙØ¯ÙÙØ§.
*/

const forwardProgress=
clamp(
(receiver.y-p.y)/
RED_PASS_MAX_DISTANCE,
-1,
1
);


const forwardScore=
forwardProgress*190;


/*
   Ø§ÙØªÙØ¯Ù Ø§ÙÙØ¹ÙÙ ÙØ­Ù Ø§ÙÙØ±ÙÙ.
*/

const carrierGoalDistance=
Math.hypot(
worldWidth/2-p.x,
worldHeight-p.y
);

const receiverGoalDistance=
Math.hypot(
worldWidth/2-receiver.x,
worldHeight-receiver.y
);


const goalProgress=
clamp(
carrierGoalDistance-receiverGoalDistance,
-RED_PASS_MAX_DISTANCE,
RED_PASS_MAX_DISTANCE
);


const goalScore=
(goalProgress/RED_PASS_MAX_DISTANCE)*150;


/*
   Ø§ÙÙØ³Ø§ÙØ© Ø¹Ù Ø£ÙØ±Ø¨ ÙØ§Ø¹Ø¨ Ø£Ø²Ø±Ù.
*/

let nearestBlueDistance=Infinity;


for(const blue of teamPlayers){

const d=
Math.hypot(
blue.x-receiver.x,
blue.y-receiver.y
);


if(d<nearestBlueDistance){

nearestBlueDistance=d;

}

}


/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙÙØ³ØªÙØ¨Ù ÙÙØªØµÙÙØ§ ØªÙØ±ÙØ¨ÙØ§
   Ø¨ÙØ§Ø¹Ø¨ Ø£Ø²Ø±ÙØ ÙØ§ ÙØ®ØªØ§Ø±Ù.

   ÙÙÙ ÙØ§ ÙÙÙØ¹ Ø§ÙØªÙØ±ÙØ± Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙØ¶ØºØ·
   Ø´Ø¯ÙØ¯ÙØ§ Ø¹ÙÙ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø© ÙÙØ§ ÙÙØ¬Ø¯
   ÙØ³ØªÙØ¨Ù ÙØ«Ø§ÙÙ.
*/

if(
nearestBlueDistance<RED_PASS_SAFE_DISTANCE
){

continue;

}


const safetyScore=
clamp(
nearestBlueDistance/300,
0,
1
)*170;


/*
   Ø§ÙÙØ³Ø§ÙØ© Ø§ÙÙØ«Ø§ÙÙØ© ÙÙØªÙØ±ÙØ±Ø©.
*/

const idealDistance=390;

const distanceScore=
100-
Math.abs(distance-idealDistance)*0.28;


/*
   ØªÙØ²ÙØ¹ Ø§ÙÙØ§Ø¹Ø¨ÙÙ.

   Ø§ÙØ¬ÙØ§Ø­ ÙØ§ÙÙÙØ§Ø¬Ù ÙÙÙØ¯Ø§Ù ÙÙØªÙØ¯ÙØ
   Ø§ÙÙØ¯Ø§ÙØ¹ Ø®ÙØ§Ø± Ø¢ÙÙØ
   Ø§ÙØ­Ø§Ø±Ø³ Ø£ÙÙ Ø£ÙÙÙÙØ©.
*/

let roleScore=0;


if(receiver.role==="forward")
roleScore=65;

else if(receiver.role==="wing")
roleScore=55;

else if(receiver.role==="defender")
roleScore=20;

else if(receiver.role==="guard")
roleScore=-40;


/*
   ØªØ´Ø¬ÙØ¹ Ø§ÙØªÙØ±ÙØ± Ø§ÙØ¬Ø§ÙØ¨Ù Ø¹ÙØ¯ÙØ§ ÙÙÙÙ
   Ø£ÙØ¶Ù ÙÙ Ø§ÙØªÙØ±ÙØ± Ø§ÙØ¹ÙÙØ¯Ù Ø§ÙÙØ¨Ø§Ø´Ø±.
*/

const horizontalSeparation=
Math.abs(
receiver.x-p.x
);

const horizontalScore=
clamp(
horizontalSeparation/250,
0,
1
)*35;


let score=
forwardScore+
goalScore+
safetyScore+
distanceScore+
roleScore+
horizontalScore;


/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙÙØ³ØªÙØ¨Ù Ø£ÙØ§Ù Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
   Ø¨Ø´ÙÙ ÙØ§Ø¶Ø­Ø ÙØ­ØµÙ Ø¹ÙÙ Ø£ÙØ¶ÙÙØ© Ø¥Ø¶Ø§ÙÙØ©.
*/

if(receiver.y>p.y+80){

score+=75;

}


/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙÙØ³ØªÙØ¨Ù Ø®ÙÙ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
   ÙÙØ§ ÙÙÙØ¹Ù ØªÙØ§ÙÙØ§Ø ÙÙÙ ÙÙÙÙ Ø§ÙØ£ÙÙÙÙØ©.
*/

if(receiver.y<p.y-100){

score-=100;

}


if(score>bestScore){

bestScore=score;
bestPlayer=receiver;

}

}


return{
player:bestPlayer,
score:bestScore
};

}

/* =========================================================
   RED PASS
========================================================= */

function redPass(p,force=false){

if(ballOwner!==p)
return false;


if(
p.passCooldown>0 &&
!force
){

return false;

}


const result=
findBestRedPass(p);


const receiver=
result.player;


if(!receiver)
return false;


let nearestBlueDistance=Infinity;


for(const blue of teamPlayers){

const d=
Math.hypot(
blue.x-p.x,
blue.y-p.y
);


if(d<nearestBlueDistance){

nearestBlueDistance=d;

}

}


const underPressure=
nearestBlueDistance<=
RED_PASS_PRESSURE_DISTANCE;


let passChance=
RED_PASS_NORMAL_CHANCE;


if(underPressure){

passChance=
RED_PASS_PRESSURE_CHANCE;

}
else if(
p.y<worldHeight*0.50
){

passChance=
RED_PASS_FAR_CHANCE;

}


/*
   Ø¹ÙØ¯ Ø§ÙØ¶ØºØ· Ø§ÙØ´Ø¯ÙØ¯:
   Ø§ÙØªÙØ±ÙØ± Ø´Ø¨Ù ÙØ¤ÙØ¯.

   force ÙØ³ØªØ®Ø¯Ù ÙÙØ· ÙÙ Ø§ÙØ­Ø§ÙØ§Øª Ø§ÙØªÙ
   ÙØ±ÙØ¯ ÙÙÙØ§ ØªÙØ±ÙØ±Ø© ØªÙØªÙÙÙØ© ÙØ§Ø¶Ø­Ø©.
*/

if(
!force &&
Math.random()>passChance
){

return false;

}


/*
   ÙÙØ·Ø© Ø§ÙØ§Ø³ØªÙØ§Ù ØªÙÙÙ Ø£ÙØ§Ù Ø§ÙÙØ³ØªÙØ¨Ù
   ÙÙÙÙÙØ§ ÙÙ Ø§ØªØ¬Ø§Ù ØªÙØ¯ÙÙ.

   ÙØ°Ø§ ÙØ¬Ø¹Ù Ø§ÙÙØ±Ø© ØªØªØ­Ø±Ù Ø¥ÙÙ Ø§ÙÙØ§Ø¹Ø¨
   Ø¨Ø¯Ù Ø£Ù ØªÙØ± Ø®ÙÙÙ.
*/

let leadX=receiver.x;
let leadY=receiver.y;


const receiverMoveLength=
Math.hypot(
receiver.moveX,
receiver.moveY
);


if(receiverMoveLength>0.01){

leadX+=
(
receiver.moveX/
receiverMoveLength
)*35;

leadY+=
(
receiver.moveY/
receiverMoveLength
)*35;

}
else{

/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙÙØ³ØªÙØ¨Ù ÙØ§ ÙØªØ­Ø±ÙØ
   ÙØ¶Ø¹ Ø§ÙÙØ±Ø© Ø£ÙØ§ÙÙ Ø¨Ø§ØªØ¬Ø§Ù ÙØ±ÙÙ Ø§ÙØ£Ø­ÙØ±.
*/

leadY+=35;

}


leadX=clamp(
leadX,
BALL_RADIUS,
worldWidth-BALL_RADIUS
);

leadY=clamp(
leadY,
BALL_RADIUS,
worldHeight-BALL_RADIUS
);


let dx=leadX-p.x;
let dy=leadY-p.y;

const d=Math.hypot(dx,dy);


if(d<1)
return false;


dx/=d;
dy/=d;


const distanceRatio=
clamp(
d/RED_PASS_MAX_DISTANCE,
0,
1
);


const speed=
RED_PASS_SPEED_MIN+
(
RED_PASS_SPEED_MAX-
RED_PASS_SPEED_MIN
)*
distanceRatio;


ballOwner=null;

ballX=p.x+dx*28;
ballY=p.y+dy*28;

ballVX=dx*speed;
ballVY=dy*speed;


p.currentAction="pass";

receiver.currentAction="receive";

resetRedPassCooldown(p);
resetRedDecisionTimer(p);


return true;

}

/* =========================================================
   RED SHOOT
========================================================= */

function redShoot(p){

if(ballOwner!==p)
return false;

if(p.shotCooldown>0)
return false;


const goalX=worldWidth/2;
const goalY=worldHeight;


const dxGoal=goalX-p.x;
const dyGoal=goalY-p.y;


const distanceToGoal=
Math.hypot(
dxGoal,
dyGoal
);


if(distanceToGoal<RED_SHOT_MIN_DISTANCE)
return false;

if(distanceToGoal>RED_SHOT_MAX_DISTANCE)
return false;

if(p.y>worldHeight*0.96)
return false;


const shotType=
chooseRedShotType(
p,
distanceToGoal
);


let targetX=goalX;
let targetY=worldHeight+45;


if(shotType==="direct"){

targetX=
goalX+
(Math.random()-0.5)*24;

targetY=worldHeight+45;

}

else if(shotType==="diagonal-left"){

targetX=goalX-RED_SHOT_TARGET_OFFSET;
targetY=worldHeight+45;

}

else if(shotType==="diagonal-right"){

targetX=goalX+RED_SHOT_TARGET_OFFSET;
targetY=worldHeight+45;

}

else if(shotType==="long-left"){

targetX=goalX-48;
targetY=worldHeight+60;

}

else if(shotType==="long-right"){

targetX=goalX+48;
targetY=worldHeight+60;

}

else if(shotType==="long-direct"){

targetX=
goalX+
(Math.random()-0.5)*35;

targetY=worldHeight+60;

}

else if(shotType==="power"){

targetX=
goalX+
(
Math.random()<0.5
?-42
:42
);

targetY=worldHeight+35;

}


let dx=targetX-p.x;
let dy=targetY-p.y;

const d=Math.hypot(dx,dy);


if(d<1)
return false;


dx/=d;
dy/=d;


const distanceRatio=
clamp(
distanceToGoal/
RED_SHOT_MAX_DISTANCE,
0,
1
);


let speed=
RED_SHOT_SPEED_MIN+
(
RED_SHOT_SPEED_MAX-
RED_SHOT_SPEED_MIN
)*
(
0.45+
distanceRatio*0.55
);


if(shotType==="power")
speed*=1.08;


ballOwner=null;

ballX=p.x+dx*30;
ballY=p.y+dy*30;

ballVX=dx*speed;
ballVY=dy*speed;


p.shotType=shotType;
p.currentAction="shot";


resetRedShotCooldown(p);
resetRedDecisionTimer(p);


return true;

}

/* =========================================================
   RED TACKLE
========================================================= */

function redTryTackle(p){

if(
!ballOwner ||
ballOwner.team!=="blue"
){

return false;

}


const owner=ballOwner;


const d=
Math.hypot(
owner.x-p.x,
owner.y-p.y
);


if(d>RED_TACKLE_DISTANCE)
return false;


const proximity=
1-d/RED_TACKLE_DISTANCE;


const chance=
RED_TACKLE_CHANCE*
(
0.55+
proximity*0.75
);


if(Math.random()<chance){

ballOwner=p;

ballVX=0;
ballVY=0;

lastOwnerChangeTime=
performance.now();

p.currentAction="won-ball";

resetRedDecisionTimer(p);
resetRedPassCooldown(p);

return true;

}


return false;

}

/* =========================================================
   FIND NEAREST RED
========================================================= */

function findNearestRedToBall(){

let nearest=null;
let nearestDistance=Infinity;


for(const p of opponents){

const d=
Math.hypot(
p.x-ballX,
p.y-ballY
);


if(d<nearestDistance){

nearestDistance=d;
nearest=p;

}

}


return{
player:nearest,
distance:nearestDistance
};

}

/* =========================================================
   RED AI
   v4.1.0 PRESSURE UPDATE
========================================================= */

function updateRedAI(dt){

/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙØ£Ø²Ø±Ù Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©:
   ÙØ­Ø¯Ø¯ Ø£ÙØ±Ø¨ ÙØ§Ø¹Ø¨ÙÙ Ø£Ø­ÙØ± ÙØ­Ø§ÙÙ Ø§ÙÙØ±Ø©.

   Ø§ÙØ£ÙÙ = Ø¶ØºØ· ÙØ¨Ø§Ø´Ø±
   Ø§ÙØ«Ø§ÙÙ = ÙØ³Ø§ÙØ¯Ø©
   Ø§ÙØ¨ÙÙØ© = ØªÙØ±ÙØ²
*/

let blueBallOwner=null;

if(
ballOwner &&
ballOwner.team==="blue"
){

blueBallOwner=ballOwner;

}


/* =====================================================
   CALCULATE RED PRESSURE PLAYERS
===================================================== */

let pressurePlayers=[];


if(blueBallOwner){

for(const p of opponents){

const d=
Math.hypot(
p.x-blueBallOwner.x,
p.y-blueBallOwner.y
);

pressurePlayers.push({
player:p,
distance:d
});

}


pressurePlayers.sort(
(a,b)=>
a.distance-b.distance
);

}


/* =====================================================
   MAIN RED AI
===================================================== */

for(const p of opponents){

p.decisionTimer-=dt;
p.shotCooldown-=dt;
p.passCooldown-=dt;


/* =====================================================
   RED HAS BALL
===================================================== */

if(ballOwner===p){

/*
   ÙØ¨Ø­Ø« Ø¹Ù Ø£ÙØ±Ø¨ ÙØ§Ø¹Ø¨ Ø£Ø²Ø±Ù.
*/

let nearestBlue=null;
let nearestBlueDistance=Infinity;


for(const blue of teamPlayers){

const d=
Math.hypot(
blue.x-p.x,
blue.y-p.y
);


if(d<nearestBlueDistance){

nearestBlueDistance=d;
nearestBlue=blue;

}

}


/*
   Ø¥Ø°Ø§ ÙØ§Ù Ø§ÙØ¶ØºØ· Ø´Ø¯ÙØ¯ÙØ§:
   Ø­Ø§ÙÙ Ø§ÙØªÙØ±ÙØ± ÙÙØ±ÙØ§.
*/

if(
nearestBlueDistance<=
RED_PASS_PRESSURE_DISTANCE
){

if(redPass(p,true)){

continue;

}

}


/* =================================================
   TACTICAL DECISION
================================================= */

if(p.decisionTimer<=0){

resetRedDecisionTimer(p);


const goalX=worldWidth/2;
const goalY=worldHeight;


const distToGoal=
Math.hypot(
goalX-p.x,
goalY-p.y
);


/* =========================================
   PASS CHANCE
========================================= */

let passChance=
RED_PASS_NORMAL_CHANCE;


if(p.y<worldHeight*0.48){

passChance=
RED_PASS_FAR_CHANCE;

}


if(distToGoal<420){

passChance=0.30;

}


/* =========================================
   PASS
========================================= */

if(
p.passCooldown<=0 &&
Math.random()<passChance
){

if(redPass(p)){

continue;

}

}


/* =========================================
   SHOOT
========================================= */

let shotChance=0.10;


if(distToGoal<300)
shotChance=0.36;

else if(distToGoal<450)
shotChance=0.27;

else if(distToGoal<650)
shotChance=0.18;

else
shotChance=0.10;


if(distToGoal<220)
shotChance=0.52;


if(p.y>worldHeight*0.96)
shotChance=0;


if(
Math.random()<shotChance &&
p.shotCooldown<=0
){

if(redShoot(p))
continue;

}


/* =========================================
   DRIBBLE
========================================= */

const targetX=worldWidth/2;
const targetY=worldHeight-230;


let moveTargetX=targetX;
let moveTargetY=targetY;


if(Math.random()<0.30){

moveTargetX+=
(Math.random()-0.5)*180;

}


const dx=moveTargetX-p.x;
const dy=moveTargetY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}

}

else{

/*
   Ø§Ø³ØªÙØ±Ø§Ø± Ø§ÙØªÙØ¯Ù Ø¨Ø§ÙÙØ±Ø©
*/

const goalX=worldWidth/2;
const goalY=worldHeight-240;


const dx=goalX-p.x;
const dy=goalY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}

}


continue;

}


/* =====================================================
   RED DOES NOT HAVE BALL
===================================================== */

const blueHasBall=
ballOwner &&
ballOwner.team==="blue";


const freeBall=!ballOwner;


const distToBall=
Math.hypot(
ballX-p.x,
ballY-p.y
);


/* =====================================================
   BLUE HAS BALL
===================================================== */

if(blueHasBall){

/*
   ÙØ¹Ø±ÙØ© ØªØ±ØªÙØ¨ Ø§ÙÙØ§Ø¹Ø¨ Ø§ÙØ£Ø­ÙØ± ÙÙ Ø§ÙØ¶ØºØ·.
*/

let pressureRank=-1;

for(
let i=0;
i<pressurePlayers.length;
i++
){

if(
pressurePlayers[i].player===p
){

pressureRank=i;
break;

}

}


/* =================================================
   PRIMARY PRESSER
   Ø£ÙØ±Ø¨ ÙØ§Ø¹Ø¨ ÙÙØ·
================================================= */

if(pressureRank===0){

const owner=blueBallOwner;

const dx=owner.x-p.x;
const dy=owner.y-p.y;

const d=Math.hypot(dx,dy);


/*
   ÙØ­Ø§ÙÙØ© Ø§ÙØªÙØ§Ù Ø§ÙÙØ±Ø© Ø¥Ø°Ø§ ÙØµÙ Ø§ÙÙØ§Ø¹Ø¨.
*/

if(
d<=RED_TACKLE_DISTANCE
){

if(redTryTackle(p))
continue;

}


/*
   Ø¶ØºØ· ÙØ¨Ø§Ø´Ø±.
*/

if(d>2){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}

continue;

}


/* =================================================
   SECOND PRESSER
   ÙØ³Ø§ÙØ¯Ø© Ø¨Ø¯ÙÙ Ø§ÙØªØ¬ÙØ¹
================================================= */

if(pressureRank===1){

const owner=blueBallOwner;


/*
   ÙØ­Ø¯Ø¯ Ø¬ÙØ© Ø§ÙÙØ³Ø§ÙØ¯Ø© Ø¨ÙØ§Ø¡Ù Ø¹ÙÙ
   ÙÙÙØ¹ Ø§ÙÙØ§Ø¹Ø¨ Ø§ÙØ£Ø­ÙØ± Ø¨Ø§ÙÙØ³Ø¨Ø© ÙØ­Ø§ÙÙ Ø§ÙÙØ±Ø©.
*/

let side=1;


if(p.x>owner.x){

side=-1;

}


/*
   ÙÙØ·Ø© Ø§ÙÙØ³Ø§ÙØ¯Ø© ØªÙÙÙ Ø¨Ø¬Ø§ÙØ¨ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
   ÙÙÙØ³ ÙÙÙÙ.
*/

const SUPPORT_DISTANCE=95;

const SUPPORT_FORWARD=35;


let targetX=
owner.x+
side*SUPPORT_DISTANCE;

let targetY=
owner.y+
SUPPORT_FORWARD;


/*
   Ø¥Ø¨ÙØ§Ø¡ Ø§ÙÙØ³Ø§ÙØ¯ Ø¯Ø§Ø®Ù Ø§ÙÙÙØ¹Ø¨.
*/

targetX=clamp(
targetX,
PLAYER_RADIUS,
worldWidth-PLAYER_RADIUS
);

targetY=clamp(
targetY,
PLAYER_RADIUS,
worldHeight-PLAYER_RADIUS
);


const dx=targetX-p.x;
const dy=targetY-p.y;

const d=Math.hypot(dx,dy);


/*
   Ø¥Ø°Ø§ Ø£ØµØ¨Ø­ ÙØ±ÙØ¨ÙØ§ Ø¬Ø¯ÙØ§ ÙÙ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©Ø
   ÙØ§ ÙØ¯Ø®Ù ÙÙÙÙ.
*/

if(
Math.hypot(
p.x-owner.x,
p.y-owner.y
)<70
){

/*
   ÙØªØ­Ø±Ù ÙÙØ®ÙÙ ÙÙÙÙÙØ§ Ø¨Ø¯Ù Ø§ÙØ§Ø³ØªÙØ±Ø§Ø±
   ÙÙ Ø§ÙØ¯Ø®ÙÙ Ø¹ÙÙ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©.
*/

const backX=
p.x+
(
p.x-owner.x
)*0.35;

const backY=
p.y+
(
p.y-owner.y
)*0.35;


const bx=backX-p.x;
const by=backY-p.y;

const bd=Math.hypot(bx,by);


if(bd>1){

movePlayer(
p,
bx/bd,
by/bd,
dt
);

}

}

else if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}


continue;

}


/* =================================================
   OTHER RED PLAYERS
   ÙØ§ ÙØ·Ø§Ø±Ø¯ÙÙ Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
================================================= */

if(pressureRank>=2){

/*
   Ø§ÙÙØ§Ø¹Ø¨ Ø§ÙØ«Ø§ÙØ« ÙÙØ§ Ø¨Ø¹Ø¯Ù ÙØ±Ø¬Ø¹
   Ø¥ÙÙ Ø¯ÙØ±Ù Ø§ÙØªÙØªÙÙÙ.
*/

let targetX=p.anchorX;
let targetY=p.anchorY;


/* =========================================
   DEFENDER
========================================= */

if(p.role==="defender"){

/*
   ÙØºÙÙ Ø§ÙÙÙØ·ÙØ© Ø£ÙØ§Ù Ø­Ø§ÙÙ Ø§ÙÙØ±Ø©
   Ø¨Ø¯Ù Ø§ÙØ¬Ø±Ù ÙØ­ÙÙ.
*/

targetX=clamp(
ballX,
worldWidth*0.20,
worldWidth*0.80
);

targetY=
worldHeight*0.30;


/* =========================================
   WING
========================================= */

}
else if(p.role==="wing"){

/*
   ÙØ­Ø§ÙØ¸ Ø¹ÙÙ Ø§ÙØ¬ÙØ§Ø­ ÙÙÙØªØ±Ø¨ ÙÙÙÙÙØ§
   ÙÙ Ø¬ÙØ© Ø§ÙÙØ±Ø© ÙÙØ·.
*/

targetX=
p.anchorX+
(
ballX-worldWidth/2
)*0.15;

targetY=
worldHeight*0.45;


/* =========================================
   FORWARD
========================================= */

}
else if(p.role==="forward"){

targetX=
worldWidth/2;

targetY=
worldHeight*0.68;


/* =========================================
   GUARD
========================================= */

}
else if(p.role==="guard"){

targetX=clamp(
ballX,
worldWidth*0.35,
worldWidth*0.65
);

targetY=
worldHeight*0.06;

}


const dx=targetX-p.x;
const dy=targetY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}


continue;

}

}


/* =====================================================
   FREE BALL
===================================================== */

if(
freeBall &&
distToBall<RED_CHASE_DISTANCE
){

const nearest=
findNearestRedToBall();


if(nearest.player===p){

const dx=ballX-p.x;
const dy=ballY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}


continue;

}

}


/* =====================================================
   RED POSITIONING
===================================================== */

let targetX=p.anchorX;
let targetY=p.anchorY;


if(blueHasBall){

if(p.role==="defender"){

targetX=clamp(
ballX,
worldWidth*0.20,
worldWidth*0.80
);

targetY=
worldHeight*0.30;

}

else if(p.role==="wing"){

targetX=
p.anchorX+
(
ballX-worldWidth/2
)*0.20;

targetY=
worldHeight*0.45;

}

else if(p.role==="forward"){

targetX=
worldWidth/2;

targetY=
worldHeight*0.68;

}

else if(p.role==="guard"){

targetX=clamp(
ballX,
worldWidth*0.35,
worldWidth*0.65
);

targetY=
worldHeight*0.06;

}

}

else{

if(p.role==="wing"){

targetX=p.anchorX;
targetY=worldHeight*0.45;

}

else if(p.role==="forward"){

targetX=
worldWidth/2;

targetY=
worldHeight*0.68;

}

else if(p.role==="defender"){

targetX=
worldWidth/2;

targetY=
worldHeight*0.30;

}

else if(p.role==="guard"){

targetX=clamp(
ballX,
worldWidth*0.35,
worldWidth*0.65
);

targetY=
worldHeight*0.06;

}

}


const dx=targetX-p.x;
const dy=targetY-p.y;

const d=Math.hypot(dx,dy);


if(d>8){

movePlayer(
p,
dx/d,
dy/d,
dt
);

}

}

}

/* =========================================================
   BALL AI
========================================================= */

function updateBallAI(dt){

if(!ballOwner)
return;


const p=ballOwner;


if(
p===teamPlayers[activePlayerIndex]
)
return;


if(p.team==="red")
return;


const goalX=worldWidth/2;
const goalY=0;


const distToGoal=
Math.hypot(
goalX-p.x,
goalY-p.y
);


if(distToGoal<280){

if(Math.random()<0.04){

let dx=goalX-p.x;
let dy=goalY-p.y;

const d=Math.hypot(dx,dy);


if(d<1)
return;


dx/=d;
dy/=d;


ballOwner=null;

ballX=p.x+dx*30;
ballY=p.y+dy*30;

ballVX=dx*700;
ballVY=dy*700;

return;

}

}


let nearEnemy=null;


for(const e of opponents){

const d=
Math.hypot(
e.x-p.x,
e.y-p.y
);


if(d<65){

nearEnemy=e;
break;

}

}


if(nearEnemy){

if(Math.random()<0.06){

ballOwner=null;

ballX=p.x;
ballY=p.y-30;

ballVX=0;
ballVY=-450;

return;

}

}


let dx=goalX-p.x;
let dy=goalY-p.y;

const d=Math.hypot(dx,dy);


if(d<1)
return;


dx/=d;
dy/=d;


movePlayer(
p,
dx,
dy,
dt
);

}

/* =========================================================
   FIND BEST DEFENDER
========================================================= */

function findBestBlueDefender(){

if(
!ballOwner ||
ballOwner.team!=="red"
){

return{
index:-1,
distance:Infinity
};

}


const red=ballOwner;

let bestIndex=-1;
let bestDistance=Infinity;


for(
let i=0;
i<teamPlayers.length;
i++
){

const p=teamPlayers[i];


const d=
Math.hypot(
p.x-red.x,
p.y-red.y
);


if(d<bestDistance){

bestDistance=d;
bestIndex=i;

}

}


return{
index:bestIndex,
distance:bestDistance
};

}


/* =========================================================
   AUTO SWITCH
========================================================= */

function autoSwitchPlayer(){

if(
!matchRunning ||
matchEnded
)
return;


const now=performance.now();


if(
now-lastAutoSwitchTime<
AUTO_SWITCH_COOLDOWN
)
return;


const activePlayer=
teamPlayers[activePlayerIndex];


if(!activePlayer)
return;


if(
ballOwner &&
ballOwner.team==="red"
){

const best=
findBestBlueDefender();


if(best.index<0)
return;


const activeDistance=
Math.hypot(
activePlayer.x-ballOwner.x,
activePlayer.y-ballOwner.y
);


const bestDistance=best.distance;


if(best.index===activePlayerIndex)
return;


if(
bestDistance>
BLUE_DEFEND_CONTROL_DISTANCE
)
return;


const emergency=
bestDistance<=
BLUE_DEFEND_EMERGENCY_DISTANCE;


if(
now<manualControlLockUntil &&
!emergency
)
return;


const clearlyBetter=
bestDistance+
BLUE_DEFEND_SWITCH_ADVANTAGE<
activeDistance;


const activeFar=
activeDistance>
BLUE_DEFEND_CONTROL_DISTANCE;


if(
!clearlyBetter &&
!activeFar &&
!emergency
)
return;


if(
setActivePlayer(
best.index,
false
)
){

lastAutoSwitchTime=now;

}


return;

}


if(
ballOwner &&
ballOwner.team==="blue"
){

const ownerIndex=
teamPlayers.indexOf(
ballOwner
);


if(ownerIndex<0)
return;


if(
ownerIndex===
activePlayerIndex
)
return;


const ownerDistance=
Math.hypot(
ballOwner.x-ballX,
ballOwner.y-ballY
);


const emergencyOwner=
ownerDistance<=
AUTO_EMERGENCY_DISTANCE;


if(
now<manualControlLockUntil &&
!emergencyOwner
)
return;


if(
now-lastOwnerChangeTime<
AUTO_OWNER_SWITCH_DELAY
)
return;


if(
setActivePlayer(
ownerIndex,
false
)
){

lastAutoSwitchTime=now;

}


return;

}


if(!ballOwner){

const activeDistance=
Math.hypot(
activePlayer.x-ballX,
activePlayer.y-ballY
);


const best=
findBestPlayerForBall();


if(best.index<0)
return;


const bestDistance=best.distance;


if(bestDistance>=activeDistance)
return;


const emergencyClose=
bestDistance<=AUTO_EMERGENCY_DISTANCE;


const clearlyCloser=
bestDistance+
AUTO_SWITCH_ADVANTAGE<
activeDistance;


if(now<manualControlLockUntil){

const emergencyAllowed=
emergencyClose &&
(
bestDistance+
AUTO_EMERGENCY_ADVANTAGE<
activeDistance
);


if(!emergencyAllowed)
return;

}


const activeTooFar=
activeDistance>
AUTO_CONTROL_DISTANCE;


const bestInsideRange=
bestDistance<=
AUTO_CONTROL_DISTANCE;


if(
!clearlyCloser &&
!activeTooFar
)
return;


if(!bestInsideRange)
return;


if(
setActivePlayer(
best.index,
false
)
){

lastAutoSwitchTime=now;

}

}

}

/* =========================================================
   AUTOMATIC BLUE TACKLE
   v4.1.0
========================================================= */

function automaticBlueTackle(){

if(
!matchRunning ||
matchEnded
)
return false;


if(
!ballOwner ||
ballOwner.team!=="red"
){

return false;

}


const red=ballOwner;


/*
   ÙÙØ­Øµ Ø¬ÙÙØ¹ ÙØ§Ø¹Ø¨Ù Ø§ÙØ£Ø²Ø±Ù.

   ÙØ§ ÙÙØ¬Ø¯:
   - Ø²Ø±
   - Ø§Ø­ØªÙØ§Ù
   - Ø§ØªØ¬Ø§Ù ÙØ¸Ø±
   - Ø²ÙÙ Ø§ÙØªØ¸Ø§Ø±
   - Ø§ÙØ¯ÙØ§Ø¹
   - Ø´Ø±Ø· ÙØ§Ø¹Ø¨ ÙØ­Ø¯Ø¯

   ÙØ¬Ø±Ø¯ ØªÙØ§ÙØ³ = Ø§ÙØªÙØ§Ù ÙØ¨Ø§Ø´Ø±.
*/

for(const blue of teamPlayers){

const distance=
Math.hypot(
blue.x-red.x,
blue.y-red.y
);


if(
distance<=PLAYER_COLLISION_DISTANCE
){

const now=performance.now();


ballOwner=blue;

ballVX=0;
ballVY=0;

ballX=blue.x;
ballY=blue.y-25;


lastOwnerChangeTime=now;

blue.hasBall=true;
blue.currentAction="won-ball";


const index=
teamPlayers.indexOf(blue);


if(
index>=0 &&
index!==activePlayerIndex
){

setActivePlayer(
index,
false
);

lastAutoSwitchTime=now;

}


return true;

}

}


return false;

}

/* =========================================================
   RED SAFETY TACKLE
========================================================= */

function tackle(){

if(!ballOwner)
return;


if(ballOwner.team==="blue"){

for(const e of opponents){

const d=
Math.hypot(
e.x-ballOwner.x,
e.y-ballOwner.y
);


if(
d<RED_TACKLE_DISTANCE
){

const chance=
0.05*
(
1-
d/RED_TACKLE_DISTANCE
);


if(Math.random()<chance){

ballOwner=e;

ballVX=0;
ballVY=0;

lastOwnerChangeTime=
performance.now();

e.hasBall=true;
e.currentAction="won-ball";

resetRedDecisionTimer(e);
resetRedPassCooldown(e);

return;

}

}

}

}

else{

return;

}

}

