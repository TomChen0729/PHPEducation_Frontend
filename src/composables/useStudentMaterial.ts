import { ref } from 'vue';

import axios from 'axios';

import { studentMaterialApi } from '../api/student-material.api';

import type { MaterialTopicNode } from '../types/material';

import type { StudentMaterialTopic } from '../types/student-material';

export function useStudentMaterial() {
  /*
   * =========================
   * Data
   * =========================
   */
  const topics = ref<StudentMaterialTopic[]>([]);

  const selectedTopic = ref<StudentMaterialTopic | null>(null);

  /*
   * 組合完成後交給
   * MaterialTreeViewer。
   */
  const topicTree = ref<MaterialTopicNode | null>(null);

  /*
   * =========================
   * Loading
   * =========================
   */
  const topicsLoading = ref(false);

  const contentLoading = ref(false);

  /*
   * =========================
   * Error
   * =========================
   */
  const errorMessage = ref('');

  /*
   * ============================================================
   * Topics
   * ============================================================
   */
  async function fetchTopics(courseId: number): Promise<boolean> {
    topicsLoading.value = true;

    errorMessage.value = '';

    try {
      const response = await studentMaterialApi.getTopics(courseId);

      topics.value = response.data.topics;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材主題取得失敗');

      topics.value = [];

      return false;
    } finally {
      topicsLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Topic Tree
   * ============================================================
   *
   * Topic
   * ↓
   * Chapter
   * ↓
   * Unit
   * ↓
   * Knowledge Card
   */
  async function fetchTopicTree(topic: StudentMaterialTopic): Promise<boolean> {
    selectedTopic.value = topic;

    topicTree.value = null;

    contentLoading.value = true;

    errorMessage.value = '';

    try {
      /*
       * Chapter
       */
      const chapterResponse = await studentMaterialApi.getChapters(topic.id);

      const chapters = await Promise.all(
        chapterResponse.data.chapters.map(async (chapter) => {
          /*
           * Unit
           */
          const unitResponse = await studentMaterialApi.getUnits(chapter.id);

          const units = await Promise.all(
            unitResponse.data.units.map(async (unit) => {
              /*
               * Knowledge Card
               */
              const cardResponse = await studentMaterialApi.getKnowledgeCards(unit.id);

              return {
                id: String(unit.id),

                name: unit.name,

                sort_order: unit.sort_order,

                knowledge_cards: cardResponse.data.knowledge_cards.map((card) => ({
                  id: String(card.id),

                  title: card.title,

                  content: card.content,

                  example: card.example,

                  sort_order: card.sort_order,
                })),
              };
            }),
          );

          return {
            id: String(chapter.id),

            name: chapter.name,

            sort_order: chapter.sort_order,

            units,
          };
        }),
      );

      topicTree.value = {
        id: String(topic.id),

        name: topic.name,

        sort_order: topic.sort_order,

        chapters,
      };

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材內容取得失敗');

      return false;
    } finally {
      contentLoading.value = false;
    }
  }

  function clearMaterial() {
    topics.value = [];

    selectedTopic.value = null;

    topicTree.value = null;

    errorMessage.value = '';
  }

  return {
    topics,

    selectedTopic,

    topicTree,

    topicsLoading,

    contentLoading,

    errorMessage,

    fetchTopics,

    fetchTopicTree,

    clearMaterial,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 404) {
    return '找不到此課程，或你目前沒有此課程的修課權限';
  }

  if (error.response?.status === 403) {
    return '你沒有查看此教材的權限';
  }

  const data = error.response?.data as
    | {
        message?: string;
      }
    | undefined;

  return data?.message ?? fallback;
}
