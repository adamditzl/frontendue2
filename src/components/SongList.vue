<template>
  <div class="song-list">
    <h1>Available Songs</h1>

    <form @submit.prevent="searchSongs" class="search-form">
  <input v-model="searchQuery" placeholder="Search by Title or Artist" />
  <button type="submit">Search</button>
</form>


    <form @submit.prevent="addSong" class="song-form">
      <input v-model="newSong.title" placeholder="Title" required />
      <input v-model="newSong.artist" placeholder="Artist" required />
      <input v-model="newSong.genre" placeholder="Genre" required />
      <input type="number" v-model="newSong.length" placeholder="Length (in seconds)" required min="1" />
      <button type="submit">Add Song</button>
    </form>
    
    <div v-if="songs.length">
      <Song
        v-for="song in songs"
        :key="song.id"
        :song="song"
        :onEdit="editSong"
        :onDelete="deleteSong"
      />
    </div>
    <div v-else>
      <p>No songs can be found. Please adjust your search.</p>
    </div>

    <!-- Edit Song Form -->
    <div v-if="isEditing">
      <h2>Edit Song</h2>
      <form @submit.prevent="updateSong">
        <input v-model="editSongData.title" placeholder="Title" required />
        <input v-model="editSongData.artist" placeholder="Artist" required />
        <input v-model="editSongData.genre" placeholder="Genre" required />
        <input type="number" v-model="editSongData.length" placeholder="Length (in seconds)" required min="1" />
        <button type="submit">Update Song</button>
        <button type="button" @click="cancelEdit">Cancel</button>
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
      searchQuery: '', // New search query field
    loading: false,
    songs: [],
      songs: [],
      newSong: {
        title: '',
        artist: '',
        genre: '',
        length: ''
      },
      isEditing: false,
      editSongData: null // For storing the song being edited
    };
  },
  created() {
    this.fetchSongs(); // Fetch initial song list
  },
  methods: {
    searchSongs() {
    this.loading = true;
    fetch(`http://localhost:8080/api/songs/search?query=${this.searchQuery}`)
      .then(response => response.json())
      .then(data => {
        this.songs = data;
        this.loading = false;
      })
      .catch(error => {
        console.error('Error searching songs:', error);
        this.loading = false;
      })},
    fetchSongs() {
      fetch('http://localhost:8080/api/songs')
        .then(response => response.json())
        .then(data => {
          this.songs = data; // Update songs array with the fetched data
        })
        .catch(error => console.error('Error fetching songs:', error));
    },
    addSong() {
      fetch('http://localhost:8080/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newSong)
      })
        .then(response => response.json())
        .then(data => {
          this.songs.push(data); // Add the new song to the list
          this.resetForm(); // Reset the form after adding the song
        })
        .catch(error => console.error('Error adding song:', error));
        console.log('Song successfully added');
    },

    editSong(song) {
      this.isEditing = true;
      this.editSongData = { ...song }; // Create a copy of the song to edit
    },

    updateSong() {
      fetch(`http://localhost:8080/api/songs/${this.editSongData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.editSongData)
      })
        .then(response => response.json())
        .then(data => {
          const index = this.songs.findIndex(song => song.id === this.editSongData.id);
          if (index !== -1) {
            this.songs.splice(index, 1, data); // Update the song in the list
          }
          this.cancelEdit(); // Cancel edit mode
        })
        .catch(error => console.error('Error updating song:', error));
    },

    deleteSong(id) {
      fetch(`http://localhost:8080/api/songs/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          this.isEditing = false; //damit das edit Fenster nicht mehr angezeigt wird, wenn man einen Song beim Editen deletet
          this.editSongData = null; //damit auch die Felder leer sind
          this.fetchSongs(); //erneutet Abrufen der Songs
        })
        .catch(error => console.error('Error deleting song:', error));
    },

    cancelEdit() {
      this.isEditing = false;
      this.editSongData = null; // Reset edit data
    },

    resetForm() {
      this.newSong = { title: '', artist: '', genre: '', length: '' }; // Reset the new song form
    }
  }
};
</script>

<style scoped>
.song-list {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f7f7f7;
}

.song-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.song-form input {
  margin: 5px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.song-form button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
}

.song-form button:hover {
  background-color: #218838;
}
</style>
