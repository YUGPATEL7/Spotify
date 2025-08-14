"use strict";

// Utility: Convert seconds to mm:ss format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let playedSongs = [];

function updateSidebar(track) {
    let playedSongsList = document.getElementById("playedSongs");
    if (!playedSongs.includes(track)) {
        playedSongs.push(track);
        // let li = document.createElement("li");
        // li.textContent = track.replaceAll("%20", " ");
        // playedSongsList.appendChild(li);
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/Spotify/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        updatePlayButton(true);
    }
    let removemp3 = track.replaceAll(".mp3", " ");
    document.querySelector(".songinfo").innerHTML = `
        <div class="song-details flexha">
            <div class="song-title songinfo">${decodeURI(removemp3)}</div>
            <div class="song-artist">Mithoon, Arijit Singh</div>
        </div>`;
    document.querySelector(".songtime").innerHTML = "00:00";
    document.querySelector(".songtimeright").innerHTML = "00:00";
    updateSidebar(track);
    currentSong.onended = () => {
        document.getElementById("defaultSidebar").classList.remove("hidden");
        document.getElementById("songHistory").classList.add("hidden");
    };
};

function updatePlayButton(isPlaying) {
    const playBtn = document.getElementById("play");
    playBtn.src = isPlaying ? "imgs&logo/pause.svg" : "imgs&logo/play.svg";
    playBtn.innerHTML = isPlaying
        ? `<i class="fa-solid fa-pause"></i>`
        : `<i class="fas fa-play"></i>`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Spotify/${folder}/`);
    let b = await a.text();
    let div = document.createElement("div");
    div.innerHTML = b;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="imgs&logo/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Yug</div>
                </div>
                <div id="playnowbyid" class="playnow">
                    <span>Play Now</span>
                    <img id="playpause" class="invert" src="imgs&logo/play.svg" alt="">
                </div>
            </li>`;
    }
    document.querySelectorAll(".songlist li").forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Spotify/Songs/`);
    let b = await a.text();
    let div = document.createElement("div");
    div.innerHTML = b;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);
    let titlePositions = {
        0: "Top Hits",
        5: "Trending Now",
        10: "Old Classics"
    };
    let count = 0;
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Spotify/Songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            let meta = await fetch(`http://127.0.0.1:3000/Spotify/Songs/${folder}/info.json`);
            let metadata = await meta.json();
            if (titlePositions[count] !== undefined) {
                cardcontainer.innerHTML += `<h2 class="section-title">${titlePositions[count]}</h2>`;
            }
            cardcontainer.innerHTML += `
                <div data-folder="${folder}" id="${count + 1}" class="card">
                    <div class="play">
                        <img src="imgs&logo/play.svg" alt="">
                    </div>
                    <img class="cure" src="/Spotify/Songs/${folder}/cover.jpg" alt="imgs">
                    <h2 class="fontsize">${metadata.title}</h2>
                    <h6 class="font">${metadata.description}</h6>
                </div>`;
            count++;
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async event => {
            let folder = event.currentTarget.dataset.folder;
            let coverImage = `/Spotify/Songs/${folder}/cover.jpg`;
            document.querySelector(".album-cover").src = coverImage;
            songs = await getsongs(`Songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

    let songHistory = document.getElementById("songHistory");
    songHistory.style.display= "none";
    let card = document.querySelector(".cardcontainer ");
    let info =document.querySelector(".hiddenperpose");
    card.addEventListener("click",()=>{
        songHistory.style.display= "block";
        info.style.display="none";

    })


function setupVolumeSlider() {
    const volumeSlider = document.querySelector(".volume-slider");
    volumeSlider.addEventListener("input", function () {
        const volumeLevel = (this.value / this.max) * 100;
        this.style.background = `linear-gradient(to right, #1DB954 ${volumeLevel}%, #555 ${volumeLevel}%)`;
    });
    volumeSlider.addEventListener("change", function () {
        const volumeLevel = (this.value / this.max) * 100;
        this.style.background = `linear-gradient(to right, white ${volumeLevel}%, #555 ${volumeLevel}%)`;
    });
}

