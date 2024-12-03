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
      
      <select v-model="newSong.artist" required>
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
        
        <select v-model="editSongData.artist" required>
          <option v-for="artist in artists" :key="artist.id" :value="artist">
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
        artist: '',
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
    // Methode zur Song-Suche
    searchSongs() {
        fetch(`http://localhost:8080/api/songs/search?query=${encodeURIComponent(this.searchQuery)}`)
            .then(response => {
                if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
                return response.json();
            })
            .then(data => { this.songs = data; })
            .catch(error => console.error('Fehler beim Suchen von Songs:', error));
    },

    // Alle Songs abrufen
    fetchSongs() {
        fetch('http://localhost:8080/api/songs')
            .then(response => {
                if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
                return response.json();
            })
            .then(data => { this.songs = data; })
            .catch(error => console.error('Fehler beim Abrufen der Songs:', error));
    },

    // Alle Künstler abrufen
    fetchArtists() {
        fetch('http://localhost:8080/api/artists')
            .then(response => {
                if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
                return response.json();
            })
            .then(data => { this.artists = data; })
            .catch(error => console.error('Fehler beim Abrufen der Künstler:', error));
    },

    // Einen neuen Song hinzufügen
    addSong() {
  const songData = {
    title: this.newSong.title, // Song-Titel
    artist: {id: this.newSong.artist},
    genre: this.newSong.genre, // Genre
    length: this.newSong.length // Song-Länge
  };

  // Führe den POST-Request aus
  fetch('http://localhost:8080/api/songs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(songData),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Fehler beim Hinzufügen des Songs');
      }
    })
    .then(data => {
      console.log('Song hinzugefügt:', data);
    })
    .catch(error => {
      console.error('Fehler beim Hinzufügen des Songs:', error);
    });
}
,
    // Einen neuen Künstler hinzufügen
    addArtist() {
        fetch('http://localhost:8080/api/artists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.newArtist)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
            return response.json();
        })
        .then(artist => {
            this.artists.push(artist);
            this.newArtist.name = ''; // Formular zurücksetzen
        })
        .catch(error => console.error('Fehler beim Hinzufügen des Künstlers:', error));
    },

    // Einen Song bearbeiten
    editSong(song) {
        this.isEditing = true;
        this.editSongData = song // { ...song, artistId: song.artist.id };
    },
//beim edit ist das Problem, dass es nach einem submit edit nicht das richtige speichert - iwas mitn artist vermute ich mal
    // Einen Song aktualisieren
    updateSong() {
        fetch(`http://localhost:8080/api/songs/${this.editSongData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.editSongData)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
            return response.json();
        })
        .then(updatedSong => {
            const index = this.songs.findIndex(song => song.id === updatedSong.id);
            if (index !== -1) this.songs.splice(index, 1, updatedSong);
            this.cancelEdit();
        })
        .catch(error => console.error('Fehler beim Aktualisieren des Songs:', error));
    },

    // Einen Song löschen
    deleteSong(id) {
        fetch(`http://localhost:8080/api/songs/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
                this.fetchSongs();
            })
            .catch(error => console.error('Fehler beim Löschen des Songs:', error));
    },

    // Bearbeitung abbrechen
    cancelEdit() {
        this.isEditing = false;
        this.editSongData = null;
    },

    // Song-Formular zurücksetzen
    resetSongForm() {
        this.newSong = { title: '', artist: null, genre: '', length: '' };
    }
}

};
</script>
