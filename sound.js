const kickSound = new Audio("kick.wav");

function playKickSound(){

    kickSound.currentTime = 0;

    kickSound.play()
    .catch(error=>{
        console.log("KICK SOUND ERROR:", error);
    });

}