function main() {
    getsongs("Songs/ncs").then(() => {
        playMusic(songs[0], true);
        displayAlbums();
    });

    // Play/Pause button
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
        } else {
            currentSong.pause();
        }
    });

    // Update play/pause icon on play/pause events
    currentSong.addEventListener("play", () => updatePlayButton(true));
    currentSong.addEventListener("pause", () => updatePlayButton(false));

    // Update song time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = secondsToMinutesSeconds(currentSong.currentTime);
        document.querySelector(".songtimeright").innerHTML = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click event
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu open/close
    document.querySelector(".hamburgar").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Show sidebar on album click
    document.querySelector(".cardcontainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Previous/Next buttons
    document.getElementById("previous").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
    });
    document.getElementById("next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // Volume slider
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        let volumeIcon = document.querySelector(".volume>img");
        if (currentSong.volume > 0) {
            volumeIcon.src = "imgs&logo/volume.svg";
        } else {
            volumeIcon.src = "imgs&logo/mute.svg";
        }
    });

    // Volume icon click
    document.querySelector(".volume>img").addEventListener("click", () => {
        let volumeIcon = document.querySelector(".volume>img");
        if (currentSong.volume > 0) {
            volumeIcon.src = "imgs&logo/mute.svg";
            currentSong.volume = 0;
        } else {
            volumeIcon.src = "imgs&logo/volume.svg";
            currentSong.volume = 0.5;
        }
    });

    // Signup event
    document.querySelector(".askforsingup").addEventListener("click", () => {
        document.querySelector(".askforsingup").style.display = "none";
        document.querySelector(".singup").style.display = "block";
    });

    setupVolumeSlider();
    hideListofSong();
    

    
}

main();
console.log("Let's start with JS");
// console.log("Let's start with JS");

// let currentSong = new Audio();
// let songs;
// let currFolder;


// function secondsToMinutesSeconds(seconds) {
//     if (isNaN(seconds) || seconds < 0) {
//         return "00:00";
//     }
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
// }

// async function getsongs(folder) {
//     currFolder = folder;
//     let a = await fetch(`http://127.0.0.1:3000/Spotify/${folder}/`);
//     let b = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = b;
//     let as = div.getElementsByTagName("a");    

// songs = [];
        
        
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1]);
//         }
//     }
//         // Add songs to the list
//         let songUL = document.querySelector(".songlist ul");
//         songUL.innerHTML = "";
//         for (const song of songs) {
//             songUL.innerHTML += `
//             <li>
//                 <img class="invert" src="imgs&logo/music.svg" alt="">
//                 <div class="info">
//                     <div>${song.replaceAll("%20", " ")}</div>
//                     <div>Yug</div>
//                 </div>
//                 <div id="playnowbyid" class="playnow">
//                     <span>Play Now</span>
//                     <img id="playpause" class="invert" src="imgs&logo/play.svg" alt="">
//                 </div>
//             </li>`;
//         }
    
//         // Attach event listeners to song list items
//         document.querySelectorAll(".songlist li").forEach(e => {
//             e.addEventListener("click", () => {
//                 playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());z
                
//             });
//         });
//         return songs;
// }

// let playedSongs = [];

// const playMusic = (track, pause = false) => {
//     currentSong.src = `/Spotify/${currFolder}/` + track;

//     if (!pause) {
//         currentSong.play();
//         document.getElementById("play").src = "imgs&logo/pause.svg";
//     }

//     document.querySelector(".songinfo")
//     // add new playbar with img feater 
//     let removemp3 = track.replaceAll(".mp3", " ");
//     document.querySelector(".songinfo").innerHTML =`                
//                     <div class="song-details flexha">

//                     <div class="song-title songinfo">${decodeURI(removemp3)}</div>
                    
//                     <div class="song-artist">Mithoon, Arijit Singh</div>
                    
//                 </div>`;
//     document.querySelector(".songtime").innerHTML = "00:00";
//     document.querySelector(".songtimeright").innerHTML = "00:00";

//     updateSidebar(track);

//     // Switch back to default sidebar when song ends
//     currentSong.onended = () => {
//         document.getElementById("defaultSidebar").classList.remove("hidden");
//         document.getElementById("songHistory").classList.add("hidden");
//     };
// };

