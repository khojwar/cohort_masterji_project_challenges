fetch("https://api.freeapi.app/api/v1/public/youtube/videos")
  .then(response => response.json())
  .then(data => {
    const videos = data.data.data; // Access the array of videos

    const videoGrid = document.getElementById('videoGrid');
    const searchInput = document.getElementById('searchInput');

    // Store video elements in an array to reference them later
    const videoElements = [];

    videos.forEach(video => {
      // -----steps---------
      // Access the snippet and statistics objects from the video object
      // Create a new div element to store the video information
      // Add a class to the div element
      // Store the video title and channel name as data attributes for easy searching
      // Add a cursor style to indicate it's clickable
      // Set the innerHTML of the div element to display the video information
      // Add a click event listener to open the video on YouTube
      // Append the div element to the videoGrid element
      // Add the div element to the videoElements array
      // ----------------

      const snippet = video.items.snippet;
      const statistics = video.items.statistics;
      const videoId = video.items.id; // Get the video ID

      const videoElement = document.createElement('div');
      videoElement.classList.add('video-item');
      
      // Store the video title and channel name as data attributes for easy searching
      videoElement.dataset.title = snippet.title.toLowerCase();
      videoElement.dataset.channel = snippet.channelTitle.toLowerCase();
      videoElement.dataset.videoId = videoId; // Store the video ID as a data attribute
      // output: <div class="video-item" data-title="testTitle" data-channel="testChannel" data-video-id="testid"></div>
      
      // Add cursor style to indicate it's clickable
      videoElement.style.cursor = 'pointer';

      videoElement.innerHTML = `
        <div class="thumbnail-container">
          <img class="thumbnail" src="${snippet.thumbnails.default.url}" alt="${snippet.title}">
        </div>
        <div class="video-info">
          <h3 class="video-title">${snippet.title}</h3>
          <p class="channel-title">${snippet.channelTitle}</p>
          <p class="view-count">${parseInt(statistics.viewCount).toLocaleString()} views</p>
        </div>
      `;

      // Add click event listener to open the video on YouTube
      videoElement.addEventListener('click', () => {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        window.open(youtubeUrl, '_blank'); // Open in new tab
      });

      videoGrid.appendChild(videoElement);
      videoElements.push(videoElement);
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        // --------steps---------
        // Get the search value from the input element
        // Loop through all video elements and check if they match the search
        // If the title or channel name includes the search value, display the video
        // Otherwise, hide the video
        // ----------------
        
      const searchValue = searchInput.value.toLowerCase();
      
      // Loop through all video elements and check if they match the search
      videoElements.forEach(videoElement => {
        const title = videoElement.dataset.title;
        const channelTitle = videoElement.dataset.channel;

        if (title.includes(searchValue) || channelTitle.includes(searchValue)) {
          videoElement.style.display = 'block';
        } else {
          videoElement.style.display = 'none';
        }
      });
    });
  })
  .catch(error => {
    console.error('Error fetching videos:', error);
  });