<script setup lang="ts">
import { useInitActiveUser } from "~/shared/api";
import { DefaultAppShell } from "~/widgets/layout";

await useInitActiveUser();
</script>

<template>
  <DefaultAppShell>
    <slot />
  </DefaultAppShell>
</template>