// function updateSidebar(track) {
//     let songHistory = document.getElementById("songHistory");
//     let defaultSidebar = document.getElementById("defaultSidebar");
//     let playedSongsList = document.getElementById("playedSongs");

//     if (!playedSongs.includes(track)) {
//         playedSongs.push(track);

//         let li = document.createElement("li");
//         li.textContent = track.replaceAll("%20", " ");
//         playedSongsList.appendChild(li);
//     }
// }


// // Play/Pause Fix: Only switches icon, doesn’t affect sidebar
// document.getElementById("play").addEventListener("click", () => {
//     if (currentSong.paused) {
//         currentSong.play();
//         document.getElementById("play").innerHTML= `<i class="fa-solid fa-pause"></i>`;
//     } else {
//         currentSong.pause();
//         document.getElementById("play").innerHTML =`  <i class="fas fa-play"></i>`
//     }
// });

// currentSong.addEventListener("play", () => {
//     document.getElementById("play").src = "imgs&logo/pause.svg";
//     document.getElementById("play").innerHTML = `<i class="fa-solid fa-pause"></i>`;
// });
// currentSong.addEventListener("pause", () => {
//     document.getElementById("play").src = "imgs&logo/play.svg";
//     document.getElementById("play").innerHTML = `<i class="fas fa-play"></i>`;
// });

// // Reset sidebar when playback stops
// document.getElementById("play").addEventListener("click", () => {
//     if (currentSong.paused) {
//         currentSong.play();
//         document.getElementById("play").src = "imgs&logo/pause.svg";
//     } else {
//         currentSong.pause();
//         document.getElementById("play").src = "imgs&logo/play.svg";
//     }
// });


// async function displayAlbums() {
//     let a = await fetch(`http://127.0.0.1:3000/Spotify/Songs/`);
//     let b = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = b;
//     let anchors = div.getElementsByTagName("a");
//     let cardcontainer = document.querySelector(".cardcontainer");

//     console.log('Anchors', anchors);
//     let array = Array.from(anchors);

//     // Manually define when titles should appear & their custom names
//     let titlePositions = {
//         0: "Top Hits",  // Title after first folder
//         3: "Trending Now",  // Title after 3 folders
//         6: "Old Classics"  // Title after 6 folders
//     };

//     let count = 0; // Folder count

//     for (let index = 0; index < array.length; index++) {
//         const e = array[index]; 
//         if (e.href.includes("/Spotify/Songs/")) {
//             let folder = e.href.split("/").slice(-2)[0];

//             // Fetch metadata
//             let meta = await fetch(`http://127.0.0.1:3000/Spotify/Songs/${folder}/info.json`);
//             let metadata = await meta.json();

//             // Insert custom title based on defined positions
//             if (titlePositions[count] !== undefined) {
//                 cardcontainer.innerHTML += `<h2 class="section-title">${titlePositions[count]}</h2>`;
//             }            
//                         // Add the folder card
//                 cardcontainer.innerHTML += `
//                 <div data-folder="${folder}" id="${count + 1}"  class="card">
//                 <div class="play">
//                 <img src="imgs&logo/play.svg" alt="">
//                 </div>
//                 <img class="cure" src="/Spotify/Songs/${folder}/cover.jpg" alt="imgs">
//                 <h2 class="fontsize">${metadata.title}</h2>
//                 <h6 class="font">${metadata.description}</h6>
//                 </div>`;
                
//                 count++;
//         }
//     }
    
//     Array.from(document.getElementsByClassName("card")).forEach(e => { 
//         e.addEventListener("click", async event => {
//             let folder = event.currentTarget.dataset.folder; // Get the folder
//             let coverImage = `/Spotify/Songs/${folder}/cover.jpg`; // Image source from clicked card
//             // coverImage.style.width="5px";
    
//             // Update Play Bar Image
//             document.querySelector(".album-cover").src = coverImage;
    
//             // Get Songs & Play First Song
//             songs = await getsongs(`Songs/${folder}`);
//             playMusic(songs[0]); 
//         });
//     });
    

//     // Attach event listeners to each folder card

// }


// async function main() {
//     // Get the list of all songs
//     await getsongs("Songs/ncs");
//     playMusic(songs[0], true);
//     console.log(songs);

