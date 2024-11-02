<template>
  <div class="home">
    <h1>Schedule Management</h1>
    <ScheduleForm />
    <ScheduleList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScheduleForm from '../components/ScheduleForm.vue';
import ScheduleList from '../components/ScheduleList.vue';

export default defineComponent({
  name: 'Home',
  components: {
    ScheduleForm,
    ScheduleList
  }
});
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>