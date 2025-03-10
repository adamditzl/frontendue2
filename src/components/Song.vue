<template>
  <div class="song-card">
    <h3>{{ song.title }}</h3>
    <p><strong>Artist:</strong> {{ song.artist.name }}</p>
    <p><strong>Genre:</strong> {{ song.genre }}</p>
    <p><strong>Length:</strong> {{ song.length }} sec</p>

    <!-- Audio Player -->
    <div v-if="!isPlaying">
      <!-- Der Play-Button wird angezeigt, solange noch nicht abgespielt wurde -->
      <button @click="playAudio">Play</button>
    </div>
    <div v-else>
      <!-- Sobald Play gedrückt wurde, wird das Audio-Element mit preload="none" gerendert -->
      <audio :src="audioUrl" controls preload="none" autoplay></audio>
    </div>

    <div class="song-actions">
      <button @click="onEdit(song)">Edit</button>
      <button @click="onDelete(song.id)">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    song: Object,
    onEdit: Function,
    onDelete: Function
  },
  data() {
    return {
      isPlaying: false,
      audioUrl: ''
    };
  },
  methods: {
    playAudio() {
      // Setze hier die URL für den Audio-Stream
      this.audioUrl = `http://localhost:8080/api/songs/${this.song.id}/stream`;
      // Ändere den Status, sodass das <audio>-Element gerendert wird
      this.isPlaying = true;
    }
  }
};
</script>

<style scoped>
.song-card {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
  width: 250px;
  text-align: center;
}

.song-actions {
  margin-top: 10px;
}

button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 3px;
}

button:hover {
  background-color: #0056b3;
}
</style>
