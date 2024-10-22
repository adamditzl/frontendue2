<template>
  <div class="song-card">
    <h2 class="song-title">{{ song.title }}</h2>
    <p class="song-artist">Artist: <strong>{{ song.artist }}</strong></p>
    <p class="song-genre">Genre: <strong>{{ song.genre }}</strong></p>
    <p class="song-length">Length: <strong>{{ formatLength(song.length) }}</strong></p>
    <button @click="editSong" class="edit-button">Edit</button>
    <button @click="deleteSong" class="delete-button">Delete</button>
  </div>
</template>

<script>
export default {
  props: ['song', 'onEdit', 'onDelete'],
  methods: {
    formatLength(length) {
      const minutes = Math.floor(length / 60);
      const seconds = length % 60;
      return `${minutes} min ${seconds} sec`;
    },
    editSong() {
      this.onEdit(this.song);
    },
    deleteSong() {
      this.onDelete(this.song.id); // Pass the song ID to delete
    }
  }
};
</script>

<style scoped>
.song-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  background-color: #f9f9f9;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: scale(1.02);
}

.song-title {
  font-size: 1.5em;
  color: #333;
}

.song-artist,
.song-genre,
.song-length {
  color: #666;
}

.edit-button,
.delete-button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}
</style>
