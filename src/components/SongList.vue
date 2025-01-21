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

  <!-- Pagination Controls  das is das was unten angeueigt wird mit den buttons -->
  <div class="pagination">
    <button @click="goToFirstPage" :disabled="currentPage === 0">First</button>
    <button @click="goToPreviousPage" :disabled="currentPage === 0">Previous</button>
    <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
    <button @click="goToNextPage" :disabled="currentPage + 1 === totalPages">Next</button>
    <button @click="goToLastPage" :disabled="currentPage + 1 === totalPages">Last</button>
  </div>
</template>
<!--der : vor disabled macht, dass der String dahinter evaluiert, also ausgelesen, wird-->
<script>
import Song from './Song.vue';

export default {
  components: {
    Song
  },
  data() {
    return {
      // Suche
      searchQuery: '',
      // Song & Artist Listen
      songs: [],
      artists: [],
      // Pagination
      currentPage: 0,  // WICHTIG: fängt bei 0 an
      pageSize: 5,
      totalPages: 1,
      // Neuen Song/Künstler anlegen
      newSong: {
        title: '',
        artist: '',
        genre: '',
        length: ''
      },
      newArtist: { name: '' },
      // Bearbeitungszustand
      isEditing: false,
      editSongData: null
    };
  },
  created() {
    this.fetchSongs();
    this.fetchArtists();
  },
  methods: {
    // Suchfunktion - Nur Platzhalter, da du fetch() ohne URL verwendest
    searchSongs() {
      // Hier solltest du eine korrekte URL verwenden, z.B.:
      // fetch(http://localhost:8080/api/songs/search?query=${this.searchQuery})
      // ...
      console.warn("searchSongs() ist noch nicht implementiert (kein fetch-URL).");
    },

    // Pagination Buttons
    goToFirstPage() {
      if (this.currentPage > 0) {
        this.currentPage = 0;
        this.fetchSongs();
      }
    },
    goToPreviousPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.fetchSongs();
      }
    },
    goToNextPage() {
      if (this.currentPage + 1 < this.totalPages) {
        this.currentPage++;
        this.fetchSongs();
      }
    },
    goToLastPage() {
      if (this.currentPage + 1 < this.totalPages) {
        this.currentPage = this.totalPages - 1;
        this.fetchSongs();
      }
    },

    // Songs abrufen
    fetchSongs() {
      const url = ` http://localhost:8080/api/songs?query=${encodeURIComponent(this.searchQuery)}&page=${this.currentPage}&size=${this.pageSize}`;
      console.log("Fetching:", url);
      fetch(url)
        .then(response => {
          if (!response.ok) throw ` new Error(Error: ${response.statusText})`;
          return response.json();
        })
        .then(data => {
          /**
           * Prüfen ob 'data' bereits ein Array ist (nicht paginiert),
           * oder ein Objekt mit 'content' und 'totalPages' (paginiert).
           */
          if (Array.isArray(data)) {
            // Fallback: Backend liefert nur ein Array ohne Pagination
            this.songs = data;
            this.totalPages = 1; // Single-Page fallback
          } else {
            // Paginated response
            this.songs = data.content || [];
            this.totalPages = data.totalPages || 1;
            // data.number = aktuelle Seite im Backend
            // Übernehmen wir direkt in currentPage
            this.currentPage = data.number || 0;
          }
          console.log("Songs:", this.songs);
          console.log("currentPage:", this.currentPage, "totalPages:", this.totalPages);
        })
        .catch(error => {
          console.error("Error fetching songs:", error);
          this.songs = [];
        });
    },

    // Künstler abrufen
    fetchArtists() {
      fetch('http://localhost:8080/api/artists')
        .then(response => {
          if (!response.ok) throw ` new Error(Fehler: ${response.statusText})`;
          return response.json();
        })
        .then(data => {
          this.artists = data;
        })
        .catch(error => console.error('Fehler beim Abrufen der Künstler:', error));
    },

    // Neuen Song hinzufügen
    addSong() {
      const songData = {
        title: this.newSong.title,
        artist: { id: this.newSong.artist },
        genre: this.newSong.genre,
        length: this.newSong.length
      };

      fetch('http://localhost:8080/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData),
      })
        .then(response => {
          if (!response.ok) throw new Error('Fehler beim Hinzufügen des Songs');
          return response.json();
        })
        .then(data => {
          console.log('Song hinzugefügt:', data);
          // Nach dem Hinzufügen neu laden
          this.fetchSongs();
          // Formular zurücksetzen
          this.newSong = { title: '', artist: '', genre: '', length: '' };
        })
        .catch(error => console.error('Fehler beim Hinzufügen des Songs:', error));
    },

    // Neuen Künstler hinzufügen
    addArtist() {
      fetch('http://localhost:8080/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newArtist)
      })
        .then(response => {
          if (!response.ok) throw ` new Error(Fehler: ${response.statusText})`;
          return response.json();
        })
        .then(artist => {
          this.artists.push(artist);
          // Formular zurücksetzen
          this.newArtist.name = '';
        })
        .catch(error => console.error('Fehler beim Hinzufügen des Künstlers:', error));
    },

    // Song bearbeiten
    editSong(song) {
      this.isEditing = true;
      // Kopie erstellen oder direkt Song übernehmen
      this.editSongData = { ...song }; 
    },

    // Song aktualisieren
    updateSong() {
      fetch(`http://localhost:8080/api/songs/${this.editSongData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.editSongData)
      })
        .then(response => {
          if (!response.ok) throw ` new Error(Fehler: ${response.statusText})`;
          return response.json();
        })
        .then(updatedSong => {
          const index = this.songs.findIndex(song => song.id === updatedSong.id);
          if (index !== -1) this.songs.splice(index, 1, updatedSong);
          this.cancelEdit();
        })
        .catch(error => console.error('Fehler beim Aktualisieren des Songs:', error));
    },

    // Song löschen
    deleteSong(id) {
      fetch(`http://localhost:8080/api/songs/${id}, { method: 'DELETE' }`)
        .then(response => {
          if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
          // Nach dem Löschen neu laden
          this.fetchSongs();
        })
        .catch(error => console.error('Fehler beim Löschen des Songs:', error));
    },

    // Bearbeitung abbrechen
    cancelEdit() {
      this.isEditing = false;
      this.editSongData = null;
    }
  }
};

</script>

<style scoped>
/* Ein bisschen Styling, optional anpassbar */
.song-list {
  margin: 20px;
}
.search-form, .song-form, .artist-form {
  margin-bottom: 20px;
}
.songs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pagination {
  margin-top: 20px;
}
</style>