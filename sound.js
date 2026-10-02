const kickSound = new Audio("kick.wav");

function playKickSound(){

    console.log("KICK SOUND START");

    kickSound.currentTime = 0;

    kickSound.play()
    .then(()=>{
        console.log("KICK SOUND PLAYING");
    })
    .catch(error=>{
        console.log("KICK SOUND ERROR:", error);
    });

}
