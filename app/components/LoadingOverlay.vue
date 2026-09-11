<template>
  <v-container
    v-if="isLoading"
    class="d-flex align-center justify-center fill-height position-absolute"
    fluid
    style="z-index: 50; top: 0; backdrop-filter: blur(40px); background-color: rgba(255, 255, 255, 0.4)"
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col cols="3">
        <v-progress-linear
          class="w-100"
          color="primary"
          height="10"
          indeterminate
          rounded
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { isLoading } = useLoadingIndicator();
</script>
