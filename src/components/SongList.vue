<template>
  <div class="song-list">
    <h1>Available Songs</h1>

    <!-- Song Search Form -->
    <form @submit.prevent="searchSongs" class="search-form">
      <input v-model="searchQuery" placeholder="Search by Title or Artist" />
      <button type="submit">Search</button>
    </form>

    <!-- Add Song Form mit File Upload -->
    <form @submit.prevent="addSong" class="song-form">
      <input v-model="newSong.title" placeholder="Title" required />

      <select v-model="newSong.artist" required>
        <option disabled value="">Select an Artist</option>
        <option v-for="artist in artists" :key="artist.id" :value="artist.id">
          {{ artist.name }}
        </option>
      </select>

      <input v-model="newSong.genre" placeholder="Genre" required />
      <input type="number" v-model="newSong.length" placeholder="Length (in seconds)" required min="1" />

      <!-- File Upload Input -->
      <input type="file" @change="handleFileUpload" accept="audio/*" required />

      <button type="submit">Add Song</button>
    </form>

    <!-- Add Artist Form -->
    <form @submit.prevent="addArtist" class="artist-form">
      <input v-model="newArtist.name" placeholder="New Artist Name" required />
      <button type="submit">Add Artist</button>
    </form>

    <!-- Song List Display -->
    <div v-if="Array.isArray(songs) && songs.length > 0" class="songs-container">
      <Song
        v-for="song in songs"
        :key="song.id"
        :song="song"
        :onEdit="editSong"
        :onDelete="deleteSong"
        class="song-card"
      />
    </div>
    <div v-else>
      <p>No songs can be found. Please adjust your search.</p>
    </div>
  </div>
</template>

<script>
import Song from './Song.vue';

export default {
  components: { Song },
  data() {
    return {
      searchQuery: '',
      songs: [],
      artists: [],
      currentPage: 0,
      pageSize: 5,
      totalPages: 1,
      newSong: {
        title: '',
        artist: '',
        genre: '',
        length: ''
      },
      newArtist: { name: '' },
      file: null
    };
  },
  created() {
    this.fetchSongs();
    this.fetchArtists();
  },
  methods: {
    searchSongs() {
      this.currentPage = 0;
      this.fetchSongs();
    },
    fetchSongs() {
      const url = this.searchQuery.trim() === ''
        ? `http://localhost:8080/api/songs?page=${this.currentPage}&size=${this.pageSize}`
        : `http://localhost:8080/api/songs/search?query=${encodeURIComponent(this.searchQuery)}&page=${this.currentPage}&size=${this.pageSize}`;

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error fetching songs');
          return response.json();
        })
        .then(data => {
          if (data.content) {
            this.songs = data.content;
            this.totalPages = data.totalPages || 1;
            this.currentPage = data.number || 0;
          } else {
            this.songs = data;
            this.totalPages = 1;
          }
        })
        .catch(error => {
          console.error('Error fetching songs:', error);
          this.songs = [];
        });
    },
    fetchArtists() {
      fetch('http://localhost:8080/api/artists')
        .then(response => {
          if (!response.ok) throw new Error('Error fetching artists');
          return response.json();
        })
        .then(data => {
          this.artists = data;
        })
        .catch(error => console.error('Error fetching artists:', error));
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async addSong() {
      if (!this.file) {
        console.error("❌ Fehler: Keine Datei ausgewählt.");
        return;
      }

      let formData = new FormData();
      formData.append("title", this.newSong.title);
      formData.append("artist", this.newSong.artist); // artist id
      formData.append("genre", this.newSong.genre);
      formData.append("length", this.newSong.length);
      formData.append("file", this.file);  // send the file

      try {
        const response = await fetch("http://localhost:8080/api/songs/more", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Fehler beim Hochladen");
        }

        alert("✅ Song hochgeladen!");
        this.fetchSongs();
        this.newSong = { title: '', artist: '', genre: '', length: '' };
        this.file = null;
      } catch (error) {
        console.error("❌ Fehler beim Hochladen:", error);
      }
    },
    addArtist() {
      fetch('http://localhost:8080/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newArtist)
      })
        .then(response => {
          if (!response.ok) throw new Error('Error adding artist');
          return response.json();
        })
        .then(artist => {
          this.artists.push(artist);
          this.newArtist.name = '';
        })
        .catch(error => console.error('Error adding artist:', error));
    }
  }
};
</script>

<style scoped>
.song-list {
  margin: 20px;
}
.search-form,
.song-form,
.artist-form {
  margin-bottom: 20px;
}
.songs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
