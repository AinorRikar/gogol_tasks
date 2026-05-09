<script setup lang="ts">
import { ProjectCreateForm } from "~/features/project-create";
import { ProjectList } from "~/widgets/project-list";
import { useCurrentUser } from "~/shared/api";

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
