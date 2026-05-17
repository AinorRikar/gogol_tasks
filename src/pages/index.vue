<script setup lang="ts">
import { ProjectCreateForm } from "~/features/project-create";
import { ProjectList } from "~/widgets/project-list";
import { useCurrentUser } from "~/shared/api";

useHead({ title: "Проекты" });

const currentUser = useCurrentUser();

const projectsKey = ref(0);
const onProjectCreated = () => {
  projectsKey.value += 1;
};

</script>

<template>
  <div class="space-y-6">
    <section v-if="currentUser?.role === 'DEVELOPER'" class="min-w-0 max-w-full">
      <ProjectCreateForm @created="onProjectCreated" />
    </section>
    <ProjectList :key="projectsKey" />
  </div>
</template>
