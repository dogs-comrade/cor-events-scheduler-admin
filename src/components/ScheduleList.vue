<template>
  <div class="schedule-list">
    <h2>Schedules</h2>

    <div v-if="loading">Loading...</div>

    <div v-else>
      <div v-if="schedules.length" class="schedules-container">
        <div
          v-for="schedule in schedules"
          :key="schedule.id"
          class="schedule-card"
        >
          <div class="schedule-header">
            <h3>{{ schedule.name }}</h3>
            <div class="actions">
              <button @click="editSchedule(schedule.id)">Edit</button>
              <button @click="confirmDelete(schedule.id)">Delete</button>
            </div>
          </div>

          <div class="schedule-details">
            <p><strong>Description:</strong> {{ schedule.description }}</p>
            <p>
              <strong>Period:</strong>
              {{ formatDateTime(schedule.start_date) }} -
              {{ formatDateTime(schedule.end_date) }}
            </p>
            <p>
              <strong>Created:</strong>
              {{ formatDateTime(schedule.created_at) }}
            </p>
            <p>
              <strong>Updated:</strong>
              {{ formatDateTime(schedule.updated_at) }}
            </p>
          </div>

          <div class="blocks-section">
            <h4>Blocks</h4>
            <div v-if="schedule.blocks?.length" class="blocks-list">
              <div
                v-for="block in schedule.blocks"
                :key="block.id"
                class="block-card"
              >
                <div class="block-header">
                  <h5>{{ block.name }}</h5>
                  <div class="block-actions">
                    <span class="block-type">{{ block.type }}</span>
                    <button
                      @click="openAddItemDialog(block.id)"
                      class="add-item-btn"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
                <div class="block-info">
                  <p>{{ block.description }}</p>
                  <p>
                    <strong>Start:</strong>
                    {{ formatDateTime(block.start_time) }}
                  </p>
                  <p><strong>Duration:</strong> {{ block.duration }} min</p>
                  <p><strong>Order:</strong> {{ block.order }}</p>
                </div>

                <div class="items-section" v-if="block.items?.length">
                  <h6>Items:</h6>
                  <div class="items-list">
                    <div
                      v-for="item in block.items"
                      :key="item.id"
                      class="item-card"
                    >
                      <div class="item-header">
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-type">({{ item.type }})</span>
                      </div>
                      <div class="item-info">
                        <p>{{ item.description }}</p>
                        <p>
                          <strong>Duration:</strong> {{ item.duration }} min
                        </p>
                        <p><strong>Performer:</strong> {{ item.performer }}</p>
                        <p>
                          <strong>Requirements:</strong> {{ item.requirements }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else>No blocks defined</p>
          </div>
        </div>
      </div>

      <div v-else>No schedules found</div>

      <div class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
    <dialog ref="addItemDialog" class="add-item-dialog">
      <form @submit.prevent="submitNewItem">
        <h3>Add New Performance Item</h3>
        
        <div class="form-group">
          <label>Name:</label>
          <input v-model="newItem.name" required>
        </div>

        <div class="form-group">
          <label>Type:</label>
          <select v-model="newItem.type" required>
            <option value="cosplay_performance">Cosplay Performance</option>
            <option value="dance">Dance</option>
            <option value="vocal">Vocal</option>
          </select>
        </div>

        <div class="form-group">
          <label>Description:</label>
          <textarea v-model="newItem.description" required></textarea>
        </div>

        <div class="form-group">
          <label>Duration (minutes):</label>
          <input type="number" v-model.number="newItem.duration" required min="1">
        </div>

        <div class="form-group">
          <label>Performer:</label>
          <input v-model="newItem.performer" required>
        </div>

        <div class="form-group">
          <label>Requirements:</label>
          <textarea v-model="newItem.requirements"></textarea>
        </div>

        <div class="dialog-buttons">
          <button type="button" @click="closeAddItemDialog">Cancel</button>
          <button type="submit">Add</button>
        </div>
      </form>
    </dialog>
    
  </div>
</template>

<style scoped>
.schedule-list {
  padding: 20px;
}

.schedules-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 20px 0;
}

.schedule-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
}

.block-card {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.block-type {
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.items-section {
  margin-top: 15px;
}

.item-card {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.item-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.item-type {
  color: #666;
  font-size: 0.9em;
}

.item-info {
  font-size: 0.9em;
  line-height: 1.4;
}

/* Остальные стили остаются без изменений */
</style>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { scheduleApi } from "../services/api";
import { Schedule } from "../types";

export default defineComponent({
  name: "ScheduleList",
  emits: ["edit"],

  setup(_, { emit }) {
    const schedules = ref<Schedule[]>([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = 10;
    const totalItems = ref(0);

    const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    const loadSchedules = async (page: number) => {
      try {
        loading.value = true;
        const response = await scheduleApi.getAll(page, pageSize);
        schedules.value = response.data;
        totalItems.value = response.total;
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        loading.value = false;
      }
    };

    const editSchedule = (id: number) => {
      emit("edit", id);
    };

    const confirmDelete = async (id: number) => {
      if (confirm("Are you sure you want to delete this schedule?")) {
        try {
          await scheduleApi.delete(id);
          await loadSchedules(currentPage.value);
        } catch (error) {
          console.error("Failed to delete schedule:", error);
        }
      }
    };

    const changePage = (page: number) => {
      currentPage.value = page;
      loadSchedules(page);
    };

    const addItemDialog = ref<HTMLDialogElement | null>(null);
    const selectedBlockId = ref<number | null>(null);
    const newItem = ref({
      type: 'cosplay_performance',
      name: '',
      description: '',
      duration: 5,
      performer: '',
      requirements: ''
    });

    const openAddItemDialog = (blockId: number) => {
      selectedBlockId.value = blockId;
      addItemDialog.value?.showModal();
    };

    const closeAddItemDialog = () => {
      addItemDialog.value?.close();
      resetNewItem();
    };

    const resetNewItem = () => {
      newItem.value = {
        type: 'cosplay_performance',
        name: '',
        description: '',
        duration: 5,
        performer: '',
        requirements: ''
      };
    };

    const submitNewItem = async () => {
      if (!selectedBlockId.value) return;
      
      try {
        await scheduleApi.arrangeItems(selectedBlockId.value, [newItem.value]);
        await loadSchedules(currentPage.value);
        closeAddItemDialog();
      } catch (error) {
        console.error('Failed to add item:', error);
      }
    };

    
    onMounted(() => loadSchedules(currentPage.value));

    return {
      schedules,
      loading,
      currentPage,
      totalPages,
      editSchedule,
      confirmDelete,
      changePage,
      formatDateTime,
      addItemDialog,
      newItem,
      openAddItemDialog,
      closeAddItemDialog,
      submitNewItem
    };
  }
});
</script>
