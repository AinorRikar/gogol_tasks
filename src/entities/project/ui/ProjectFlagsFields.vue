<script setup lang="ts">
import { PROJECT_FLAG_ICONS, PROJECT_FLAG_LABELS } from "../model/projectFlagLabels";
import { ToggleChip } from "~/shared/ui";

const visibility = defineModel<boolean>("visibility", { required: true });
const hidden = defineModel<boolean>("hidden", { required: true });
const useForPortfolio = defineModel<boolean>("useForPortfolio", { required: true });
</script>

<template>
  <div class="flex min-w-0 flex-wrap gap-2">
    <ToggleChip
      v-model="visibility"
      :label="PROJECT_FLAG_LABELS.visibility"
      :icon="PROJECT_FLAG_ICONS.visibility"
    />
    <ToggleChip v-model="hidden" :label="PROJECT_FLAG_LABELS.hidden" :icon="PROJECT_FLAG_ICONS.hidden" />
    <ToggleChip
      v-model="useForPortfolio"
      :label="PROJECT_FLAG_LABELS.useForPortfolio"
      :icon="PROJECT_FLAG_ICONS.useForPortfolio"
    />
  </div>
</template>
