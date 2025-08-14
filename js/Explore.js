let Explore = document.getElementById("Explore");
let spotifyPlaylist = document.querySelector(".spotifyPlaylist");

Explore.addEventListener("click", async () => {
    let response = await fetch("pages/Explore.html");
    let htmlContent = await response.text();

    // Create a shadow root to isolate styles
    let shadowContainer = document.createElement("div");
    let shadowRoot = shadowContainer.attachShadow({ mode: "open" });

    // Apply styles directly inside the shadow root
    let style = document.createElement("style");
    style.textContent = `
        :host {
            display: block;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            max-height: 500px; /* Adjust as needed */
        }
    `;

    shadowRoot.appendChild(style);
    shadowRoot.innerHTML += htmlContent;

    // Load external CSS
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/Explore.css";
    shadowRoot.appendChild(link);

    // Clear old content and add new Shadow DOM container
    spotifyPlaylist.innerHTML = "";
    spotifyPlaylist.appendChild(shadowContainer);
});
