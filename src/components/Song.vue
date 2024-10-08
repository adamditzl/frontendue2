<template>
    <li>
      <strong>{{ song.title }}</strong> by {{ song.artist }} ({{ song.genre }}, {{ song.length }} seconds)
    </li>
  </template>
  
  <script>
  export default {
    props: {
      song: {
        type: Object,
        required: true
      }
    }
  };
  </script>
