const kickSound = new Audio("kick.wav");

function playKickSound(){
    kickSound.currentTime = 0;
    kickSound.play();
}
