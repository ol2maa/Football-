const kickSound = new Audio("kick.mp3");

function playKickSound(){
    kickSound.currentTime = 0;
    kickSound.play();
}
