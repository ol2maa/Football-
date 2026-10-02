let audioContext = null;
let kickBuffer = null;

async function initAudio(){

    if(!audioContext){

        audioContext =
            new (window.AudioContext ||
                 window.webkitAudioContext)({
                latencyHint:"interactive"
            });
    }

    if(audioContext.state === "suspended"){
        await audioContext.resume();
    }

    if(!kickBuffer){

        const response =
            await fetch("kick.wav");

        const arrayBuffer =
            await response.arrayBuffer();

        kickBuffer =
            await audioContext.decodeAudioData(arrayBuffer);
    }
}


function playKickSound(){

    if(!audioContext || !kickBuffer){
        return;
    }

    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    const source =
        audioContext.createBufferSource();

    source.buffer = kickBuffer;

    source.connect(audioContext.destination);

    source.start(0);
}
