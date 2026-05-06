<script setup lang="ts">
import { useCurrentUser } from "~/shared/api/client";

const currentUser = useCurrentUser();

const projectsKey = ref(0);
const onProjectCreated = () => {
  projectsKey.value += 1;
};

</script>

<template>
  <div class="space-y-6">
    <section
      v-if="currentUser?.role === 'DEVELOPER'"
      class="glass-panel p-1"
    >
      <ProjectCreateForm @created="onProjectCreated" />
    </section>
    <ProjectList :key="projectsKey" />
  </div>
</template>
