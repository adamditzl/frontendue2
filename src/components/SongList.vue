<template>
  <div>
    <h1>Song List</h1>
    <ul>
      <SongItem v-for="song in songs" :key="song.id" :song="song" />
    </ul>
  </div>
</template>

  
  <script>
  export default {
    components: {
    SongItem
  },
    data() {
      return {
        songs: []
      };
    },
  
    created() {
      this.fetchSongs();
    },
    methods: {
      async fetchSongs() {
        try {
          const response = await fetch('http://localhost:8080/api/songs');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          this.songs = data;
        } catch (error) {
          console.error('Error fetching songs:', error);
        }
      }
    }
  };
  </script>  