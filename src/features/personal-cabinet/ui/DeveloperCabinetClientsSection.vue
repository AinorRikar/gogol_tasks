<script setup lang="ts">
import { ClientCreateForm, DeveloperClientsPanel, useClientManagement } from "~/features/client-management";

const {
  filteredClients,
  loading,
  search,
  form,
  formError,
  formSuccess,
  actionError,
  loadClients,
  createClient,
  deleteClient,
  toggleExpanded,
  isExpanded
} = useClientManagement();
</script>

<template>
  <div class="space-y-6">
    <ClientCreateForm
      :form="form"
      :form-error="formError"
      :form-success="formSuccess"
      @submit="createClient"
    />

    <DeveloperClientsPanel
      v-model:search="search"
      :clients="filteredClients"
      :loading="loading"
      :action-error="actionError"
      :is-expanded="isExpanded"
      @refresh="loadClients"
      @toggle="toggleExpanded"
      @delete="deleteClient"
    />
  </div>
</template>
