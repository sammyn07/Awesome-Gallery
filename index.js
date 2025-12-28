const accessKey = "FeiPIVBvUmCXIKA749882n28hZmpCA6wqsaRBn8JpNo";
 const preloadedImagesPerPage = 6;
 const morePreloadedImages = 4;
 const searchImagesPerPage = 10;
 const formEl = document.querySelector("#search-form");
 const searchInputEl = document.querySelector("#search-input");
 const searchResultsEl = document.querySelector(".search-results");
 const showMoreButton = document.querySelector("#show-more-button");
 const fullscreenOverlay = document.querySelector("#fullscreen-overlay");
 let currentPage = 1;
 let isSearchActive = false;
 let searchQuery = "";
 async function getPreloadedImages(page, perPage) {
     const url = `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}&client_id=${accessKey}`;
     try {
         const response = await fetch(url);
         if (!response.ok) throw new Error(`API Error: ${response.status}`);
         const data = await response.json();
         return data.map(result => ({
             src: result.urls.small.replace("w=400", "w=280"),
             fullSrc: result.urls.full,
             name: result.alt_description || "Beautiful Scenic Image"
         }));
     } catch (error) {
         console.error("Failed to fetch preloaded images:", error);
         alert("Could not load images — check your internet or API key.");
         return [];
     }
 }
 window.addEventListener("load", async () => {
     const initialImages = await getPreloadedImages(1, preloadedImagesPerPage);
     initialImages.forEach(image => {
         const card = createImageCard(image);
         searchResultsEl.appendChild(card);
     });
     showMoreButton.style.display = "block";
 });
 function createImageCard(imageData) {
     const card = document.createElement("div");
     card.classList.add("search-result");
     const img = document.createElement("img");
     img.src = imageData.src;
     img.alt = imageData.name;
     img.loading = "lazy";
     img.addEventListener("click", () => openFullscreen(imageData.fullSrc, imageData.name));
     img.addEventListener("contextmenu", (e) => {
         e.preventDefault();
         downloadImage(imageData.fullSrc, imageData.name);
     });
     const title = document.createElement("div");
     title.classList.add("image-title");
     title.textContent = imageData.name;
     title.addEventListener("click", () => openFullscreen(imageData.fullSrc, imageData.name));
     const downloadBtn = document.createElement("button");
     downloadBtn.classList.add("download-btn", "download-icon");
     downloadBtn.textContent = "Download";
     downloadBtn.addEventListener("click", () => downloadImage(imageData.fullSrc, imageData.name));
     card.appendChild(img);
     card.appendChild(title);
     card.appendChild(downloadBtn);
     return card;
 }
 async function renderPreloadedImages(limit) {
     const page = Math.ceil(searchResultsEl.children.length / limit) + 1;
     const newImages = await getPreloadedImages(page, limit);
     newImages.forEach(image => {
         const card = createImageCard(image);
         searchResultsEl.appendChild(card);
     });
     if (newImages.length < limit) {
         showMoreButton.style.display = "none";
     }
 }
 async function searchImages() {
     const url = `https://api.unsplash.com/search/photos?page=${currentPage}&query=${encodeURIComponent(searchQuery)}&client_id=${accessKey}&per_page=${searchImagesPerPage}`;
     try {
         const response = await fetch(url);
         if (!response.ok) throw new Error(`API Error: ${response.status}`);
         const data = await response.json();
         const results = data.results;
         results.forEach((result) => {
             const imageName = result.alt_description
                 ? result.alt_description.replace(/\b(of|the|a|an)\b/gi, "").trim()
                 : "Beautiful Scenic Image";
             const card = createImageCard({
                 src: result.urls.small.replace("w=400", "w=280"),
                 fullSrc: result.urls.full,
                 name: imageName
             });
             searchResultsEl.appendChild(card);
         });
         showMoreButton.style.display = results.length > 0 ? "block" : "none";
     } catch (error) {
         console.error("Search failed:", error);
         alert("Could not load search results — check your internet or API key.");
         showMoreButton.style.display = "none";
     }
 }
 async function downloadImage(imageUrl, imageName) {
     try {
         const response = await fetch(imageUrl, { mode: "cors" });
         if (!response.ok) throw new Error("Failed to fetch image");
         const blob = await response.blob();
         const downloadLink = document.createElement("a");
         downloadLink.href = URL.createObjectURL(blob);
         downloadLink.download = imageName || `gallery-image-${Date.now()}.jpg`;
         document.body.appendChild(downloadLink);
         downloadLink.click();
         setTimeout(() => {
             document.body.removeChild(downloadLink);
             URL.revokeObjectURL(downloadLink.href);
         }, 100);
     } catch (error) {
         console.error("Download failed:", error);
         alert("Could not download image — please try again later.");
     }
 }
 function openFullscreen(imageSrc, imageAlt) {
     fullscreenOverlay.innerHTML = `
     <img src="${imageSrc}" alt="${imageAlt}" id="fullscreen-image">
     <button id="close-fullscreen">×</button>
   `;
     fullscreenOverlay.style.display = "flex";
     document.body.style.overflow = "hidden";
     const closeBtn = document.getElementById("close-fullscreen");
     closeBtn.addEventListener("click", closeFullscreen);
     fullscreenOverlay.addEventListener("click", (e) => {
         if (e.target === fullscreenOverlay) closeFullscreen();
     });
 }
 function closeFullscreen() {
     fullscreenOverlay.style.display = "none";
     document.body.style.overflow = "auto";
 }
 showMoreButton.addEventListener("click", () => {
     currentPage++;
     if (isSearchActive) {
         searchImages();
     } else {
         renderPreloadedImages(morePreloadedImages);
     }
 });
 formEl.addEventListener("submit", (e) => {
     e.preventDefault();
     searchQuery = searchInputEl.value.trim();
     if (!searchQuery) return;
     isSearchActive = true;
     currentPage = 1;
     searchResultsEl.innerHTML = "";
     searchImages();
 })
