<template>
  <div class="song-list">
    <h1>Available Songs</h1>

    <!-- Song Search Form -->
    <form @submit.prevent="searchSongs" class="search-form">
      <input v-model="searchQuery" placeholder="Search by Title or Artist" />
      <button type="submit">Search</button>
    </form>

    <!-- Add Song Form with Artist Dropdown -->
    <form @submit.prevent="addSong" class="song-form">
      <input v-model="newSong.title" placeholder="Title" required />
      
      <select v-model="newSong.artistId" required>
        <option v-for="artist in artists" :key="artist.id" :value="artist.id">
          {{ artist.name }}
        </option>
      </select>

      <input v-model="newSong.genre" placeholder="Genre" required />
      <input type="number" v-model="newSong.length" placeholder="Length (in seconds)" required min="1" />
      <button type="submit">Add Song</button>
    </form>

    <!-- Add Artist Form -->
    <form @submit.prevent="addArtist" class="artist-form">
      <input v-model="newArtist.name" placeholder="New Artist Name" required />
      <button type="submit">Add Artist</button>
    </form>

    <!-- Song List Display -->
    <div v-if="songs.length" class="songs-container">
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

    <!-- Edit Song Form -->
    <div v-if="isEditing" class="edit-form-container">
      <h2>Edit Song</h2>
      <form @submit.prevent="updateSong" class="edit-form">
        <input v-model="editSongData.title" placeholder="Title" required />
        
        <select v-model="editSongData.artistId" required>
          <option v-for="artist in artists" :key="artist.id" :value="artist.id">
            {{ artist.name }}
          </option>
        </select>
        
        <input v-model="editSongData.genre" placeholder="Genre" required />
        <input type="number" v-model="editSongData.length" placeholder="Length (in seconds)" required min="1" />
        <div class="edit-buttons">
          <button type="submit" class="update-button">Update Song</button>
          <button type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Song from './Song.vue';

export default {
  components: {
    Song
  },
  data() {
    return {
      searchQuery: '',
      songs: [],
      artists: [],
      newSong: {
        title: '',
        artistId: null,
        genre: '',
        length: ''
      },
      newArtist: { name: '' },
      isEditing: false,
      editSongData: null
    };
  },
  created() {
    this.fetchSongs();
    this.fetchArtists();
  },
  methods: {
    searchSongs() {
      fetch(`http://localhost:8080/api/songs/search?query=${this.searchQuery}`)
        .then(response => response.json())
        .then(data => { this.songs = data; });
    },
    fetchSongs() {
      fetch('http://localhost:8080/api/songs')
        .then(response => response.json())
        .then(data => { this.songs = data; });
    },
    fetchArtists() {
      fetch('http://localhost:8080/api/artists')
        .then(response => response.json())
        .then(data => { this.artists = data; });
    },
    addSong() {

      this.newSong = {
    title: 'Test Song',
    artistId: 1, // Make sure artist with ID 1 exists
    genre: 'Pop',
    length: 180 // 3 minutes
};


    // Check if all fields are filled
    if (!this.newSong.title || !this.newSong.artistId || !this.newSong.genre || this.newSong.length === null || this.newSong.length <= 0) {
        alert('Please fill in all fields correctly. Length must be a positive number.');
        return;
    }

    // Console for debugging
    console.log('Sending new song:', this.newSong);

    fetch('http://localhost:8080/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newSong)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Network response was not ok: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        this.songs.push(data);
        this.resetSongForm();
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}
,
    addArtist() {
      fetch('http://localhost:8080/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newArtist)
      })
        .then(response => response.json())
        .then(artist => { this.artists.push(artist); this.newArtist.name = ''; });
    },
    editSong(song) {
      this.isEditing = true;
      this.editSongData = { ...song, artistId: song.artist.id };
    },
    updateSong() {
      fetch(`http://localhost:8080/api/songs/${this.editSongData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.editSongData)
      })
        .then(response => response.json())
        .then(updatedSong => {
          const index = this.songs.findIndex(song => song.id === updatedSong.id);
          if (index !== -1) this.songs.splice(index, 1, updatedSong);
          this.cancelEdit();
        });
    },
    deleteSong(id) {
      fetch(`http://localhost:8080/api/songs/${id}`, { method: 'DELETE' })
        .then(() => this.fetchSongs());
    },
    cancelEdit() {
      this.isEditing = false;
      this.editSongData = null;
    },
    resetSongForm() {
      this.newSong = { title: '', artistId: null, genre: '', length: '' };
    }
  }
};
</script>
