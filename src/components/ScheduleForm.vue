<template>
  <div class="schedule-form">
    <h2>{{ isEditing ? "Edit Schedule" : "Create Schedule" }}</h2>
    <form @submit.prevent="submitForm">
      <!-- Schedule Basic Info -->
      <div class="basic-info">
        <div>
          <label for="name">Name:</label>
          <input type="text" v-model="schedule.name" required />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea v-model="schedule.description" required></textarea>
        </div>
        <div>
          <label for="start_date">Start Date:</label>
          <input type="datetime-local" v-model="schedule.start_date" required />
        </div>
        <div>
          <label for="end_date">End Date:</label>
          <input type="datetime-local" v-model="schedule.end_date" required />
        </div>
      </div>

      <!-- Blocks Section -->
      <div class="blocks-section">
        <h3>Blocks</h3>
        <button type="button" @click="addBlock">Add Block</button>

        <div
          v-for="(block, blockIndex) in schedule.blocks"
          :key="blockIndex"
          class="block"
        >
          <div class="block-header">
            <input v-model="block.name" placeholder="Block Name" required />
            <select v-model="block.type" required>
              <option value="opening">Opening</option>
              <option value="cosplay">Cosplay</option>
              <option value="music">Music</option>
            </select>
            <input type="datetime-local" v-model="block.start_time" required />
            <input
              type="number"
              v-model="block.duration"
              placeholder="Duration (min)"
              required
            />
            <button type="button" @click="removeBlock(blockIndex)">
              Remove Block
            </button>
          </div>

          <!-- Items Section -->
          <div class="items-section">
            <button type="button" @click="addItem(block)">Add Item</button>
            <div
              v-for="(item, itemIndex) in block.items"
              :key="itemIndex"
              class="item"
            >
              <input v-model="item.name" placeholder="Item Name" required />
              <select v-model="item.type" required>
                <option value="speech">Speech</option>
                <option value="video">Video</option>
                <option value="cosplay_performance">Cosplay Performance</option>
                <option value="band_performance">Band Performance</option>
              </select>
              <input
                type="number"
                v-model="item.duration"
                placeholder="Duration (min)"
                required
              />
              <input
                v-model="item.performer"
                placeholder="Performer"
                required
              />
              <input v-model="item.requirements" placeholder="Requirements" />
              <button type="button" @click="removeItem(block, itemIndex)">
                Remove Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <button type="submit">{{ isEditing ? "Update" : "Create" }}</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { scheduleApi } from "../services/api";
import type { Schedule, Block, BlockItem } from "@/types";

const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return "";
  // Convert local datetime to UTC ISO string
  return new Date(dateTimeStr).toISOString();
};

export default defineComponent({
  name: "ScheduleForm",
  props: {
    initialSchedule: {
      type: Object as () => Schedule,
      default: () => ({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        blocks: [],
      }),
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const schedule = ref<Schedule>({ ...props.initialSchedule });

    const addBlock = () => {
      const newBlock: Block = {
        name: "",
        type: "",
        start_time: "",
        duration: 0,
        description: "",
        order: schedule.value.blocks.length + 1,
        items: [],
      };
      schedule.value.blocks.push(newBlock);
    };

    const removeBlock = (index: number) => {
      schedule.value.blocks.splice(index, 1);
    };

    const addItem = (block: Block) => {
      const newItem: BlockItem = {
        type: "",
        name: "",
        description: "",
        duration: 0,
        order: block.items.length + 1,
        performer: "",
        requirements: "",
      };
      block.items.push(newItem);
    };

    const removeItem = (block: Block, itemIndex: number) => {
      block.items.splice(itemIndex, 1);
    };

    const submitForm = async () => {
      try {
        // Format dates before submission
        const formattedSchedule = {
          ...schedule.value,
          start_date: formatDateTime(schedule.value.start_date),
          end_date: formatDateTime(schedule.value.end_date),
          blocks: schedule.value.blocks.map((block) => ({
            ...block,
            start_time: formatDateTime(block.start_time),
          })),
        };

        if (props.isEditing && formattedSchedule.id) {
          await scheduleApi.update(formattedSchedule.id, formattedSchedule);
        } else {
          await scheduleApi.create(formattedSchedule);
        }
        emit("submit", formattedSchedule);
      } catch (error) {
        console.error("Failed to submit schedule:", error);
      }
    };

    return {
      schedule,
      addBlock,
      removeBlock,
      addItem,
      removeItem,
      submitForm,
    };
  },
});
</script>

<style scoped>
.schedule-form {
  margin: 20px;
}

.block {
  border: 1px solid #ccc;
  padding: 15px;
  margin: 10px 0;
}

.item {
  margin: 10px 0;
  padding: 10px;
  background: #f5f5f5;
}

.block-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

button {
  margin: 5px;
  padding: 5px 10px;
}

input,
select,
textarea {
  margin: 5px;
  padding: 5px;
}
</style>
