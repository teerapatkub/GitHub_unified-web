import { ApiRequestError, requestJson } from '../config/api-client.js';

export async function loadExerciseList(lessonId, options) {
  const paths = [
    `/api/exercises/list/${encodeURIComponent(lessonId)}`,
    `/api/exercises/${encodeURIComponent(lessonId)}`,
    `/api/lessons/${encodeURIComponent(lessonId)}/exercise`,
  ];
  for (const [index, path] of paths.entries()) {
    let data;
    try {
      data = await requestJson(path, options);
    } catch (error) {
      if (error.status === 404) continue;
      throw error;
    }
    if (index === 0 && !Array.isArray(data)) throw new ApiRequestError('invalid', 200);
    if (index === 0 && data.length > 0) return data;
    if (index === 1 && data?.exercise) return [data.exercise];
    if (index === 2 && data && typeof data === 'object' && !Array.isArray(data)) return [data];
  }
  return [];
}