//     // Display all albums on page
//     displayAlbums();


//     // Play/Pause event listener
//     document.getElementById("play").addEventListener("click", () => {
//         if (currentSong.paused) {
//             currentSong.play();
//             document.getElementById("play").src = "imgs&logo/pause.svg";
//         } else {
//             currentSong.pause();
//             document.getElementById("play").src = "imgs&logo/play.svg";
//         }
//     });


//     // Update song time
//     currentSong.addEventListener("timeupdate", () => {
//         document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} `;
//         document.querySelector(".songtimeright").innerHTML = ` ${secondsToMinutesSeconds(currentSong.duration)}`;
//         document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
//     });

//     // Seekbar click event
//     document.querySelector(".seekbar").addEventListener("click", e => {
//         let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
//         document.querySelector(".circle").style.left = percent + "%";
//         currentSong.currentTime = (currentSong.duration * percent) / 100;
//     });

//     // Hamburger menu open/close
//     document.querySelector(".hamburgar").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "0";
//     });

//     document.querySelector(".close").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "-120%";
//     });

//     // When someone clicks on a song, List of Song shown
//     document.querySelector(".cardcontainer").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "0";
//     })

//     // Previous button
//     document.getElementById("previous").addEventListener("click", () => {
//         currentSong.pause();
//         console.log("Previous clicked");
//         let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
//         if (index > 0) {
//             playMusic(songs[index - 1]);
//         }
//     });

//     // Next button
//     document.getElementById("next").addEventListener("click", () => {
//         currentSong.pause();
//         console.log("Next clicked");
//         let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
//         if (index + 1 < songs.length) {
//             playMusic(songs[index + 1]);
//         }
//     });

//     // Volume slider event
//     document.querySelector(".range input").addEventListener("input", (e) => {
//         currentSong.volume = parseInt(e.target.value) / 100;
//         if(currentSong.volume>0){
//             document.querySelector(".volume>img").src =document.querySelector(".volume>img").src.replace("imgs&logo/mute.svg","imgs&logo/volume.svg")
//         }
//         if(currentSong.volume==0){
//             document.querySelector(".volume>img").src =document.querySelector(".volume>img").src.replace("imgs&logo/volume.svg","imgs&logo/mute.svg")
//         }
//     });

//     // Check the volume 
//     document.querySelector(".volume>img").addEventListener("click", () => {
//         let volumeIcon = document.querySelector(".volume>img");
//         if (currentSong.volume > 0) {
//             volumeIcon.src = "imgs&logo/mute.svg";
//             currentSong.volume = 0;
//         } else {
//             volumeIcon.src = "imgs&logo/volume.svg";
//             currentSong.volume = 0.5; // Default volume
//         }
//     });
    
//     // singup  event is close
//     document.querySelector(".askforsingup").addEventListener("click",(e) => {
//         document.querySelector(".askforsingup").style.display = "none";
//         document.querySelector(".singup").style.display = "block";
//     }
//     )
//     // search event 

// }

//     function toggleSearch() {
//         let searchBox = document.getElementById("searchContainer");
//         searchBox.sList.toggle("show");
//     }

    
    
// // Call main function
// main();



// function hideListofSong(){
//     let songHistory = document.getElementById("songHistory");
//     songHistory.style.display= "none";
//     let card = document.querySelector(".cardcontainer ");
//     let info =document.querySelector(".hiddenperpose");
//     card.addEventListener("click",()=>{
//         songHistory.style.display= "block";
//         info.style.display="none";

//     })

// }

// hideListofSong()

// const volumeSlider = document.querySelector(".volume-slider");

// // When user starts adjusting, show green bar
// volumeSlider.addEventListener("input", function () {
//     const volumeLevel = (this.value / this.max) * 100;
//     this.style.background = `linear-gradient(to right, #1DB954 ${volumeLevel}%, #555 ${volumeLevel}%)`; // Green while dragging
// });

// // When user releases the slider, change back to white progress
// volumeSlider.addEventListener("change", function () {
//     const volumeLevel = (this.value / this.max) * 100;
//     this.style.background = `linear-gradient(to right, white ${volumeLevel}%, #555 ${volumeLevel}%)`; // White after setting
// });


